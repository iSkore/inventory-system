/** ****************************************************************************************************
 * @file: ping.js
 * Project: boilerplate-express-api
 * @author Nick Soggin <iSkore@users.noreply.github.com> on 31-Oct-2017
 *******************************************************************************************************/
'use strict';

const Response = require( 'http-response-class' );

module.exports.method = 'ALL';
module.exports.route  = '/ping';
module.exports.exec   = ( req, res ) => {
	const p = res.locals;
	return p.respond( new Response( 200, 'pong' ) );
};
