"use strict";

var util = require('util'),
	Dict = require('collections/dict'),
	_ = require('lodash');

module.exports = new Dict();

var commands = [
	'version'
];

_.each(commands, function(name) {
	var cmd = require(util.format('./commands/%s', name));
	module.exports.set(name, cmd);
});
