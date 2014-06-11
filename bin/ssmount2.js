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
	if ( command.available === false ) {
		console.error("error: the '%s' command is not available", cmd);
		process.exit(1);
	}

	if ( command.options ) {
		try {
			args.parse(command.options);
		} catch ( e ) {
			if ( e.name === 'RequiredOptionError' ) {
				console.error("error: %s", e.message);
				process.exit(1);
			} else {
				throw e;
			}
		}
	}

	try {
		command.action(args);
	} catch ( e ) {
		if ( e.exit ) {
			process.exit(1);
		} else {
			throw e;
		}
	}
} else {
	console.error("error: '%s' is not a ssmount command.", cmd);
	// @todo Insert usage
	process.exit(1);
}
