"use strict";

var util = require('util'),
	Dict = require('collections/dict'),
	_ = require('lodash');

module.exports = new Dict();

var commands = [
	'list',
	'add',
	'rm',
	'mount',
	'unmount',
	'ssh',
	'subl',
	'version'
];

_.each(commands, function(name) {
	var cmd = require(util.format('./commands/%s', name));
	cmd.name = name;
	module.exports.set(name, cmd);
});
