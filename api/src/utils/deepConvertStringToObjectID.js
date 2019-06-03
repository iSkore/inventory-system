/** ****************************************************************************************************
 * File: deepConvertStringToObjectID.js
 * Project: api
 * @author Nick Soggin <iSkore@users.noreply.github.com> on 22-Apr-2019
 *******************************************************************************************************/
'use strict';

const
	mongoose = require( 'mongoose' ),
	{
		isObjectId
	}        = require( './general' );

function deepConvertStringToObjectID( o ) {
	if( Array.isArray( o ) ) {
		o = o.map(
			item => deepConvertStringToObjectID( item )
		);
	} else if( typeof o === 'object' ) {
		Object.keys( o )
			.reduce(
				( r, k ) => {
					o[ k ] = deepConvertStringToObjectID( o[ k ] );
					return o;
				}, o
			);
	} else if( typeof o === 'string' ) {
		if( isObjectId( o ) ) {
			o = mongoose.Types.ObjectId( o );
		}
	}

	return o;
}

module.exports = deepConvertStringToObjectID;
