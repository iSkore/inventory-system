/** ****************************************************************************************************
 * File: variables.js
 * Project: api
 * @author Nick Soggin <iSkore@users.noreply.github.com> on 29-Jan-2019
 *******************************************************************************************************/
'use strict';

const
	ERROR          = 'Error',
	ARGUMENT_ERROR = 'Argument Error';

module.exports = {
	ERROR,
	ARGUMENT_ERROR,
	FUNCTION_ERROR: `${ ERROR } - Function failed.`,
	ARGUMENT_ERROR_PROPERTY: p => `${ ARGUMENT_ERROR } - Item expected to have property: ${ p }`,
	ARGUMENT_ERROR_BOOLEAN: `${ ARGUMENT_ERROR } - Item expected to be typeof Boolean`,
	ARGUMENT_ERROR_STRING: `${ ARGUMENT_ERROR } - Item expected to be typeof String`,
	ARGUMENT_ERROR_NUMBER: `${ ARGUMENT_ERROR } - Item expected to be typeof Number`,
	ARGUMENT_ERROR_ARRAY: `${ ARGUMENT_ERROR } - Item expected to be typeof Array`,
	ARGUMENT_ERROR_OBJECT: `${ ARGUMENT_ERROR } - Item expected to be typeof Object`,
	ARGUMENT_ERROR_FUNCTION: `${ ARGUMENT_ERROR } - Item expected to be typeof Function`,
	ARGUMENT_ERROR_POWER: `${ ARGUMENT_ERROR } - Item expected to be power of two`,
	ARGUMENT_ERROR_HTTP: `${ ARGUMENT_ERROR } - Method expected to be valid HTTP method`,
	ARGUMENT_ERROR_EMAIL: `${ ARGUMENT_ERROR } - Item expected to be valid email`,
	ARGUMENT_ERROR_IPV4: `${ ARGUMENT_ERROR } - Item expected to be valid IPv4`,
	ARGUMENT_ERROR_DOMAIN_NAME: `${ ARGUMENT_ERROR } - Item expected to be valid domain name`,
	LARGE_ARRAY_SIZE: 200,
	FLOAT_EPSILON: 1.19209290e-7,
	DOUBLE_EPSILON: 2.2204460492503131e-16,
	LOG_KIBIBYTE: Math.log( 1024 ),
	EDGE: '*****'.repeat( 12 )
};
