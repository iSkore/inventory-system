/** ****************************************************************************************************
 * File: createItem.post.js
 * Project: api
 * @author Nick Soggin <iSkore@users.noreply.github.com> on 10-Apr-2019
 *******************************************************************************************************/
'use strict';

const
	Response = require( 'http-response-class' ),
	MongoDB  = require( '../../services/mongo/MongoDB' ),
	{
		validate
	}        = require( '../../services/superstructs' );

const
	collections = MongoDB.getCollections().join( '|' );

module.exports.method = 'POST';
module.exports.route  = `/item/:collection(${ collections })`;
module.exports.exec   = async ( req, res ) => {
	const p = res.locals;

	try {
		let struct = null;

		// return p.respond(
		// 	new Response( 412, `${ p.params.collection } does not have a registered creation structure` )
		// );

		await validate( struct, p.data );

		p.data._id = MongoDB.objectId();

		const
			Item = MongoDB.collections.get( p.params.collection );

		let doc = new Item( { ...p.data } );

		try {
			await doc.validate();
		} catch( e ) {
			return p.respond( new Response( 417, e ) );
		}

		doc = await doc.save();

		if( doc ) {
			return p.respond( new Response( 201, doc ) );
		}
		else {
			return p.respond( new Response( 400, `unable to create ${ p.params.collection }` ) );
		}
	} catch( e ) {
		return e instanceof Response ?
			p.respond( e ) :
			p.respond( new Response( e.statusCode || 500, e.data || e.stack || e.message || e ) );
	}
};
