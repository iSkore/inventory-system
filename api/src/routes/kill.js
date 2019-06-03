/** ****************************************************************************************************
 * @file: kill.js
 * Project: boilerplate-express-api
 * @author Nick Soggin <iSkore@users.noreply.github.com> on 31-Oct-2017
 *******************************************************************************************************/
'use strict';

const Response = require( 'http-response-class' );

module.exports.method = 'GET';
module.exports.route  = '/kill';
module.exports.exec   = ( req, res ) => {
	const p = res.locals;

	p.respond( new Response( 200, 'server terminated' ) );

	if( !p.query.dryRun ) {
		process.nextTick(
			() => process.kill( process.pid, 'SIGINT' )
		);
	}
};
