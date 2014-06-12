"use strict";

module.exports = usage;

var _ = require('lodash'),
	S = require('string'),
	argparse = require('./argparse');

function usage(opts) {
	opts = opts || {};
	opts.options = argparse.normalizeParams(opts.options);

	var usg = process.title;

	if ( opts.name ) {
		usg += ' ' + opts.name;
	}

	if ( opts.options.named.length ) {
		usg += ' [options]';
	}

	_.each(opts.options.positional, function(param) {
		usg += ' ' + param.usage;
	});

	console.log('');
	console.log('  Usage: ' + usg);
	console.log('');

	if ( opts.description ) {
		console.log('  ' + opts.description);
		console.log('');
	}

	if ( opts.commands && opts.commands.length ) {
		console.log('  Commands:');
		console.log('');
		opts.commands.forEach(function(command) {
			var line = '    ' + S(command.name).padRight(20).s + ' ' + command.description;
			console.log(line);
		});
		console.log('');
	}

	if ( opts.options.positional.length + opts.options.named.length ) {
		console.log('  Options:');
		console.log('');

		_.each(opts.options.positional, function(param) {
			var cliArg = param.usage,
				line = '    ';

			if ( param.help ) {
				line += S(cliArg).padRight(20).s + ' ' + param.help;
			} else {
				line += cliArg;
			}

			console.log(line);
		});

		_.each(opts.options.named, function(param) {
			var cliArg = param.cliArgs.join(', ') + (param.metaVar ? ' ' + param.metaVar : ''),
				line = '    ';

			if ( param.help ) {
				line += S(cliArg).padRight(20).s + ' ' + param.help;
			} else {
				line += cliArg;
			}

			console.log(line);
		});
		console.log('');
	}
}
