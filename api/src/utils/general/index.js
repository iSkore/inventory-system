/** ****************************************************************************************************
 * File: util.js
 * Project: api
 * @author Nick Soggin <iSkore@users.noreply.github.com> on 29-Jan-2019
 *******************************************************************************************************/
'use strict';
/* eslint max-lines: [ 2, 2000 ] */

const querystring = require( 'querystring' );

const
	{
		ERROR, ARGUMENT_ERROR, FUNCTION_ERROR, ARGUMENT_ERROR_PROPERTY,
		ARGUMENT_ERROR_BOOLEAN, ARGUMENT_ERROR_STRING, ARGUMENT_ERROR_NUMBER, ARGUMENT_ERROR_ARRAY,
		ARGUMENT_ERROR_OBJECT, ARGUMENT_ERROR_FUNCTION, ARGUMENT_ERROR_POWER, ARGUMENT_ERROR_HTTP,
		ARGUMENT_ERROR_EMAIL, ARGUMENT_ERROR_IPV4, ARGUMENT_ERROR_DOMAIN_NAME, LARGE_ARRAY_SIZE,
		FLOAT_EPSILON, DOUBLE_EPSILON, LOG_KIBIBYTE, EDGE
	} = require( './variables' );

const
	{
		isNaN, isUndefined, isNull, isBoolean,
		isString, isNumber, isPrimitive, isArray,
		isMap, isUint8Array, isInt8Array, isInt16Array,
		isUint16Array, isInt32Array, isUint32Array, isFloat32Array,
		isFloat64Array, isAnyArray, isObject, isBuffer,
		isFunction, isValue, instanceOf
	} = require( './objectLiterals' );

function isPowerOfTwo( n ) {
	return !( n & ( n - 1 ) );
}

function keys( o ) {
	return isObject( o ) ? Object.keys( o ) : o;
}

function values( o ) {
	return isObject( o ) ? Object.values( o ) : o;
}

function publicObject( o ) {
	return isObject( o ) ? keys( o ).reduce( ( r, i ) => ( r[ i ] = o[ i ], r ), {} ) : o;
}

function has( o, ...args ) {
	if( isString( o ) ) {
		return args.filter( i => o.indexOf( i ) !== -1 ).length === args.length;
	} else if( isArray( o ) ) {
		return args.filter( i => o.includes( i ) ).length === args.length;
	} else if( isObject( o ) ) {
		return args.filter( i => o.hasOwnProperty( i ) ).length === args.length;
	} else {
		return false;
	}
}

/**
 * findMissingKeys
 * @description pass in an array of keys required to be in an object and get the missing keys
 * @param {Object} o - object to check
 * @param {string[]|string} args - arguments to check against object keys
 * @return {Array} - array of missing keys
 * @example
 * findMissingKeys( { a: 0, b: 1 }, 'a' ) // -> [ 'b' ]
 */
function findMissingKeys( o, ...args ) {
	if( isArray( args[ 0 ] ) ) {
		args = args[ 0 ];
	}

	if( !isObject( o ) ) {
		throw new Error( ARGUMENT_ERROR_OBJECT );
	}

	const missing = [];

	for( let i = 0; i < args.length; i++ ) {
		if( !o.hasOwnProperty( args[ i ] ) ) {
			missing.push( args[ i ] );
		}
	}

	return missing;
}

function hasSome( o, ...args ) {
	if( isArray( args[ 0 ] ) ) {
		args = args[ 0 ];
	}

	if( isString( o ) ) {
		return !!( args.filter( i => o.indexOf( i ) !== -1 ).length );
	} else if( isArray( o ) ) {
		return !!( args.filter( i => o.includes( i ) ).length );
	} else if( isObject( o ) ) {
		return !!( args.filter( i => o.hasOwnProperty( i ) ).length );
	} else {
		return false;
	}
}

function omit( o, ...keys ) {
	return Object.keys( o )
		.reduce(
			( r, k ) => {
				if( !keys.includes( k ) ) {
					r[ k ] = o[ k ];
				}

				return r;
			}, {}
		);
}

function include( o, ...keys ) {
	return Object.keys( o )
		.reduce(
			( r, k ) => {
				if( keys.includes( k ) ) {
					r[ k ] = o[ k ];
				}

				return r;
			}, {}
		);
}

function sortObject( o ) {
	if( !isObject( o ) ) {
		throw new Error( ARGUMENT_ERROR_OBJECT );
	}

	const
		sorted = {},
		a      = [];

	for( const key in o ) {
		if( o.hasOwnProperty( key ) ) {
			a.push( key );
		}
	}

	a.sort();

	for( let i = 0; i < a.length; i++ ) {
		sorted[ a[ i ] ] = o[ a[ i ] ];
	}

	return sorted;
}

function sort( obj ) {
	if( isArray( obj ) ) {
		return obj.sort();
	} else if( isObject( obj ) ) {
		return sortObject( obj );
	} else {
		throw new Error( ARGUMENT_ERROR_ARRAY );
	}
}

function stringify( n ) {
	if( isObject( n ) ) {
		return JSON.stringify( n );
	} else {
		throw new Error( ARGUMENT_ERROR_OBJECT );
	}
}

function parse( n ) {
	if( !isPrimitive( n ) ) {
		return n;
	}

	if( isString( n ) ) {
		if( isBoolean( n ) || n.startsWith( '{' ) || n.startsWith( '[' ) || n.startsWith( '"' ) ) {
			return JSON.parse( n );
		} else {
			return n;
		}
	} else {
		throw new Error( 'Argument Error - expected string' );
	}
}

function map( o, fn ) {
	if( isArray( o ) && isFunction( fn ) ) {
		return o.map( fn );
	} else if( isObject( o ) && isFunction( fn ) ) {
		return keys( o )
			.reduce( ( r, i ) => {
				fn( i, r[ i ], r );
				return r;
			}, o );
	} else {
		if( !isFunction( fn ) ) {
			throw new Error( ARGUMENT_ERROR_FUNCTION );
		} else {
			throw new Error( ARGUMENT_ERROR_ARRAY );
		}
	}
}

function startsWith( str, n ) {
	return isString( str ) && str.startsWith( n );
}

function isValidJSON( str ) {
	if( !isString( str ) || isUndefined( str ) || isNull( str ) ) {
		return false;
	}

	return /^[\],:{}\s]*$/.test(
		str
			.replace( /\\["\\/bfnrtu]/g, '@' )
			.replace( /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?/g, ']' )
			.replace( /(?:^|:|,)(?:\s*\[)+/g, '' )
	);
}

function isValidHTTPMethod( n ) {
	return (
		isString( n ) &&
		/^(GET|POST|PUT|PATCH|DELETE|COPY|HEAD|OPTIONS|CONNECT)$/.test( n.toUpperCase() )
	);
}

function isValidWebDAVMethod( n ) {
	return (
		isString( n ) &&
		(
			isValidHTTPMethod( n ) ||
			/^(LINK|UNLINK|PURGE|LOCK|UNLOCK|PROPFIND|VIEW)$/.test( n.toUpperCase() )
		)
	);
}

function isProtocol( n ) {
	return (
		isString( n ) &&
		/s?m?h?f?t?tps?|wss|file/i.test( n.toLowerCase() )
	);
}

function isValidEmail( n ) {
	return /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/i.test( n );
}

function isValidIPv4( n ) {
	return /\b((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\.|$)){4}\b/.test( n );
}

function isValidDomainName( n ) {
	return (
		n === 'localhost' ||
		/^(?:(?:(?:[a-zA-Z0-9-]+):\/{1,3})?(?:[a-zA-Z0-9])(?:[a-zA-Z0-9-.]){1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+|\[(?:(?:(?:[a-fA-F0-9]){1,4})(?::(?:[a-fA-F0-9]){1,4}){7}|::1|::)\]|(?:(?:[0-9]{1,3})(?:\.[0-9]{1,3}){3}))(?::[0-9]{1,5})?$/i.test( n )
	);
}

function isPath( n ) {
	return /(\\|\/)([a-z0-9\s_@\-^!#$%&+={}[\]]+)(\\|\/)/i.test( n );
}

function isValidQueryString( qs ) {
	const t = querystring.parse( qs );
	return isString( qs ) && isObject( t );
}

function buildQueryString( qs ) {
	if( !isObject( qs ) ) {
		throw new Error( ARGUMENT_ERROR_OBJECT );
	}

	function deepCheck( o ) {
		map( o, ( k, v ) => {
			if( isObject( v ) ) {
				o[ k ] = querystring.stringify( v, ',', ':' );
			}
		} );

		return o;
	}

	qs = deepCheck( qs );
	qs = querystring.stringify( qs );

	if( isValidQueryString( qs ) ) {
		return `?${ qs }`;
	} else {
		throw new Error( FUNCTION_ERROR );
	}
}

function isEmpty( o ) {
	return !o || ( isArray( o ) ? !o.length : !keys( o ).length );
}

function flatten( arr, result = [] ) {
	const
		length = arr && arr.length;

	if( !length ) {
		return result;
	}

	let index = -1;

	while( ++index < length ) {
		let value = arr[ index ];
		if( isArray( value ) ) {
			flatten( value, result );
		} else {
			result[ result.length ] = value;
		}
	}

	return result;
}

function extractIP( inets ) {
	return flatten( values( inets ) )
		.filter( a => !a.internal && a.family !== 'IPv6' )
		.map( a => a.address )[ 0 ] || 'offline';
}

/**
 * defineProperty
 * @description
 * defines a `__getter__` and `__setter__` for key in an object
 * @param {Object} o - object to modify
 * @param {string} name - name of key in object to set
 * @param {Object|Function} g - __getter__  object properties to set or __getter__ method
 * @param {Object|Function} s - __setter__ object properties to set or __setter__ method
 * @return {Object} - object with the applied modification
 */
function defineProperty( o, name, g, s = null ) {
	let prop;
	if( !s && isObject( g ) ) {
		return Object.defineProperty( o, name, g );
	} else {
		prop = {
			enumerable: false,
			set: s || undefined,
			get: g || undefined
		};
	}

	if( o.hasOwnProperty( name ) ) {
		throw new Error(
			`Property "${ name }" already exists on object: ` +
			JSON.stringify( Object.getOwnPropertyDescriptor( o, name ) )
		);
	}

	Object.defineProperty( o, name, prop );
	return o;
}

/**
 * nonEnumerableProperty
 * @description
 * defines a private property in an object
 * @param {Object} o - object to modify
 * @param {string} name - name of key in object to set
 * @param {*} val - value to set for key
 * @return {Object} - object with the applied modification
 */
function nonEnumerableProperty( o, name, val ) {
	if( !isObject( o ) ) {
		throw new Error( ARGUMENT_ERROR_OBJECT );
	}

	return defineProperty( o, name, {
		configurable: true,
		writable: true,
		enumerable: false,
		value: val
	} );
}

function pad2( n ) {
	return n < 10 ? '0' + n : n;
}

function secondsToReadableTime( n ) {
	const
		sec = parseInt( n, 10 ),
		h   = pad2( ~~( sec / 3600 ) ),
		m   = pad2( ~~( ( sec - ( h * 3600 ) ) / 60 ) ),
		s   = pad2( sec - ( h * 3600 ) - ( m * 60 ) );
	return `${ h }:${ m }:${ s }`;
}

function isObjectId( id ) {
	return /^[\da-f]{24}$/i.test( id );
}

function isObjectIdReference( id ) {
	return /^\$ref:([\da-f]{24})$/i.test( id );
}

function extractReferenceId( id ) {
	if( !isObjectIdReference( id ) ) {
		return null;
	}

	return id.match( /^\$ref:([\da-f]{24})$/i )[ 0 ];
}

/**
 * getDeepKeys
 * @param {object} o - object to extract keys
 * @returns {array} - array of deep keys
 * @example
 * getDeepKeys( { a: { b: true } } ); // -> [ 'a', 'a.b' ]
 */
function getDeepKeys( o ) {
	const keys = [];
	for( const k in o ) {
		if( !o.hasOwnProperty( k ) ) {
			continue;
		}

		keys.push( k );
		if( typeof o[ k ] === 'object' ) {
			const subKeys = getDeepKeys( o[ k ] );
			keys.push( ...subKeys.map( subKey => k + '.' + subKey ) );
		}
	}

	return keys;
}

/**
 * objectFilteredForRegex
 * @description returns an object with key-value pairs that match regex
 * @param {Object} obj - object to evaluate
 * @param {RegExp} rx - regex to compare object's keys to
 * @returns {{}} - filtered object with keys matching regex
 * @example
 * objectFilteredForRegex( { a: 0, b: 1 }, /A/i ) // -> returns { a: 0 }
 */
function objectFilteredForRegex( obj, rx ) {
	if( !isObject( obj ) ) {
		throw new Error( ARGUMENT_ERROR_OBJECT );
	}

	const keys = {};
	for( const key in obj ) {
		if( obj.hasOwnProperty( key ) && rx.test( key ) ) {
			keys[ key ] = obj[ key ];
		}
	}
	return keys;
}

/**
 * getValueForRegexKey
 * @description allows key-value extraction from an object based on a regex like: <code>obj[ /reg/i ]</code>
 * @param {Object} obj - object to evaluate
 * @param {RegExp} rx - regex to compare object's keys to
 * @returns {*} value extracted from an object
 * @example
 * getValueForRegexKey( { a: 0, b: 1 }, /B/i ) // -> returns 1
 */
function getValueForRegexKey( obj, rx ) {
	if( !isObject( obj ) ) {
		throw new Error( ARGUMENT_ERROR_OBJECT );
	}

	for( const key in obj ) {
		if( obj.hasOwnProperty( key ) && rx.test( key ) ) {
			return obj[ key ];
		}
	}
}

/**
 * arrayFilteredForRegex
 * @description filters values in an array for regex
 * @param {Array} arr - array to filter
 * @param {RegExp} rx - regex to filter for
 * @returns {Array} - results of filter
 * @example
 * arrayFilteredForRegex( [ 'a', 'b' ], /a/i ) // -> returns [ 'a' ]
 */
function arrayFilteredForRegex( arr, rx ) {
	if( !isArray( arr ) ) {
		throw new Error( ARGUMENT_ERROR_ARRAY );
	}

	return arr.filter( i => rx.test( i ) );
}

/**
 * removeItemsFromArray
 * @description
 * removes items from an array and returns result
 * @param {Array} arr - array to filter
 * @param {*} args - params to filter
 * @returns {Array} - results of filter
 * @example
 * removeItemsFromArray( [ 'a', 'b', 'c' ], 'c' ) // -> returns [ 'a', 'b' ]
 */
function removeItemsFromArray( arr, ...args ) {
	if( !isArray( arr ) ) {
		throw new Error( ARGUMENT_ERROR_ARRAY );
	} else if( isArray( args[ 0 ] ) ) {
		args = args[ 0 ];
	}

	return arr.filter( i => !args.includes( i ) );
}

/**
 * removeItemsFromObject
 * @description
 * removes items from an object and returns result
 * @param {Object} obj - object to filter
 * @param {*} args - params to filter
 * @returns {Object} - results of filter
 * @example
 * removeItemsFromObject( { a: 0, b: 1 }, 'a' ) // -> returns { b: 1 }
 */
function removeItemsFromObject( obj, ...args ) {
	if( !isObject( obj ) ) {
		throw new Error( ARGUMENT_ERROR_OBJECT );
	} else if( isArray( args[ 0 ] ) ) {
		args = args[ 0 ];
	}

	const ks = keys( obj );

	ks.forEach(
		i => !args.includes( i ) || delete obj[ i ]
	);

	return obj;
}

/**
 * wait
 * @description similar to <code>usleep</code> in C++
 * @param {milliseconds} t - time to wait
 * @param {*} [v] - optional value to pass through when promise resolves
 * @returns {Promise<any>} - promise to be resolved in [t] milliseconds
 * @example
 * wait( 100, 'hello world' )
 *     .then() // -> will pass 'hello world' in 100ms
 */
function wait( t, v ) {
	if( !isNumber( t ) ) {
		throw new Error( ARGUMENT_ERROR_NUMBER );
	}

	return new Promise(
		res => setTimeout( () => res( v ), t )
	);
}

/**
 * waitFor
 * @description wait for a condition to succeed
 * @param {function} condition - condition to evaluate
 * @param {milliseconds} frequency - the frequency to check the condition
 * @param {boolean} immediateInvoke - immediately invoke the function when `waitFor` is called
 * @return {Promise<any>} - promise that will resolve after the condition succeeds
 * @example
 * waitFor( <network request> = 200, 5000 )
 *     .then() // -> will not resolve until the condition succeeds
 */
function waitFor( condition, frequency, immediateInvoke = true ) {
	return new Promise(
		res => {
			const
				checkCondition = () => new Promise(
					( rev, rex ) => condition()
						.then( d => !!d ? rev() : rex() )
						.catch( rex )
				),
				_waitFor       = () => setTimeout(
					() => checkCondition()
						.then( res )
						.catch( () => _waitFor() ),
					frequency
				);

			if( immediateInvoke ) {
				return checkCondition()
					.then( res )
					.catch( () => _waitFor() );
			} else {
				return _waitFor();
			}
		}
	);
}


/**
 * absoluteValue
 * @param {number} n - number to compute absolute value
 * @returns {number} - will always be a positive number
 * @example
 * absoluteValue( -50 ) // -> returns 50
 */
function absoluteValue( n ) {
	if( ~~n === n ) {
		return ( n ^ ( n >> 31 ) ) - ( n >> 31 );
	} else {
		return Math.abs( n );
	}
}

/**
 * performanceDifference
 * @description
 *     Measures the performance difference between a newTime and oldTime.
 *     Assumed that newTime and oldTime will be similar unit values
 * @param {number|milliseconds} newTime - new value to compare
 * @param {number|milliseconds} oldTime - old value to compare
 * @returns {string} - pretty string that evaluates if the delta is an increase or decrease
 * @example
 * performanceDifference( 50, 100 ) // -> Performance increase of: 50%
 */
function performanceDifference( newTime, oldTime ) {
	const time = ( ( newTime - oldTime ) / oldTime ) * 100;

	if( time < 0 ) {
		return `Performance increase of: ${ absoluteValue( time ) }%`;
	} else if( time > 0 ) {
		return `Performance decrease of: ${ absoluteValue( time ) }%`;
	} else {
		return 'Performance did not change';
	}
}

/**
 * bytesToSize
 * @description
 *     Convert bytes to human readable format
 * @param {bytes} bytes - unit in bytes to parse
 * @returns {string} - pretty string in the format [n unit]
 * @example
 * bytesToSize( 1073741824 ) // -> 1 GB
 */
function bytesToSize( bytes ) {
	if( !bytes ) {
		return '0 Byte';
	}

	const
		sizes = [ 'Bytes', 'KB', 'MB', 'GB', 'TB' ],
		i     = ~~( Math.log( bytes ) / LOG_KIBIBYTE );

	return Math.round( bytes / Math.pow( 1024, i ) ) + ' ' + sizes[ i ];
}

/**
 * sizeToBytes
 * @description
 * Convert human readable format to bytes
 * <h5>Recognized conversion units:</h5>
 * <table class="params">
 *     <thead><tr><th>(Unit)</th><th>[Standard Base 10]</th><th>[Digital Storage Unit 2ⁿ]</th></tr></thead>
 *     <tbody>
 *         <tr><td>(B)</td><td>Bytes</td><td>Bytes</td></tr>
 *         <tr><td>(kB|KiB)</td><td>Kilobytes</td><td>Kibibytes</td></tr>
 *         <tr><td>(mB|MiB)</td><td>Megabytes</td><td>Megibytes</td></tr>
 *         <tr><td>(gB|GiB)</td><td>Gigabytes</td><td>Gigibytes</td></tr>
 *         <tr><td>(tB|TiB)</td><td>Terabytes</td><td>Teribytes</td></tr>
 *     </tbody>
 * </table>
 * @param {string|number} bytes - string represending the bytes and unit to calculate the conversion
 * @returns {bytes} - returns the number of bytes represented by the string
 * @example
 * sizeToBytes( '1 KB' )        // -> 1000
 * sizeToBytes( '1 KiB' )       // -> 1024
 * sizeToBytes( '1 Kilobytes' ) // -> 1000
 * sizeToBytes( '1 Kibibytes' ) // -> 1024
 */
function sizeToBytes( bytes ) {
	let match;

	return !bytes ? 0 : bytes === +bytes ? bytes :
		( match = /^(\d+) ?(tB|Ter[a,i]bytes?)$/gim.exec( bytes ) ) ?
			/tera/gi.test( match[ 2 ] ) ? match[ 1 ] * 1000000000000 : match[ 1 ] * 1099511627776 :
			( match = /^(\d+) ?(gB|Gig[a,i]bytes?)$/gim.exec( bytes ) ) ?
				/giga/gi.test( match[ 2 ] ) ? match[ 1 ] * 1000000000 : match[ 1 ] * 1073741824 :
				( match = /^(\d+) ?(mB|Meg[a,i]bytes?)$/gim.exec( bytes ) ) ?
					/mega/gi.test( match[ 2 ] ) ? match[ 1 ] * 1000000 : match[ 1 ] * 1048576 :
					( match = /^(\d+) ?(kB|Ki(?:lo|bi)bytes?)$/gim.exec( bytes ) ) ?
						/kilo/gi.test( match[ 2 ] ) ? match[ 1 ] * 1000 : match[ 1 ] * 1024 :
						( match = /^(\d+) ?(?:B|Bytes?)$/gim.exec( bytes ) ) ? +match[ 1 ] : 0;

	// Consider digital storage unit specifications
	// return !bytes ? 0 : bytes === +bytes ? bytes :
	// 	( match = /^(\d+) ?(tB|TiB|Ter[a,i]bytes?)$/gim.exec( bytes ) ) ?
	// 		/tB|tera/gi.test( match[ 2 ] ) ? match[ 1 ] * 1000000000000 : match[ 1 ] * 1099511627776 :
	// 		( match = /^(\d+) ?(gB|GiB|Gig[a,i]bytes?)$/gim.exec( bytes ) ) ?
	// 			/gB|giga/gi.test( match[ 2 ] ) ? match[ 1 ] * 1000000000 : match[ 1 ] * 1073741824 :
	// 			( match = /^(\d+) ?(mB|MiB|Meg[a,i]bytes?)$/gim.exec( bytes ) ) ?
	// 				/mB|mega/gi.test( match[ 2 ] ) ? match[ 1 ] * 1000000 : match[ 1 ] * 1048576 :
	// 				( match = /^(\d+) ?(kB|KiB|Ki(?:lo|bi)bytes?)$/gim.exec( bytes ) ) ?
	// 					/kB|kilo/gi.test( match[ 2 ] ) ? match[ 1 ] * 1000 : match[ 1 ] * 1024 :
	// 					( match = /^(\d+) ?(?:B|Bytes?)$/gim.exec( bytes ) ) ? +match[ 1 ] : 0;
}

/**
 * radixToNumber
 * @description convert possible radix string to radix number value
 * @param {number|string} radix - a number or string to convert radix to a number
 * @returns {number} 2, 8, 10, or 16 to specify radix
 */
function radixToNumber( radix ) {
	if( radix === 'binary' ) {
		radix = 2;
	} else if( radix === 'octal' ) {
		radix = 8;
	} else if( radix === 'base10' ) {
		radix = 10;
	} else {
		radix = 16;
	}

	return radix;
}

/**
 * generateRandomNumber
 * @description generate a random number between two values
 * @param {number} [min=0] - minimum possible random value
 * @param {number} [max=16] - maximum possible random value
 * @param {boolean} [floored=true] - should value be floored
 * @returns {number} - random generated number
 */
function generateRandomNumber( min = 0, max = 16, floored = true ) {
	let n;

	if( min < 0 ) {
		n = min + Math.random() * ( absoluteValue( min ) + max );
	} else {
		n = min + Math.random() * max;
	}

	return floored ? n | 0 : n;
}

/**
 * generateRandomString
 * @description generate a random string with radix encoding
 * @param {number} [min=0] - minimum possible random value
 * @param {number} [max=16] - maximum possible random value
 * @param {radix} [radix=16] - return radix type
 * @param {boolean} [floored=true] - should value be floored
 * @returns {string} - random generated string with specified radix encoding
 */
function generateRandomString( min = 0, max = 16, radix = 16, floored = true ) {
	radix = radixToNumber( radix );
	return generateRandomNumber( min, max, floored ).toString( radix );
}

/**
 * generateRandomHex
 * @description generate random hex value <code>[0-9A-F]</code>
 * @returns {string} - random generated hex character
 */
function generateRandomHex() {
	return generateRandomString();
}

/**
 * getRandomInt
 * @description generate random integer value <code>[0-9]</code>
 * @param {number} min - minimum generated value
 * @param {number} max - maximum generated value
 * @returns {number} random number between minimum and maximum specified values
 */
function getRandomInt( min, max ) {
	min = ~~min;
	max = ~~max;
	return ~~( Math.random() * ( max - min ) ) + min;
}

/**
 * replaceMatchesWithValue
 * @description - find and replace items in a string with RegExp identifier
 * @param {string} item - item to mutate
 * @param {RegExp} identifier - match to find in the item
 * @param {string} replacement - value to replace the match with
 * @returns {*} - string with replacement values
 * @example
 * replaceMatchesWithValue( "abc", /abc/i, "123" )
 */
function replaceMatchesWithValue( item, identifier, replacement ) {
	if( !isString( item ) ) {
		throw new Error( ARGUMENT_ERROR_STRING );
	} else if( !isNumber( replacement ) && !isString( replacement ) ) {
		throw new Error( ARGUMENT_ERROR );
	}

	let check;

	if( identifier instanceof RegExp ) {
		check = item.match( identifier );
	} else {
		check = item.includes( identifier );
	}

	if( check ) {
		return item.replace( identifier, replacement );
	} else {
		return item;
	}
}

/**
 * recursivePromiseResolve
 * @description recursively resolve all Promise's in an data object
 * @param {object|array|Promise<*>} P - an object, array, or anything to recursively resolve
 * @returns {*} the original object in the same structure with all promises resolved
 * @example
 * recursivePromiseResolve( { key: [ Promise.resolve( 2 ) ] } )
 *     .then() // -> { key: [ 2 ] }
 */
function recursivePromiseResolve( P ) {
	const
		map   = ( pl, n ) => Promise.all(
			pl.map( p => Promise.resolve( p ).then( n ) )
		),
		props = o => {
			const arr = [];

			keys( o )
				.map(
					k => arr.push(
						Promise.resolve( o[ k ] )
							.then( v => ( o[ k ] = v, o ) )
					)
				);

			return Promise.all( arr ).then( () => ( o ) );
		},
		rNP   = o => Promise.resolve( o )
			.then( o => {
				if( isArray( o ) ) {
					return map( o, rNP );
				} else if( typeof o === 'object' ) {
					const oa = {};

					for( const ka in o ) {
						if( o.hasOwnProperty( ka ) ) {
							oa[ ka ] = rNP( o[ ka ] );
						}
					}

					return props( oa );
				}
				return o;
			} );

	return ( rNP )( P );
}

/**
 * objectId
 * @description
 * similar to a MongoId but not strictly compliant.
 * starts with 8 bytes of a hexadecimal timestamp followed by
 * 16 bytes (or otherwise specified) of random hexadecimal bytes
 * @param {number} len - number of random bytes to append to timestamp
 * @returns {string}
 * returns an ObjectId of random bytes with the length specified
 * @example
 * objectId() // -> "5a5cfafcbf2752b429d4cba7"
 */
function objectId( len = 16 ) {
	const timestamp = ( new Date().getTime() / 1000 | 0 ).toString( 16 );
	return timestamp + ( 'x'.repeat( len ) ).replace( /[x]/g, generateRandomHex ).toLowerCase();
}

/**
 * convertHighResolutionTime
 * @description
 * converts a "final" high resolution time stamp into seconds, milliseconds, and nanoseconds
 * @param {hrtime} hrtime - high resolution time tuple returned from <code>process.hrtime</code>
 * @returns {{seconds: number, milli: number, micro: number, nano: number}}
 * seconds, milliseconds, microseconds, nanoseconds based on passed in high resolution time tuple
 * @example
 * const
 *     start = process.hrtime(),
 *     end   = process.hrtime( start );
 *
 * convertHighResolutionTime( end ); // -> { seconds: 0.000002, milli: 0.002, micro: 2, nano: 2000 }
 */
function convertHighResolutionTime( hrtime ) {
	if( !isArray( hrtime ) ) {
		throw new Error( ARGUMENT_ERROR_ARRAY );
	} else if( hrtime.length !== 2 ) {
		throw new Error( ARGUMENT_ERROR_PROPERTY( 'hrtime_tuple' ) );
	}

	const
		nano    = ( hrtime[ 0 ] * 1e9 ) + hrtime[ 1 ],
		micro   = nano / 1e3,
		milli   = nano / 1e6,
		seconds = nano / 1e9;

	return { seconds, milli, micro, nano };
}

/**
 * convertHRTimeToReadable
 * @description
 * converts a high precision nanosecond tuple to readable format
 * @param {hrtime} hrtime - hrtime time to convert
 * @return {string} - string format with proper unit designation (ns, μs, ms, s)
 * @example
 * convertHRTimeToReadable( [ 0, 5000 ] ); // -> '5.00 μs'
 */
function convertHRTimeToReadable( hrtime ) {
	const t = convertHighResolutionTime( hrtime );

	return t.nano < 1000 ? `${ toFixed( t.nano ) } ns` :
		t.nano < 1000000 ? `${ toFixed( t.micro ) } μs` :
			t.nano < 1000000000 ? `${ toFixed( t.milli ) } ms` :
				`${ toFixed( t.seconds ) } s`;
}

/**
 * isUUIDv4
 * @description should evaluate if a parameter (uuid) is RFC-4122 Section 4.4 (Version 4) compliant
 * @param {uuid} uuid
 * random string of bytes assumed to be in the following format [xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx]
 * @returns {boolean}
 * signifies if the passed in UUID is RFC-4122 Section 4.4 compliant
 * @example
 * isUUIDv4( 'b33ce0f0-fadc-11e7-8da3-d19e5c798a48' ) // -> false
 */
function isUUIDv4( uuid ) {
	if( !isString( uuid ) ) {
		throw new Error( ARGUMENT_ERROR_STRING );
	}

	return /[a-f0-9]{8}-?[a-f0-9]{4}-?4[a-f0-9]{3}-?[89ab][a-f0-9]{3}-?[a-f0-9]{12}/i.test( uuid );
}

/**
 * ascendingSort
 * @description
 * basic evaluation wrapper for the <code>sort<code> function
 * @param {number} n1 - first number comparision
 * @param {number} n2 - second number comparision
 * @returns {number} - delta of first and second float
 * @example
 * ascendingSort( 10, 9 ) // -> 1
 */
function ascendingSort( n1, n2 ) {
	if( !isNumber( n1, n2 ) ) {
		throw new Error( ARGUMENT_ERROR_NUMBER );
	}

	return n1 - n2;
}

/**
 * clamp
 * @description
 * clamps a value between a minimum float and maximum float value
 * @param {number} n - number to clamp
 * @param {number} min - minimum to clamp to
 * @param {number} max - maximum to clamp to
 * @returns {number} - number clamped to min and max value
 * @example
 * clamp( 0.900001, 0.1, 0.9 ) // -> 0.9
 */
function clamp( n, min, max ) {
	return Math.max( min, Math.min( n, max ) );
}

/**
 * absoluteMinimum
 * @description
 * evaluates the absolute minimum between two numbers
 * @param {number} n1 - first number comparision
 * @param {number} n2 - second number comparision
 * @returns {number} - minimum number of the two values
 * @example
 * absoluteMinimum( 1.5, 2.1 ) // -> 1.5
 */
function absoluteMinimum( n1, n2 ) {
	return Math.min( absoluteValue( n1 ), absoluteValue( n2 ) );
}

/**
 * absoluteMaximum
 * @description
 * evaluates the absolute maximum between two numbers
 * @param {number} n1 - first number comparision
 * @param {number} n2 - second number comparision
 * @returns {number} - maximum number of the two values
 * @example
 * absoluteMaximum( 1.5, 2.1 ) // -> 2.1
 */
function absoluteMaximum( n1, n2 ) {
	return Math.max( absoluteValue( n1 ), absoluteValue( n2 ) );
}

/**
 * precisionDelta
 * @description
 * evaluates if two numbers are approximately equal to the specified tolerance
 * precision is guaranteed up to 32-bit floats
 * please unsign the number or use the <code>doublePrecision</code> method if 64-bit evaluation is necessary
 * @param {number} n1 - first number comparision
 * @param {number} n2 - second number comparision
 * @param {number} absoluteTolerance - fixed minimal tolerance (set to 0 to ignore)
 * @param {number} relativeTolerance - tolerance that scales with n1 / n2 (set to 0 to ignore)
 * @returns {boolean} - returns true if precision delta is within specified tolerance
 * @example
 * precisionDelta( 100, 101, 0.99999999999999999, 0 ) // -> true
 * precisionDelta( 100, 101, 0.9999999999999999, 0 ) // -> false
 */
function precisionDelta( n1, n2, absoluteTolerance = 0, relativeTolerance = 0 ) {
	if( !isNumber( n1, n2, absoluteTolerance, relativeTolerance ) ) {
		throw new Error( ARGUMENT_ERROR_NUMBER );
	}

	const delta = absoluteValue( n1 - n2 );

	return delta <= absoluteTolerance ||
		delta <= relativeTolerance * absoluteMinimum( n1, n2 ) ||
		n1 === n2;
}

/**
 * floatPrecisionDelta
 * @description
 * evaluates if two numbers are approximately equal with respect to the floating point (32-bit) epsilon
 * @param {number} n1 - first float comparision
 * @param {number} n2 - second float comparision
 * @returns {boolean} - returns true if precision delta is within float epsilon tolerance (1.19209290e-7)
 * @example
 * floatPrecision( 100, 100.00001 ) // -> true
 * floatPrecision( 100, 100.0001 ) // -> false
 */
function floatPrecisionDelta( n1, n2 ) {
	return precisionDelta( n1, n2, FLOAT_EPSILON, FLOAT_EPSILON );
}

/**
 * doublePrecisionDelta
 * @description
 * evaluates if two numbers are approximately equal with respect to the double-precision floating-point (64-bit) epsilon
 * @param {number} n1 - first double comparison
 * @param {number} n2 - second double comparison
 * @returns {boolean} - returns true if precision delta is within double epsilon tolerance (2.2204460492503131e-16)
 * @example
 * doublePrecision( 100, 100.00000000000001 ) // -> true
 * doublePrecision( 100, 100.0000000000001 ) // -> false
 */
function doublePrecisionDelta( n1, n2 ) {
	return precisionDelta( n1, n2, DOUBLE_EPSILON, DOUBLE_EPSILON );
}

/**
 * percentError
 * @description
 * evaluates the precision of your calculations
 * Warning: cannot evaluate percent difference from zero (i.e if n2 is zero, the function will return false)
 * @param {number} n1 - the experimental value
 * @param {number} n2 - the expected or theoretical value
 * @param {number} acceptedDelta - expected to be a number between 0 and 1 evaluated as a percentage
 * @return {boolean} - if the first and second comparison are within the accepted tolerance
 * @example
 * percentError( 1, 1.09, 0.09 ) // -> true
 * percentError( 1, 1.09, 0.08 ) // -> false
 */
function percentError( n1, n2, acceptedDelta ) {
	if( !isNumber( n1, n2, acceptedDelta ) ) {
		throw new Error( ARGUMENT_ERROR_NUMBER );
	} else if( ~~acceptedDelta !== 0 ) {
		throw new Error( ARGUMENT_ERROR_PROPERTY( 'acceptedDelta must be a number between 0 and 1' ) );
	}

	if( acceptedDelta === 0 ) {
		return n1 === n2;
	}

	return acceptedDelta >= absoluteValue( ( n1 - n2 ) / n2 );
}

/**
 * percentDifference
 * @description
 * percentDifference will find the percent difference between two positive numbers greater than 0.
 * <pre>
 *     <u>| ΔV |</u>      <u>| Vⁱ - V² |</u>
 *     <u>( ΣV )</u>  or  <u>( Vⁱ + V² )</u>
 *       2              2
 * </pre>
 * @param {number} n1 - first value
 * @param {number} n2 - second value
 * @returns {number} - expected to be a number between 0 and 1 evaluated as a percentage
 * @example
 * percentDifference( 50, 100 ) // -> 0.6666666666666666
 */
function percentDifference( n1, n2 ) {
	if( !isNumber( n1, n2 ) ) {
		throw new Error( ARGUMENT_ERROR_NUMBER );
	}

	return ( absoluteValue( n1 - n2 ) / ( ( n1 + n2 ) / 2 ) );
}

/**
 * percentChange
 * @description
 * percentChange will quantify the change from one number to another and express the change as an increase or decrease.
 * <pre>
 *     <u>( V² - Vⁱ )</u>
 *        | Vⁱ |
 * </pre>
 * @param {number} n1 - first value
 * @param {number} n2 - second value
 * @returns {number} - expected to be a number between 0 and 1 evaluated as a percentage
 * @example
 * percentChange( 80, 100 ) // -> 0.25
 * percentChange( 100, 80 ) // -> -0.2
 */
function percentChange( n1, n2 ) {
	if( !isNumber( n1, n2 ) ) {
		throw new Error( ARGUMENT_ERROR_NUMBER );
	}

	return ( ( n2 - n1 ) / absoluteValue( n1 ) );
}


/**
 * sum
 * @description
 * returns the sum of a list of parameters or array of numbers
 * @param {number[]} args - arguments to operate on
 * @returns {number} - result of cumulative additions
 * @example
 * sum( 1, 2, 3 ); // -> 6
 */
function sum( ...args ) {
	if( isArray( args[ 0 ] ) ) {
		args = args[ 0 ];
	}

	if( !isNumber( ...args ) ) {
		throw new Error( ARGUMENT_ERROR_NUMBER );
	}

	let n = 0;

	for( let i = 0; i < args.length; i++ ) {
		n += args[ i ];
	}

	return n;
}

/**
 * mean
 * @description
 * returns the mean of a list of parameters or array of numbers
 * @param {number[]} args - arguments to operate on
 * @returns {number} - result of argument mean value
 * @example
 * mean( 1, 2, 3 ) // -> 2
 */
function mean( ...args ) {
	return sum( ...args ) / args.length;
}

/**
 * isSemanticVersion
 * @description
 * should evaluate if a string is semantic version compliant
 * @param {string} n
 * string of assumed to be in the following format [x.x.x, x.x.x-xxx, x.x.x-xx.x]
 * @returns {boolean}
 * signifies if the string is a semantic version
 * @example
 * isSemanticVersion( '0.2.4' ) // -> false
 */
function isSemanticVersion( n ) {
	if( !isString( n ) ) {
		return false;
	}

	return ( /\bv?(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-[\da-z-]+(?:\.[\da-z-]+)*)?(?:\+[\da-z-]+(?:\.[\da-z-]+)*)?\b/ig ).test( n );
}

/**
 * flattenObject
 * @description
 * returns a recursively flattened object
 * @param {Object} obj - object to flatten
 * @param {Object} r - recursion variable
 * @return {{}} - flatten results
 */
function flattenObject( obj, r = {} ) {
	for( const i in obj ) {
		if( !obj.hasOwnProperty( i ) ) {
			continue;
		}

		if( isObject( obj[ i ] ) ) {
			r = { ...r, ...flattenObject( obj[ i ], r ) };
		} else {
			r[ i ] = obj[ i ];
		}
	}

	return r;
}

/**
 * deepValues
 * @description
 * returns recursively gathered values
 * @param {Object} obj - object to collect
 * @param {Object} r - recursion variable
 * @return {Array} - value results
 */
function deepValues( obj, r = [] ) {
	if( !isArray( r ) ) {
		throw new Error( ARGUMENT_ERROR_ARRAY );
	}

	for( const i in obj ) {
		if( !obj.hasOwnProperty( i ) ) {
			continue;
		}

		if( isObject( obj[ i ] ) ) {
			r.concat( deepValues( obj[ i ], r ) );
		} else if( isArray( obj[ i ] ) ) {
			r.concat( obj[ i ] );
		} else {
			r.push( obj[ i ] );
		}
	}

	return r;
}

/**
 * minAndMax
 * @description
 * calculate minimum and maximum values of an array
 * @param {Array} arr - array to calculate
 * @returns {{min: number, max: number}} - "min" and "max" respectively
 */
function minAndMax( arr ) {
	if( !isAnyArray( arr ) ) {
		throw new Error( ARGUMENT_ERROR_ARRAY );
	}

	let min = Infinity, max = -Infinity, i = 0;

	for( ; i < arr.length; i++ ) {
		if( min >= arr[ i ] ) {
			min = arr[ i ];
		} else if( max <= arr[ i ] ) {
			max = arr[ i ];
		}
	}

	return { min, max };
}

/**
 * escapeRegExp
 * @description
 * escape regular expression string
 * @param {string} str - string to escape
 * @return {*} - escaped string
 * @example
 * escapeRegExp( '(?=[[]])' ) // -> '\\(\\?=\\[\\[\\]\\]\\)'
 */
function escapeRegExp( str ) {
	if( !isString( str ) ) {
		throw new Error( ARGUMENT_ERROR_STRING );
	}

	return str.replace( /[-[\]/{}()*+?.\\^$|]/g, '\\$&' );
}

/**
 * regexpFromString
 * @description
 * wrapper on RegExp construction
 * @param {string} str - regex string
 * @param {string} [flags="igm"] regex flags
 * @returns {RegExp} - returns build RegExp object
 */
function regexpFromString( str, flags = 'igm' ) {
	if( !isString( str, flags ) ) {
		throw new Error( ARGUMENT_ERROR_STRING );
	}

	return new RegExp( str, flags );
}

/**
 * testUppercase
 * @description
 * test number of uppercase letters in string
 * @param {string} str - string to validate
 * @param {number} [n=0] - number of uppercase letters required
 * @return {boolean} - whether string validates with RegExp or not
 * @example
 * testUppercase( "aBcD1234", 2 ) // -> true
 */
function testUppercase( str, n = 0 ) {
	if( !isString( str ) ) {
		throw new Error( ARGUMENT_ERROR_STRING );
	} else if( !isNumber( n ) ) {
		throw new Error( ARGUMENT_ERROR_NUMBER );
	}

	return regexpFromString( `(?=${ '.*[A-Z]'.repeat( n ) })`, 'gm' ).test( str );
}

/**
 * testLowercase
 * @description
 * test number of lowercase characters in string
 * @param {string} str - string to validate
 * @param {number} [n=0] - number of lowercase characters required
 * @return {boolean} - whether string validates with RegExp or not
 * @example
 * testUppercase( "aBcD1234", 2 ) // -> true
 */
function testLowercase( str, n = 0 ) {
	if( !isString( str ) ) {
		throw new Error( ARGUMENT_ERROR_STRING );
	} else if( !isNumber( n ) ) {
		throw new Error( ARGUMENT_ERROR_NUMBER );
	}

	return regexpFromString( `(?=${ '.*[a-z]'.repeat( n ) })`, 'gm' ).test( str );
}

/**
 * testDigitcase
 * @description
 * test number of digits in string
 * @param {string} str - string to validate
 * @param {number} [n=0] - number of digit characters required
 * @return {boolean} - whether string validates with RegExp or not
 * @example
 * testUppercase( "aBcD1234", 2 ) // -> true
 */
function testDigitcase( str, n = 0 ) {
	if( !isString( str ) ) {
		throw new Error( ARGUMENT_ERROR_STRING );
	} else if( !isNumber( n ) ) {
		throw new Error( ARGUMENT_ERROR_NUMBER );
	}

	return regexpFromString( `(?=${ '.*[0-9]'.repeat( n ) })`, 'igm' ).test( str );
}

/**
 * testSpecialcase
 * @description
 * test number of special characters in string
 * @param {string} str - string to validate
 * @param {number} [n=0] - number of special characters required
 * @param {string} [validCharacters="!@#$%*()_+{}[]:"'?<>,./\|~"] - valid special characters to accept
 * @return {boolean} - whether string validates with RegExp or not
 * @example
 * testUppercase( "aBcD1234!!", 2 ) // -> true
 */
function testSpecialcase( str, n = 0, validCharacters = escapeRegExp( '~!@#$%^&*()_+-={}[]:;<>?,.' ) ) {
	if( !isString( str ) ) {
		throw new Error( ARGUMENT_ERROR_STRING );
	} else if( !isNumber( n ) ) {
		throw new Error( ARGUMENT_ERROR_NUMBER );
	}

	return regexpFromString( `(?=${ ( '.*[' + validCharacters + ']' ).repeat( n ) })`, 'igm' ).test( str );
}

/**
 * testMinimumLength
 * @description
 * test for minimum number of characters in string
 * @param {string} str - string to validate
 * @param {number} n - minimum number of characters required
 * @return {boolean} - whether string passes length requirements
 * @example
 * testUppercase( "aBcD1234", 2 ) // -> true
 */
function testMinimumLength( str, n = 8 ) {
	if( !isString( str ) ) {
		throw new Error( ARGUMENT_ERROR_STRING );
	} else if( !isNumber( n ) ) {
		throw new Error( ARGUMENT_ERROR_NUMBER );
	}

	return str.length >= n;
}

/**
 * toPrecision
 * @description
 * clamp a numbers into scientific notation
 * @param {number} n - number to clamp
 * @param {number} p - precision to clamp to
 * @return {string} - stringified clamped value
 * @example
 * toPrecison( 123, 2 ) // -> 1.2e+2
 */
function toPrecison( n, p = 2 ) {
	return ( n ).toPrecision( p );
}

/**
 * toFixed
 * @description
 * clamp a decimal number to the specified precision
 * @param {number} n - number to clamp
 * @param {number} p - precision to clamp to
 * @return {string} - stringified clamped value
 * @example
 * toFixed( 123, 1 ) // -> "123.0"
 */
function toFixed( n, p = 2 ) {
	return ( n ).toFixed( p );
}

/**
 * isEven
 * @description
 * determine if an integer is a multiple of two
 * @param {number} n - number to evaluate
 * @return {boolean} - if the integer is a multiple of two
 * @example
 * isEven( 4 ) // -> true
 */
function isEven( n ) {
	if( !isNumber( n ) ) {
		return false;
	}

	return n && n === ~~n && !( ~~n & 1 );
}

/**
 * isOdd
 * @description
 * determine if an integer is not a multiple of two
 * @param {number} n - number to evaluate
 * @return {boolean} - if the integer is not a multiple of two
 * isOdd( 4 ) // -> false
 */
function isOdd( n ) {
	return !isEven( n );
}

/**
 * objectToFlatMap
 * @description
 * converts an object to a flat map with one dimensional key-pair sets
 * @param {Object} obj - object to flatten
 * @param {Map} result - result override
 * @return {Map<any, any>} - flat map of the object's key-value pairs
 * @example
 * objectToFlatMap( { a: { b: 1 } } ) // -> map { 'b' => 1 }
 */
function objectToFlatMap( obj, result = new Map() ) {
	if( !isObject( obj ) ) {
		throw new Error( ARGUMENT_ERROR_OBJECT );
	}

	keys( obj )
		.forEach( k => {
			const v = obj[ k ];

			if( isObject( v ) ) {
				objectToFlatMap( v, result );
			} else {
				result.set( k, v );
			}
		} );

	return result;
}

/**
 * positiveFloorAddition
 * @description
 * floors and increments a number
 * @param {number} n - number to increment
 * @return {number} - result
 */
function positiveFloorAddition( n ) {
	if( !isNumber( n ) ) {
		throw new Error( ARGUMENT_ERROR_NUMBER );
	}

	return ~~-~( n );
}

/**
 * degreesToRadians
 * @description
 * convert a number from degrees to radians
 * @param {number} n - number to convert
 * @return {number} - result in radians
 */
function degreesToRadians( n ) {
	return Math.PI * n / 180;
}

/**
 * radiansToDegrees
 * @description
 * convert a number from radians to degrees
 * @param {number} n - number to convert
 * @return {number} - result in degrees
 */
function radiansToDegrees( n ) {
	return 180 * n / Math.PI;
}

module.exports = {
	ERROR,
	FUNCTION_ERROR,
	ARGUMENT_ERROR,
	ARGUMENT_ERROR_PROPERTY,
	ARGUMENT_ERROR_BOOLEAN,
	ARGUMENT_ERROR_STRING,
	ARGUMENT_ERROR_NUMBER,
	ARGUMENT_ERROR_ARRAY,
	ARGUMENT_ERROR_OBJECT,
	ARGUMENT_ERROR_FUNCTION,
	ARGUMENT_ERROR_POWER,
	ARGUMENT_ERROR_HTTP,
	ARGUMENT_ERROR_EMAIL,
	ARGUMENT_ERROR_IPV4,
	ARGUMENT_ERROR_DOMAIN_NAME,
	LARGE_ARRAY_SIZE,
	FLOAT_EPSILON,
	DOUBLE_EPSILON,
	LOG_KIBIBYTE,
	EDGE,
	isNaN,
	isUndefined,
	isNull,
	isBoolean,
	isString,
	isNumber,
	isValue,
	isPrimitive,
	isArray,
	isMap,
	isUint8Array,
	isInt8Array,
	isInt16Array,
	isUint16Array,
	isInt32Array,
	isUint32Array,
	isFloat32Array,
	isFloat64Array,
	isObject,
	isBuffer,
	isFunction,
	isPowerOfTwo,
	keys,
	values,
	publicObject,
	instanceOf,
	has,
	findMissingKeys,
	hasSome,
	omit,
	include,
	sortObject,
	sort,
	isValidJSON,
	stringify,
	parse,
	map,
	startsWith,
	isValidHTTPMethod,
	isValidWebDAVMethod,
	isProtocol,
	isValidEmail,
	isValidIPv4,
	isPath,
	isValidDomainName,
	isValidQueryString,
	buildQueryString,
	querystring,
	isEmpty,
	flatten,
	extractIP,
	defineProperty,
	nonEnumerableProperty,
	pad2,
	secondsToReadableTime,
	isObjectId,
	isObjectIdReference,
	extractReferenceId,
	getDeepKeys,
	objectFilteredForRegex,
	getValueForRegexKey,
	arrayFilteredForRegex,
	removeItemsFromArray,
	removeItemsFromObject,
	wait,
	waitFor,
	absoluteValue,
	performanceDifference,
	bytesToSize,
	sizeToBytes,
	radixToNumber,
	generateRandomNumber,
	generateRandomString,
	generateRandomHex,
	getRandomInt,
	replaceMatchesWithValue,
	recursivePromiseResolve,
	objectId,
	convertHighResolutionTime,
	convertHRTimeToReadable,
	isUUIDv4,
	ascendingSort,
	clamp,
	absoluteMinimum,
	absoluteMaximum,
	precisionDelta,
	floatPrecisionDelta,
	doublePrecisionDelta,
	percentError,
	percentDifference,
	percentChange,
	sum,
	mean,
	isSemanticVersion,
	flattenObject,
	deepValues,
	minAndMax,
	escapeRegExp,
	regexpFromString,
	testUppercase,
	testLowercase,
	testDigitcase,
	testSpecialcase,
	testMinimumLength,
	toPrecison,
	toFixed,
	isEven,
	isOdd,
	objectToFlatMap,
	positiveFloorAddition,
	degreesToRadians,
	radiansToDegrees
};
