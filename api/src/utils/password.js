/** ****************************************************************************************************
 * File: password.js
 * Project: api
 * @author Nick Soggin <iSkore@users.noreply.github.com> on 10-Apr-2019
 *******************************************************************************************************/
'use strict';

const
	{
		generateRandomNumber,
		testMinimumLength,
		testUppercase,
		testLowercase,
		testDigitcase,
		testSpecialcase
	}          = require( './general' ),
	characters = new Map( [
		[ 'uppercase', [
			'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I',
			'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R',
			'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
		] ],
		[ 'lowercase', [
			'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i',
			'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r',
			's', 't', 'u', 'v', 'w', 'x', 'y', 'z'
		] ],
		[ 'digits', [
			0, 1, 2, 3, 4, 5, 6, 7, 8, 9
		] ],
		[ 'special', [
			'`', '~', '!', '@', '#', '$', '%', '^', '&',
			'*', '(', ')', '-', '_', '=', '+', '[', ']',
			'{', '}', '\\', '|', ';', ':', '\'', '"', ',',
			'.', '<', '>', '/', '?'
		] ]
	] );

// TODO: get back to this
// http://www.passwordmeter.com/
function determinePasswordScore( password ) {
	const len = password.length;
	let score = 0;

	// Number of Characters
	score += len * 4;

	// Uppercase Letters
	score += ( len - ( password.match( /[A-Z]/g ) || '' ).length ) * 2;

	// Lowercase Letters
	score += ( len - ( password.match( /[a-z]/g ) || '' ).length ) * 2;

	// Numbers
	score += ( password.match( /[0-9]/g ) || '' ).length * 4;

	// Symbols
	score += ( password.match( /[~!@#$%^&*()_+-={}[\]:;<>?,.]/g ) || '' ).length * 6;

	// Middle Numbers or Symbols
	score += ( password.match( /(?!^)[~!@#$%^&*()_+-={}[\]:;<>?,.](?!$)/g ) || '' ).length * 2;

	// Requirements
	const requirements = testUppercase( password, 1 ) +
		testLowercase( password, 1 ) +
		testDigitcase( password, 1 ) +
		testSpecialcase( password, 1 );

	score += requirements * 2;

	// Contains Letters Only
	if( ( password.match( /[a-zA-Z]+/g ) || '' )[ 0 ] === password ) {
		score -= password.length;
	}

	// Contains Numbers Only
	if( ( password.match( /[0-9]+/g ) || '' )[ 0 ] === password ) {
		score -= password.length;
	}

	const
		repeatChars = password
			.match( /(\w)\1+/gi )
			.reduce( ( r, d, i ) => {
				r += d.length;
				r /= i + 1;
				return Math.round( r );
			}, 0 ),
		uniqueChars = new Set( password.split( '' ) ).size;

	// console.log( 'repeatChars' );
	// console.log( repeatChars );
	// console.log( uniqueChars );
	// console.log( Math.ceil( repeatChars / uniqueChars ) );

	// Unique characters
	// console.log( len - password.match( /(\w)\1+/gi ).length );

	return score;
}

console.log( determinePasswordScore( 'HelloWooorld:)' ) );

/**
 * testPassword
 * @description
 * validate password against a series of strength checks
 * @param {string} password - password
 * @param {object} opts - password requirements
 * @property {number} opts.length - the length minimum of a password
 * @property {number} opts.uppercase - the uppercase character minimum of a password
 * @property {number} opts.lowercase - the lowercase character minimum of a password
 * @property {number} opts.digits - the digits character minimum of a password
 * @property {number} opts.special - the special character minimum of a password
 * @return {string} - empty string or error message
 */
function testPassword( password, opts = { length: 8, uppercase: 2, lowercase: 2, digits: 1, special: 1 } ) {
	const test = {};

	if( !testMinimumLength( password, opts.length ) ) {
		test.error = `Password must be ${ opts.length } characters or more`;
	} else if( !testUppercase( password, opts.uppercase ) ) {
		test.error = `Password must contain ${ opts.uppercase } or more uppercase characters`;
	} else if( !testLowercase( password, opts.lowercase ) ) {
		test.error = `Password must contain ${ opts.lowercase } or more lowercase characters`;
	} else if( !testDigitcase( password, opts.digits ) ) {
		test.error = `Password must contain ${ opts.digits } or more numbers`;
	} else if( !testSpecialcase( password, opts.special ) ) {
		test.error = `Password must contain ${ opts.special } or more special characters`;
	}

	if( test.error ) {
		test.failed = true;
	}

	return test;
}

/**
 * generateRandomPassword
 * generate a random password with the specified requirements
 * @param {number} length - length of the password
 * @param {number} uppercase - amount of uppercase characters required
 * @param {number} lowercase - amount of lowercase characters required
 * @param {number} digits - amount of digits characters required
 * @param {number} special - amount of special characters required
 * @return {string} - random generated password
 * @example
 * generateRandomPassword( 8, 2, 2, 2, 1 ) // -> "0qV*mX7W"
 */
function generateRandomPassword( length = 8, uppercase = 2, lowercase = 2, digits = 1, special = 1 ) {
	const
		requirements = { uppercase, lowercase, digits, special },
		keys         = Object.keys( requirements ),
		candidates   = [];

	for( let i = 0; i < keys.length; ++i ) {
		const
			key   = keys[ i ],
			chars = characters.get( key );

		for( let j = requirements[ key ]; j > 0; --j ) {
			candidates.push( chars[ generateRandomNumber( 0, chars.length - 1 ) ] );
		}
	}

	while( candidates.length < length ) {
		const chars = characters.get( keys[ generateRandomNumber( 0, keys.length - 1 ) ] );
		candidates.push( chars[ generateRandomNumber( 0, chars.length - 1 ) ] );
	}

	let password = '';

	while( candidates.length > 0 ) {
		password += candidates.splice( generateRandomNumber( 0, candidates.length - 1 ), 1 );
	}

	return password;
}

module.exports = {
	testPassword,
	generateRandomPassword
};
