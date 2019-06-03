/** ****************************************************************************************************
 * File: removeItem.delete.js
 * Project: api
 * @author Nick Soggin <iSkore@users.noreply.github.com> on 19-Apr-2019
 *******************************************************************************************************/
'use strict';

const
	Response = require( 'http-response-class' ),
	MongoDB  = require( '../../services/mongo/MongoDB' ),
	{
		validate,
		deleteDBObject
	}        = require( '../../services/superstructs' );

const
	collections = MongoDB.getCollections().join( '|' );

module.exports.method = 'DELETE';
module.exports.route  = `/item/:collection(${ collections })`;
module.exports.exec   = async ( req, res ) => {
	const p = res.locals;

	try {
		return p.respond( new Response( 501, `DELETE /item/${ p.params.collection } not implemented` ) );
	} catch( e ) {
		return e instanceof Response ?
			p.respond( e ) :
			p.respond( new Response( e.statusCode || 500, e.data || e.stack || e.message || e ) );
	}
};
