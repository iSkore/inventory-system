/** ****************************************************************************************************
 * File: updateItem.put.js
 * Project: api
 * @author Nick Soggin <iSkore@users.noreply.github.com> on 19-Apr-2019
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

module.exports.method = 'PUT';
module.exports.route  = `/item/:collection(${ collections })`;
module.exports.exec   = async ( req, res ) => {
	const p = res.locals;

	try {
		let struct = null;

		// return p.respond(
		// 	new Response( 412, `${ p.params.collection } does not have a registered update structure` )
		// );
		await validate( struct, p.data );

		const
			Item = MongoDB.collections.get( p.params.collection );

		let doc = await Item.findById( p.data._id );

		if( !doc ) {
			return p.respond( new Response( 404, `${ p.params.collection } ${ p.data._id } not found` ) );
		}

		Object.assign( doc, p.data );

		try {
			await doc.validate();
		} catch( e ) {
			return p.respond( new Response( 417, e ) );
		}

		doc = await doc.save();

		if( doc ) {
			return p.respond( new Response( 202, doc ) );
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
