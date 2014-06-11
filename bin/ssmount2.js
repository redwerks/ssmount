#!/usr/bin/env node
"use strict";

process.bin = process.title = 'ssmount2';

var argparse = require('../lib/argparse');

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

console.log(args);
