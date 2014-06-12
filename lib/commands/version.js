"use strict";

var pkg = require('../package');

exports.description = "output the version number";

exports.action = function() {
	console.log(pkg.version);
};
