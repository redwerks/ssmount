#!/usr/bin/env node
"use strict";

process.bin = process.title = 'ssmount2';

var argparse = require('../lib/argparse'),
	commands = require('../lib/commands');

var args = argparse()
	.parse({
		config: {
			type: 'string',
			short: 'c'
		},
		version: {
			type: 'bool',
			short: 'V',
		},
		help: {
			type: 'bool',
			short: 'h'
		},
		command: {
			type: 'string',
			named: false,
			position: 0
		}
	}),
	cmd = args.get('command');

if ( args.get('version') ) {
	cmd = 'version';
}

if ( args.get('help') ) {
	// @todo Implement --help
}

if ( !cmd ) {
	// @todo Implement usage
	process.exit();
}

var command = commands.get(cmd);
if ( command ) {
	command.action();
} else {
	// @todo Implement unknown command message
	process.exit(1);
}
