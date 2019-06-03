/** ****************************************************************************************************
 * File: MongoDB.js
 * Project: api
 * @author Nick Soggin <iSkore@users.noreply.github.com> on 25-Feb-2019
 *******************************************************************************************************/
'use strict';

const
	config   = require( 'config' ),
	mongoose = require( 'mongoose' ),
	LightMap = require( '@parellin/lightmap' );

require( '@mongoosejs/double' );

const
	Obj = require( './schema/Object' );

function isConnected() {
	return mongoose.connection.hasOwnProperty( 'name' );
}

async function connect() {
	if( !isConnected() ) {
		await mongoose.connect(
			config.get( 'mongodb.uri' ),
			{
				useNewUrlParser: config.get( 'mongodb.useNewUrlParser' ),
				family: config.get( 'mongodb.ipFamily' ) || 4
			}
		);
	}
}

async function disconnect() {
	await mongoose.connection.close();
}

function objectId() {
	return new mongoose.Types.ObjectId();
}

function getCollections() {
	return Object.keys( mongoose.models );
}

module.exports = {
	isConnected,
	connect,
	disconnect,
	objectId,
	getCollections,
	connection: mongoose.connection,
	collections: new LightMap( [
		[ 'object', Obj ]
	] )
};
