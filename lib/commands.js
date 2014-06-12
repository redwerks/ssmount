"use strict";

var util = require('util'),
	Dict = require('collections/dict'),
	_ = require('lodash'),
	abbrev = require('abbrev');

var commands = new Dict(),
	commandNames = [
		'list',
		'add',
		'rm',
		'mount',
		'unmount',
		'ssh',
		'subl',
		'help',
		'version'
	],
	allCommandNames = [],
	aliasMap = new Dict(),
	abbreviations = new Dict();

_.each(commandNames, function(name) {
	var cmd = require(util.format('./commands/%s', name));
	cmd.name = name;
	commands.set(name, cmd);

	allCommandNames.push(name);

	if ( cmd.aliases ) {
		_.each(cmd.aliases, function(aliasName) {
			aliasMap.set(aliasName, name);
			allCommandNames.push(aliasName);
		});
	}
});

_.forOwn(abbrev(allCommandNames), function(name, alias) {
	abbreviations.set(alias, name);
});

exports.get = function(cmd) {
	cmd = abbreviations.get(cmd, cmd);
	cmd = aliasMap.get(cmd, cmd);

	return commands.get(cmd);
};

exports.forEach = function() {
	return commands.forEach.apply(commands, arguments);
};


Object.defineProperty(exports, 'length', {
	get: function() {
		return commands.length;
	}
});
