#!/usr/bin/env node
"use strict";

process.bin = process.title = 'ssmount2';

var S = require('string'),
	argparse = require('../lib/argparse'),
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
	var usage = [];
	usage.push('');
	usage.push('  Usage: ' + process.title + ' [options] [command]');
	usage.push('');
	usage.push('  Commands:');
	usage.push('');
	commands.forEach(function(command) {
		var line = '    ' + S(command.name).padRight(20).s + ' ' + command.description;
		usage.push(line);
	});
	usage.push('');
	usage.push('  Options:');
	usage.push('');
	usage.push('');
	usage.push('');
	console.log(usage.join('\n'));
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
