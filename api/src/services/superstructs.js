/** ****************************************************************************************************
 * @file: structs.js
 * Project: boilerplate-express-api
 * @author Nick Soggin <iSkore@users.noreply.github.com> on 14-Aug-2018
 *******************************************************************************************************/
'use strict';

const
	Response        = require( 'http-response-class' ),
	{ superstruct } = require( 'superstruct' ),
	{
		isObject,
		isObjectId
	}               = require( '../utils/general' );

const
	types  = {
		stringNumber: d => +d === d,
		map: d => Array.isArray( d ) ?
			d.filter(
				i => Array.isArray( i ) && i.length === 2
			).length === d.length :
			false,
		bbox: d => /-?\d+.?\d*,-?\d+.?\d*,-?\d+.?\d*,-?\d+.?\d*/.test( d ),
		objectId: isObjectId,
		mongoObject: d => isObject( d ) ?
			d.hasOwnProperty( '_id' ) &&
			isObjectId( d._id ) : false,
		'*': d => d === d
	},
	struct = superstruct( {
		types
	} );

/**
 * structs
 * @description
 * list of json structures used throughout the api
 * @mixin structs
 */
module.exports = {
	getDBObject: {
		_id: 'objectId?',
		collection: 'string'
	},
	types,
	struct,
	validate: ( expected, data ) => new Promise(
		( res, rej ) => {
			const validation = struct( expected ).validate( data );
			if( validation[ 0 ] ) {
				rej( new Response( 417, { error: validation[ 0 ].message, expected } ) );
			} else {
				res( validation[ 1 ] );
			}
		}
	)
};
