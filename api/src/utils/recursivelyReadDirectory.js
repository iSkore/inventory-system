/** ****************************************************************************************************
 * File: recursivelyReadDirectory.js
 * Project: boilerplate-express-api
 * @author Nick Soggin <iSkore@users.noreply.github.com> on 15-Mar-2019
 *******************************************************************************************************/
'use strict';

const
	{ promises: { readdir, stat } } = require( 'fs' ),
	{ resolve, join }               = require( 'path' );

async function recursivelyReadDirectory( dir, items = [] ) {
	const layer = await readdir( resolve( dir ) );

	await Promise.all(
		layer.map(
			async fpath => {
				fpath      = join( dir, fpath );
				const info = await stat( fpath );

				if( info.isDirectory() ) {
					return await recursivelyReadDirectory( fpath, items );
				} else {
					items.push( fpath );
				}
			}
		)
	);

	return items;
}

module.exports = recursivelyReadDirectory;
