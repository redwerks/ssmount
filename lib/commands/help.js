"use strict";

var pkg = require('../package'),
	commands = require('../commands'),
	usage = require('../usage'),
	commonOptions = require('../common-cli-options');

exports.description = "output usage information";

exports.options = {
	cmd: {
		type: 'string',
		named: false,
		position: 0,
		help: 'command to output usage information for'
	}
};

exports.basicUsage = function() {
	usage({
		description: pkg.description,
		commands: commands,
		options: commonOptions
	});
};

exports.commandUsage = function(command) {
	usage({
		description: command.description,
		name: command.name,
		options: command.options
	});
};

exports.action = function(args) {
	var cmd = args.get('cmd');

	if ( cmd ) {
		var command = commands.get(cmd);

		if ( command ) {
			exports.commandUsage(command);
		} else {
			console.error("error: '%s' is not a ssmount command.", cmd);
			exports.basicUsage();
			process.exit(1);
		}
	} else {
		exports.basicUsage();
	}
};
