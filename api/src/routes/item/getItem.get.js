/** ****************************************************************************************************
 * File: getProject.get.js
 * Project: api
 * @author Nick Soggin <iSkore@users.noreply.github.com> on 19-Apr-2019
 *******************************************************************************************************/
'use strict';

const
	Response = require( 'http-response-class' ),
	MongoDB  = require( '../../services/mongo/MongoDB' ),
	{
		validate,
		getDBObject
	}        = require( '../../services/superstructs' );

const
	collections = MongoDB.getCollections().join( '|' );

module.exports.method = 'GET';
module.exports.route  = [
	`/item/:collection(${ collections })`,
	`/item/:collection(${ collections })/:_id`
];
module.exports.exec   = async ( req, res ) => {
	const p = res.locals;

	try {
		await validate( getDBObject, p.params );

		let doc = MongoDB.collections.get( p.params.collection );

		if( p.params._id ) {
			doc = await doc.findById( p.params._id );
		} else {
			doc = await doc.find();
		}

		if( doc ) {
			return p.respond( new Response( 200, doc ) );
		} else {
			return p.respond( new Response( 404, `${ p.collection } ${ p.params._id } not found` ) );
		}
	} catch( e ) {
		return e instanceof Response ?
			p.respond( e ) :
			p.respond( new Response( e.statusCode || 500, e.data || e.stack || e.message || e ) );
	}
};
