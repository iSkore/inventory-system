/** ****************************************************************************************************
 * File: db.post.js
 * Project: api
 * @author Nick Soggin <iSkore@users.noreply.github.com> on 27-Feb-2019
 *******************************************************************************************************/
'use strict';

const
	Response = require( 'http-response-class' ),
	MongoDB  = require( '../../services/mongo/MongoDB' );

const
	collections = MongoDB.getCollections().join( '|' );

module.exports.method = 'POST';
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
			return p.respond( new Response( 417, 'POST /db/:collection only accepts objects' ) );
		}

		const
			Model = MongoDB.collections.get( p.params.collection ),
			doc   = new Model( {
				_id: MongoDB.objectId(),
				...p.data
			} );

		try {
			await doc.validate();
		} catch( e ) {
			return p.respond( new Response( 417, e ) );
		}

		await doc.save();

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
