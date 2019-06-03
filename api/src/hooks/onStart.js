/** ****************************************************************************************************
 * File: onStart.js
 * Project: api
 * @author Nick Soggin <iSkore@users.noreply.github.com> on 26-Mar-2019
 *******************************************************************************************************/
'use strict';

const
	MongoDB     = require( '../services/mongo/MongoDB' ),
	{ waitFor } = require( '../utils/general' );

module.exports = async () => {
	await waitFor( async () => {
		console.debug( 'waiting for mongo connection' );

		try {
			await MongoDB.connect();
		} finally {
			console.debug( 'waiting for mongo connection' );
		}

		return MongoDB.isConnected();
	}, 200, true );
};
