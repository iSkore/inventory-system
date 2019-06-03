/** ****************************************************************************************************
 * File: db.get.js
 * Project: api
 * @author Nick Soggin <iSkore@users.noreply.github.com> on 26-Feb-2019
 *******************************************************************************************************/
'use strict';

const
	Response            = require( 'http-response-class' ),
	MongoDB             = require( '../../services/mongo/MongoDB' ),
	buildQueryDirective = require( '../../utils/mongo/buildQueryDirective' ),
	{ isNumber }        = require( '../../utils/general' );

const
	collections = MongoDB.getCollections().join( '|' );

module.exports.method = 'GET';
module.exports.route  = [
	'/db/',
	`/db/:collection(${ collections })`,
	`/db/:collection(${ collections })/:id`
];
module.exports.exec   = async ( req, res ) => {
	const p = res.locals;

	try {
		if( !p.params.collection ) {
			return p.respond( new Response( 200, MongoDB.getCollections() ) );
		} else if( !MongoDB.collections.has( p.params.collection ) ) {
			return p.respond( new Response( 404, `"${ p.params.collection }" is not a collection` ) );
		}

		const Model = MongoDB.collections.get( p.params.collection );

		if( p.params.id ) {
			const doc = await Model.findById( p.params.id );

			if( doc ) {
				return p.respond( new Response( 200, doc ) );
			} else {
				return p.respond( new Response( 404, `${ p.params.id } not found` ) );
			}
		}

		const directive = buildQueryDirective( p.query );

		if( directive.show ) {
			return p.respond( new Response( 200, directive ) );
		}

		let doc = Model
			.find( directive.find )
			.limit( directive.limit )
			.sort( directive.sort )
			.select( directive.select );

		if( directive.count ) {
			doc = doc.estimatedDocumentCount();
		}

		try {
			doc = await doc.exec();
		} catch( e ) {
			return p.respond( new Response( 417, e ) );
		}

		if( doc.length ) {
			return p.respond( new Response( 200, doc ) );
		} else if( isNumber( doc ) ) {
			return p.respond( new Response( 200, doc ) );
		} else {
			return p.respond( new Response( 404, [] ) );
		}
	} catch( e ) {
		return e instanceof Response ?
			p.respond( e ) :
			p.respond( new Response( e.statusCode || 500, e.data || e.stack || e.message || e ) );
	}
};
