/** ****************************************************************************************************
 * @file: packet.js
 * Project: boilerplate-express-api
 * @author Nick Soggin <iSkore@users.noreply.github.com> on 13-Aug-2018
 *******************************************************************************************************/
'use strict';

const
	config                  = require( 'config' ),
	{ promises: { lstat } } = require( 'fs' ),
	{ resolve }             = require( 'path' ),
	Response                = require( 'http-response-class' ),
	UUIDv4                  = require( 'uuid/v4' ),
	onFinished              = require( 'on-finished' );

const
	timeout  = config.get( 'server.packet.timeout' ),
	dotfiles = config.get( 'server.packet.dotfiles' );

/**
 * packet
 * @description
 * construct basic wrapper operations for consistent api responses
 * @param {http.Request} req - HTTP Request
 * @param {http.Response} res - HTTP Response
 * @param {function} next - next middleware function
 */
function packet( req, res, next ) {
	req.log.trace( '[middleware] packet' );

	const id = UUIDv4();

	// capture relevant information from the request and prepare packet object
	let packet = {
		id,
		path: req.path,
		method: req.method,
		params: req.params,
		query: req.query,
		cookies: req.cookies,
		data: req.body || req.data,
		headers: {
			'Content-Type': 'application/json; charset=utf-8',
			'Request-ID': id
		},
		ContentLength: req.headers[ 'content-length' ],
		IP: req.ip
	};

	// place holder for internal request handling time
	packet.internalTime = '0';

	// start internal timer
	packet.startTimer = process.hrtime();

	// setup function to end internal timer
	packet.endTimer = () => {
		const
			hrtime = process.hrtime( packet.startTimer ),
			t      = ( hrtime[ 0 ] * 1e9 ) + hrtime[ 1 ];

		// do some evaluation to give back a relevant unit of time
		packet.internalTime = t < 1000 ? `${ t.toFixed( 2 ) } ns` :
			t < 1000000 ? `${ ( t / 1e3 ).toFixed( 2 ) } μs` :
				t < 1000000000 ? `${ ( t / 1e6 ).toFixed( 2 ) } ms` :
					`${ ( t / 1e9 ).toFixed( 2 ) } s`;
	};

	// set timeout for requests exceeding the specified time in the config (must be in milliseconds)
	const packetTimeout = setTimeout(
		() => !( res && packet ) || packet.respond( new Response( 408, 'Request Timeout' ) ),
		timeout
	);

	// attach the clearTimeout function to the packet
	packet.clearTimeout = () => clearTimeout( packetTimeout );

	// setup generic response for the majority of the api responses
	packet.respond = d => {
		if( !res || !packet ) {
			return;
		}

		// end the internal timer
		packet.endTimer();

		if( d instanceof Response ) {
			// stringify the response and end the request
			const data = JSON.stringify( d.data || '' );

			res
				.set( packet.headers )
				.status( d.statusCode )
				.send( data )
				.end();
		} else {
			return packet.respond( new Response( 499, d ) );
		}
	};

	// attach sendFile wrapper to packet
	packet.sendFile = async ( fpath, opts ) => {
		fpath = resolve( fpath );

		const { size }     = await lstat( fpath );
		res._contentLength = size;

		res.sendFile( fpath, {
			dotfiles,
			headers: { 'timestamp': Date.now(), 'sent': true },
			...opts
		} );
	};

	// kill the packet and do some cleanup - not 100% necessary because of garbage collection
	packet.kill = () => {
		if( !res ) {
			return;
		}

		packet.clearTimeout();

		res.locals = packet = null;
	};

	// attach the packet helper to the response
	res.locals = packet;

	// hook logging and clean up on the response
	onFinished( res, e => {
		if( e ) {
			req.log.error( e );
		}

		!packet || req.log.debug( packet.internalTime );
		!packet || packet.kill();
		res = null;
	} );

	next();
}

module.exports = () => packet;
