/** ****************************************************************************************************
 * File: ExternalAPI.js
 * Project: api
 * @author Nick Soggin <iSkore@users.noreply.github.com> on 01-Apr-2019
 *******************************************************************************************************/
'use strict';

const
	request = require( 'request' );

class ExternalAPI
{
	/**
	 * constructor
	 * @param {string} [protocol=http] - protocol
	 * @param {string} [hostname=127.0.0.1] - hostname
	 * @param {number} [port=8080] - port
	 */
	constructor( protocol = 'http', hostname = '127.0.0.1', port = 8080 )
	{
		this.setURL( protocol, hostname, port );
	}

	setURL( protocol, hostname, port )
	{
		this.url = new URL( `${ protocol }://${ hostname }:${ port }` );
	}

	prepareOpts( opts )
	{
		opts.uri  = new URL( opts.uri || opts.path, this.url );
		opts.json = opts.json === false ? false : opts.json || true;
	}

	request( opts = {} )
	{
		return new Promise(
			( res, rej ) => {
				this.prepareOpts( opts );
				request( opts,
					( e, status, data ) => e ? rej( e ) : res( data )
				);
			}
		);
	}

	rawRequest( opts = {} )
	{
		this.prepareOpts( opts );
		return request( opts );
	}
}

module.exports = ExternalAPI;
