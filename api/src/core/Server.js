/** ****************************************************************************************************
 * @file: server.js
 * Project: boilerplate-express-api
 * @author Nick Soggin <iSkore@users.noreply.github.com> on 30-Oct-2017
 *******************************************************************************************************/
'use strict';

const
	config      = require( 'config' ),
	express     = require( 'express' ),
	cors        = require( 'cors' ),
	bodyParser  = require( 'body-parser' ),
	logger      = require( 'pino' )( {
		level: process.env.NODE_ENV === 'production' ? 'info' : 'trace'
	} ),
	expressPino = require( 'express-pino-logger' );

const
	setupRoute               = require( './setupRoute' ),
	methodNotAllowed         = require( './methodNotAllowed' ),
	captureErrors            = require( './middleware/captureErrors' ),
	recursivelyReadDirectory = require( '../utils/recursivelyReadDirectory' );

/**
 * Server
 */
class Server
{
	constructor()
	{
		this.isClosed = false;
	}

	bindProcess()
	{
		logger.trace( 'bindProcess' );

		// catch all the ways node might exit
		process
			.on( 'SIGINT', ( msg, code ) => ( logger.info( 'SIGINT' ), process.exit( code ) ) )
			.on( 'SIGQUIT', ( msg, code ) => ( logger.info( 'SIGQUIT' ), process.exit( code ) ) )
			.on( 'SIGTERM', ( msg, code ) => ( logger.info( 'SIGTERM' ), process.exit( code ) ) )
			.on( 'unhandledRejection', err => logger.error( 'unhandledRejection', err ) )
			.on( 'uncaughtException', err => logger.error( 'uncaughtException', err ) )
			.on( 'beforeExit', () => logger.info( 'beforeExit' ) )
			.on( 'exit', () => logger.info( 'exit' ) );
	}

	/**
	 * expressInitialize
	 * @description
	 * Initialize express middleware and hook the middleware
	 */
	expressInitialize()
	{
		logger.trace( 'expressInitialize' );

		this.app = express();

		this.app.use( expressPino( { logger } ) );

		this.app.use( cors() );
		this.app.use( bodyParser.raw( { limit: '5gb' } ) );
		this.app.use( bodyParser.urlencoded( { extended: false } ) );
		this.app.use( bodyParser.json() );
	}

	/**
	 * hookRoute
	 * @param {object} item - item from the api config
	 * @returns {*} - returns item with required execution function
	 */
	hookRoute( item )
	{
		logger.trace( `hookRoute ${ item.method } ${ item.route }` );

		const exec = [
			( req, res, next ) => ( this.meters.reqMeter.mark(), next() )
		];

		setupRoute( item, exec );

		// hook route to express
		this.app[ item.method ]( item.route, exec );

		return item;
	}

	routerInitialize()
	{
		logger.trace( 'routerInitialize' );

		this.routes.map( item => this.hookRoute( item ) );

		// capture all unhandled routes
		this.routes.push( this.hookRoute( methodNotAllowed ) );

		// capture all unhandled errors that might occur
		this.app.use( captureErrors() );
	}

	async loadRoutes()
	{
		logger.trace( 'loadRoutes' );

		this.routes = await recursivelyReadDirectory( config.get( 'server.routes' ) );
		this.routes = this.routes.map( route => require( route ) );
	}

	/**
	 * initialize
	 * @description
	 * Hook `process` variables `uncaughtException`, `unhandledRejection`, and `exit` to handle any potential errors
	 * that may occur. This will allow us to properly handle exit and log all non-V8 level errors without the program
	 * crashing.
	 * @returns {Server} - this
	 */
	async initialize()
	{
		logger.trace( 'initialize' );

		// override process handlers to handle failures
		this.bindProcess();

		// setup express
		this.expressInitialize();
		await this.loadRoutes();

		this.routerInitialize();
	}

	/**
	 * onStart
	 * @description
	 * create instance of an http server and start listening on the port
	 * @param {function} cb - pm2 callback
	 */
	onStart( cb )
	{
		logger.trace( 'onStart' );

		this.server = this.app.listen(
			config.get( 'server.port' ),
			config.get( 'server.host' ),
			() => {
				process.stdout.write(
					`${ config.get( 'name' ) } ${ config.get( 'version' ) } ` +
					`running on ${ config.get( 'server.host' ) }:${ config.get( 'server.port' ) }\n`
				);

				logger.info( 'started' );

				cb();
			}
		);
	}

	sensors( io )
	{
		logger.trace( 'sensors' );

		this.meters          = {};
		this.meters.reqMeter = io.meter( 'req/min' );
	}

	actuators( io )
	{
		logger.trace( 'actuators' );

		io.action( 'process', reply => reply( { env: process.env } ) );
		io.action( 'server', reply => reply( { server: this.server } ) );
		io.action( 'config', reply => reply( { config: config } ) );
	}

	/**
	 * onStop
	 * @param {*} err - error
	 * @param {function} cb - pm2 callback
	 * @param {number} code - exit code
	 * @param {string} signal - kill signal
	 */
	onStop( err, cb, code, signal )
	{
		logger.trace( 'onStop' );

		if( this.server ) {
			this.server.close();
		}

		if( err ) {
			logger.error( err );
		}

		if( this.isClosed ) {
			logger.debug( 'Shutdown after SIGINT, forced shutdown...' );
		}

		this.isClosed = true;

		logger.debug( `server exiting with code: ${ code } ${ signal }` );
		cb();
	}
}

/**
 * module.exports
 * @description
 * export a singleton instance of Server
 * @type {Server}
 */
module.exports = Server;
