/** ****************************************************************************************************
 * File: setupRoute.js
 * Project: boilerplate-express-api
 * @author Nick Soggin <iSkore@users.noreply.github.com> on 19-Apr-2019
 *******************************************************************************************************/
'use strict';

const
	Response = require( 'http-response-class' ),
	packet   = require( './middleware/packet' )();

module.exports = ( item, exec = [] ) => {
	exec.push( packet );

	if( Array.isArray( item.exec ) ) {
		exec.push( ...item.exec );
	} else {
		exec.push(
			( req, res, next ) => {
				if( res && res.locals ) {
					try {
						item.exec( req, res, next );
					} catch( e ) {
						e instanceof Response ?
							res.locals.respond( e ) :
							res.locals.respond(
								new Response( e.statusCode || 500, e.data || e.stack || e.message || e )
							);
					}
				} else {
					res.status( 500 ).send( 'unknown' );
				}
			}
		);
	}

	item.method = item.method.toLowerCase();
};
