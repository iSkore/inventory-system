/** ****************************************************************************************************
 * @file: methodNotAllowed.js
 * Project: boilerplate-express-api
 * @author Nick Soggin <iSkore@users.noreply.github.com> on 01-Nov-2017
 *******************************************************************************************************/
'use strict';

const Response = require( 'http-response-class' );

module.exports.route  = '*';
module.exports.method = 'ALL';
module.exports.exec   = ( req, res ) => {
	const p = res.locals;
	return p.respond( new Response( 405, `Method: ${ req.method } on ${ req.path } not allowed` ) );
};
