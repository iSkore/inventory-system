/** ****************************************************************************************************
 * File: db.delete.js
 * Project: mongo-crud
 * @author Nick Soggin <iSkore@users.noreply.github.com> on 15-May-2019
 *******************************************************************************************************/
'use strict';

const
	Response = require( 'http-response-class' ),
	MongoDB  = require( '../../services/mongo/MongoDB' );

const
	collections = MongoDB.getCollections().join( '|' );

module.exports.method = 'DELETE';
module.exports.route  = [
	'/db/',
	`/db/:collection(${ collections })`
];
module.exports.exec   = async ( req, res ) => {
	const p = res.locals;

	try {
		if( !MongoDB.collections.has( p.params.collection ) ) {
			return p.respond( new Response( 404, `"${ p.params.collection }" is not a collection` ) );
		}

		let payload = [];

		if( p.query.hasOwnProperty( '_id' ) ) {
			Array.isArray( p.query._id ) ? payload.push( ...p.query._id ) : payload.push( p.query._id );
		} else if( Array.isArray( p.data ) ) {
			payload.push( ...p.data );
		} else if( typeof p.data === 'string' ) {
			payload.push( p.data );
		}

		payload = payload.filter( i => !!i );

		if( !payload.length ) {
			return p.respond( new Response( 400, 'DELETE no _id variable found' ) );
		}

		const Model = MongoDB.collections.get( p.params.collection );

		const doc = await Model.deleteMany( { _id: { $in: payload } } );

		if( doc.ok ) {
			if( doc.deletedCount && doc.n === doc.deletedCount ) {
				if( payload.length === doc.deletedCount ) {
					return p.respond( new Response( 202, payload ) );
				} else {
					return p.respond( new Response( 207, payload ) );
				}
			} else {
				return p.respond( new Response( 404, `${ payload.join( ', ' ) } not found` ) );
			}
		} else {
			return p.respond( new Response( 400, doc ) );
		}
	} catch( e ) {
		if( e.code === 11000 ) {
			return p.respond( new Response( 409, e.errmsg ) );
		}

		return e instanceof Response ?
			p.respond( e ) :
			p.respond( new Response( e.statusCode || 500, e.data || e.stack || e.message || e ) );
	}
};
