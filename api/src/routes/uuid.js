/** ****************************************************************************************************
 * @file: uuid.js
 * Project: boilerplate-express-api
 * @author Nick Soggin <iSkore@users.noreply.github.com> on 16-Nov-2017
 *******************************************************************************************************/
'use strict';

const Response = require( 'http-response-class' );

module.exports.method = 'GET';
module.exports.route  = '/uuid';
module.exports.exec   = ( req, res ) => {
	const p = res.locals;
	return p.respond( new Response( 200, p.headers[ 'X-Request-ID' ] ) );
};
