"use strict";

module.exports = {
	config: {
		type: 'string',
		short: 'c',
		meta: 'path',
		help: 'use a different user config file, defaults to ~/.config/ssmount.json'
	},
	help: {
		type: 'bool',
		short: 'h',
		help: 'output usage information'
	},
	version: {
		type: 'bool',
		short: 'V',
		help: 'output the version number'
	},
	command: {
		type: 'string',
		named: false,
		position: 0,
		help: 'the command to run'
	}
};
