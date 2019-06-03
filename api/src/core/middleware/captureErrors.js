/** ****************************************************************************************************
 * @file: captureErrors.js
 * Project: boilerplate-express-api
 * @author Nick Soggin <iSkore@users.noreply.github.com> on 13-Aug-2018
 *******************************************************************************************************/
'use strict';

const
	Response = require( 'http-response-class' ),
	UUIDv4   = require( 'uuid/v4' );

/**
 * captureErrors
 * @description
 * capture any errors that may occur - should be last middleware function in the request cycle
 * @param {Error|null} e - null unless an error occurs
 * @param {http.Request} req - HTTP Request
 * @param {http.Response} res - HTTP Response
 * @param {function} next - next middleware function
 */
function captureErrors( e, req, res, next ) {
	req.log.trace( '[middleware] captureErrors' );

	if( e ) {
		const
			resp = new Response( e.statusCode || 500, e.data || e.stack || e.message || e ),
			data = JSON.stringify( resp.data );

		if( res.locals.respond ) {
			res.locals.respond( resp );
		} else {
			res
				.set( {
					'Access-Control-Allow-Origin': '*',
					'Access-Control-Max-Age': 1728000,
					'Content-Type': 'application/json; charset=utf-8',
					'Content-Length': data.length,
					'Request-ID': UUIDv4()
				} )
				.status( resp.statusCode )
				.send( data );
		}
	} else {
		next();
	}
}

module.exports = () => captureErrors;
