/** ****************************************************************************************************
 * @file: docs.js
 * Project: boilerplate-express-api
 * @author Nick Soggin <iSkore@users.noreply.github.com> on 31-Oct-2017
 *******************************************************************************************************/
'use strict';

const
	Response   = require( 'http-response-class' ),
	entrypoint = require( '../../entrypoint' );

module.exports.method = 'GET';
module.exports.route  = '/docs';
module.exports.exec   = ( req, res ) => {
	const
		p    = res.locals,
		data = entrypoint.server.routes.map(
			( { method, route } ) => ( { method, route } )
		);

	return p.respond( new Response( 200, data ) );
};
