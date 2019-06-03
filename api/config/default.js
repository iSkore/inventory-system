/** ****************************************************************************************************
 * File: default.js
 * Project: api
 * @author Nick Soggin <iSkore@users.noreply.github.com> on 26-Mar-2019
 *******************************************************************************************************/
'use strict';

const
	{ join }          = require( 'path' ),
	{ name, version } = require( '../package' );

process.title = `${ name }-v${ version }`;

module.exports = {
	name,
	version: `v${ version }`,
	title: `${ name }-v${ version }`,

	server: {
		host: '0.0.0.0',
		port: 3000,
		routes: join( process.cwd(), 'src', 'routes' ),
		packet: {
			timeout: +process.env.SERVER_PACKET_TIMEOUT || 20000,
			dotfiles: 'allow'
		}
	},

	mongodb: {
		uri: 'mongodb://mongo:27017/crud',
		ipFamily: 4,
		useNewUrlParser: true
	}
};
