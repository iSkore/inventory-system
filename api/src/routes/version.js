/** ****************************************************************************************************
 * @file: version.js
 * Project: boilerplate-express-api
 * @author Nick Soggin <iSkore@users.noreply.github.com> on 15-Nov-2017
 *******************************************************************************************************/
'use strict';

const
	config   = require( 'config' ),
	Response = require( 'http-response-class' );

module.exports.method = 'GET';
module.exports.route  = '/version';
module.exports.exec   = ( req, res ) => {
	const p = res.locals;
	return p.respond( new Response( 200, config.get( 'version' ) ) );
};
