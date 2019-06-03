/** ****************************************************************************************************
 * File: objectLiterals.js
 * Project: api
 * @author Nick Soggin <iSkore@users.noreply.github.com> on 29-Jan-2019
 *******************************************************************************************************/
'use strict';

function _isNotNaN( n ) {
	return ( n === n );
}

function isNaN( ...n ) {
	return !n.filter( _isNotNaN ).length;
}

function _isNotUndefined( n ) {
	return ( n !== undefined );
}

function isUndefined( ...n ) {
	return !n.filter( _isNotUndefined ).length;
}

function _isNotNull( n ) {
	return ( n !== null );
}

function isNull( ...n ) {
	return !n.filter( _isNotNull ).length;
}

function _isNotBoolean( n ) {
	return ( !!n !== n );
}

function isBoolean( ...n ) {
	return !n.filter( _isNotBoolean ).length;
}

function _isNotString( n ) {
	return ( '' + n !== n );
}

function isString( ...n ) {
	return !n.filter( _isNotString ).length;
}

function _isNotNumber( n ) {
	return ( +n !== n );
}

function isNumber( ...n ) {
	return !n.filter( _isNotNumber ).length;
}

function _isNotPrimitive( n ) {
	return _isNotBoolean( n ) && _isNotString( n ) && _isNotNumber( n );
}

function isPrimitive( ...n ) {
	return !n.filter( _isNotPrimitive ).length;
}

function _isNotArray( n ) {
	return !Array.isArray( n );
}

function isArray( ...n ) {
	return !n.filter( _isNotArray ).length;
}

function _isNotMap( n ) {
	return !( n instanceof Map );
}

function isMap( ...n ) {
	return !n.filter( _isNotMap ).length;
}

function _isNotUint8Array( n ) {
	return !( n instanceof Uint8Array );
}

function isUint8Array( ...n ) {
	return !n.filter( _isNotUint8Array ).length;
}

function _isNotInt8Array( n ) {
	return !( n instanceof Int8Array );
}

function isInt8Array( ...n ) {
	return !n.filter( _isNotInt8Array ).length;
}

function _isNotInt16Array( n ) {
	return !( n instanceof Int16Array );
}

function isInt16Array( ...n ) {
	return !n.filter( _isNotInt16Array ).length;
}

function _isNotUint16Array( n ) {
	return !( n instanceof Uint16Array );
}

function isUint16Array( ...n ) {
	return !n.filter( _isNotUint16Array ).length;
}

function _isNotInt32Array( n ) {
	return !( n instanceof Int32Array );
}

function isInt32Array( ...n ) {
	return !n.filter( _isNotInt32Array ).length;
}

function _isNotUint32Array( n ) {
	return !( n instanceof Uint32Array );
}

function isUint32Array( ...n ) {
	return !n.filter( _isNotUint32Array ).length;
}

function _isNotFloat32Array( n ) {
	return !( n instanceof Float32Array );
}

function isFloat32Array( ...n ) {
	return !n.filter( _isNotFloat32Array ).length;
}

function _isNotFloat64Array( n ) {
	return !( n instanceof Float64Array );
}

function isFloat64Array( ...n ) {
	return !n.filter( _isNotFloat64Array ).length;
}

function _isNotAnyArray( n ) {
	return _isNotArray( n ) &&
		_isNotUint8Array( n ) &&
		_isNotInt8Array( n ) &&
		_isNotInt16Array( n ) &&
		_isNotUint16Array( n ) &&
		_isNotInt32Array( n ) &&
		_isNotUint32Array( n ) &&
		_isNotFloat32Array( n ) &&
		_isNotFloat64Array( n );
}

function isAnyArray( ...n ) {
	return !n.filter( _isNotAnyArray ).length;
}

function _isNotObject( n ) {
	return !( _isNotArray( n ) && typeof n === 'object' );
}

function isObject( ...n ) {
	return !n.filter( _isNotObject ).length;
}

function _isNotBuffer( n ) {
	return !( Buffer.isBuffer( n ) );
}

function isBuffer( ...n ) {
	return !n.filter( _isNotBuffer ).length;
}

function _isNotFunction( n ) {
	return typeof n !== 'function';
}

function isFunction( ...n ) {
	return !n.filter( _isNotFunction ).length;
}

function _isNotValue( n ) {
	return !( _isNotNaN( n ) && _isNotUndefined( n ) && _isNotNull( n ) );
}

function isValue( ...n ) {
	return !n.filter( _isNotValue ).length;
}


function _isNotInstanceOf( n, instance ) {
	return !( n instanceof instance );
}

function instanceOf( instance, ...n ) {
	return !n.filter( i => _isNotInstanceOf( i, instance ) ).length;
}

module.exports = {
	isNaN,
	isUndefined,
	isNull,
	isBoolean,
	isString,
	isNumber,
	isPrimitive,
	isArray,
	isMap,
	isUint8Array,
	isInt8Array,
	isInt16Array,
	isUint16Array,
	isInt32Array,
	isUint32Array,
	isFloat32Array,
	isFloat64Array,
	isAnyArray,
	isObject,
	isBuffer,
	isFunction,
	isValue,
	instanceOf
};
