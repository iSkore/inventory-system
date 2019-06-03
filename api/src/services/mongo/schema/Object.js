/** ****************************************************************************************************
 * File: Zone.js
 * Project: api
 * @author Nick Soggin <iSkore@users.noreply.github.com> on 20-Feb-2019
 *******************************************************************************************************/
'use strict';

const
	mongoose = require( 'mongoose' ),
	Schema   = mongoose.Schema;

const objectSchema = new Schema(
	{
		_id: Schema.Types.ObjectId
	},
	{
		strict: false,
		timestamps: true
	}
);

module.exports = mongoose.models.object || mongoose.model( 'object', objectSchema );
