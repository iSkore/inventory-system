/** ****************************************************************************************************
 * File: buildQueryDirective.js
 * Project: mongo-crud
 * @author Nick Soggin <iSkore@users.noreply.github.com> on 14-May-2019
 *******************************************************************************************************/
'use strict';

const
	{
		isValidJSON
	} = require( '../general' );

module.exports = query => {
	return Object.keys( query )
		.reduce( ( r, k ) => {
			const val = query[ k ];

			if( k === 'show' ) {
				r.show = true;
			} else if( k === 'count' ) {
				r.count = true;
			} else if( k === 'limit' ) {
				r.limit = +val;
			} else if( k === 'sort' ) {
				r.sort = isValidJSON( val ) ? JSON.parse( val ) : val;
			} else if( k === 'select' ) {
				r.select = isValidJSON( val ) ? JSON.parse( val ) : val;
			} else if( k === 'populate' ) {
				r.populate = isValidJSON( val ) ? JSON.parse( val ) : val;
			} else if( typeof val === 'string' ) {
				if( +val === +val ) {
					r.find[ k ] = +val;
				} else if( /^\/(.*?)\/[gimuy]+/.test( val ) ) {
					r.find[ k ] = new RegExp(
						val.match( /\/(.+)\/.*/ )[ 1 ],
						val.match( /\/.+\/(.*)/ )[ 1 ]
					);
				} else if( isValidJSON( val ) ) {
					r.find[ k ] = JSON.parse( val );
				} else {
					r.find[ k ] = val;
				}
			} else {
				r.find[ k ] = val;
			}

			return r;
		}, { find: {} } );
};
