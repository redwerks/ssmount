#!/usr/bin/env node
"use strict";

process.bin = process.title = 'ssmount2';

var argparse = require('../lib/argparse'),
	commands = require('../lib/commands'),
	help = require('../lib/commands/help'),
	options = require('../lib/common-cli-options');

var args = argparse().parse(options),
	cmd = args.get('command');

if ( args.get('help') ) {
	cmd = 'help';

	// Push any real command back into the unparsed stuff
	if ( args.options.get('command') ) {
		args.remaining.unshift(args.options.get('command'));
		args.options.delete('command');
	}
}

if ( args.get('version') ) {
	cmd = 'version';
}

if ( !cmd ) {
	// Display usage information by default
	cmd = 'help';
}

var command = commands.get(cmd);
if ( command ) {
	if ( command.available === false ) {
		console.error("error: the '%s' command is not available", cmd);
		help.basicUsage();
		process.exit(1);
	}

	if ( command.options ) {
		try {
			args.parse(command.options);
		} catch ( e ) {
			if ( e.name === 'RequiredOptionError' ) {
				console.error("error: %s", e.message);
				help.commandUsage(command);
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
	help.basicUsage();
	process.exit(1);
}
