"use strict";

var util = require('util'),
	_ = require('lodash');

function errorFactory(name) {
	var CustomError = function(msg, opts) {
		_.merge(this, opts || {});
		this.name = name;
		this.message = _.isArray(msg)
			? util.format.apply(util, msg)
			: msg || '';

		if ( Error.captureStackTrace ) {
			Error.captureStackTrace(this, this.constructor || this);
		}
	};

	CustomError.prototype = new Error();
	CustomError.prototype.constructor = CustomError;
	CustomError.prototype.name = name;

	return CustomError;
}

exports.RequiredOptionError = errorFactory('RequiredOptionError');
