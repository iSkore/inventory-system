/** ****************************************************************************************************
 * File: db.put.js
 * Project: mongo-crud
 * @author Nick Soggin <iSkore@users.noreply.github.com> on 14-May-2019
 *******************************************************************************************************/
'use strict';

const
	Response = require( 'http-response-class' ),
	MongoDB  = require( '../../services/mongo/MongoDB' );

const
	collections = MongoDB.getCollections().join( '|' );

module.exports.method = 'PUT';
module.exports.route  = [
	'/db/',
	`/db/:collection(${ collections })`
];
module.exports.exec   = async ( req, res ) => {
	const p = res.locals;

	try {
		if( !MongoDB.collections.has( p.params.collection ) ) {
			return p.respond( new Response( 404, `"${ p.params.collection }" is not a collection` ) );
		} else if( Array.isArray( p.data ) || typeof p.data !== 'object' ) {
			return p.respond( new Response( 417, 'PUT /db/:collection only accepts objects' ) );
		} else if( !p.data.hasOwnProperty( '_id' ) ) {
			return p.respond( new Response( 417, 'PUT data must have an _id' ) );
		}

		const
			Model            = MongoDB.collections.get( p.params.collection ),
			{ _id, ...data } = p.data,
			doc              = await Model
				.findByIdAndUpdate( _id, data, { new: true } )
				.exec();

		if( !doc ) {
			return p.respond( new Response( 404, `${ p.params.collection } ${ p.data._id } not found` ) );
		}

		return p.respond( new Response( 200, doc ) );
	} catch( e ) {
		if( e.code === 11000 ) {
			return p.respond( new Response( 409, e.errmsg ) );
		}

		return e instanceof Response ?
			p.respond( e ) :
			p.respond( new Response( e.statusCode || 500, e.data || e.stack || e.message || e ) );
	}
};
