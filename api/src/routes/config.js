/** ****************************************************************************************************
 * File: config.js
 * Project: api
 * @author Nick Soggin <iSkore@users.noreply.github.com> on 12-Mar-2019
 *******************************************************************************************************/
'use strict';

const
	config   = require( 'config' ),
	Response = require( 'http-response-class' ),
	{
		omit
	}        = require( '../utils/general' ),
	data     = omit( config, 'secret' );

module.exports.method = 'GET';
module.exports.route  = '/config';
module.exports.exec   = ( req, res ) => {
	const p = res.locals;

	if( !p.query.key ) {
		return p.respond( new Response( 200, data ) );
	} else {
		if( !Array.isArray( p.query.key ) ) {
			p.query.key = [ p.query.key ];
		}

		try {
			const response = {};

			p.query.key.forEach( k => response[ k ] = config.get( k ) );

			return p.respond( new Response( 200, response ) );
		} catch( e ) {
			return p.respond( new Response( 400, e.message || e ) );
		}
	}
};
