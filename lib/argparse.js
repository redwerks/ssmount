"use strict";

module.exports = argparse;

var cliArgparse = require('cli-argparse'),
	util = require('util'),
	Dict = require('collections/dict'),
	_ = require('lodash');

function argparse(args) {
	var self = Object.create(argparse.prototype);

	if ( args ) {
		self.original = args;
	} else {
		self.original = process.argv.slice(2);
	}

	self.remaining = self.original.slice();

	self.options = new Dict();

	return self;
}

argparse.types = {
	bool: {
		flag: true,
		default: false,
		parse: function(arg) {
			return !!arg;
		}
	},
	string: {
		default: undefined,
		parse: function(arg) {
			return arg;
		}
	}
};

argparse.prototype.parse = function(params) {
	var self = this,
		namedParams = [],
		positionalParams = [],
		options = [],
		flags = [],
		alias = {};

	_.forIn(params, function(param, name) {
		var paramAliases = [],
			cliOpts;

		if ( !param.type ) {
			throw new Error("types must be defined for params");
		} else if ( param.type in argparse.types ) {
			param.type = argparse.types[param.type];
		} else {
			throw new Error(util.format("argparse has no type %s", param.type));
		}

		param.key = name;
		param.name = param.name || name;

		// Add to flags if the type says so, otherwise use options.
		cliOpts = param.type.flag
			? flags
			: options;

		if ( param.named !== false ) {
			cliOpts.push('--' + param.name);
			paramAliases.push('--' + param.name);
		}

		if ( param.short ) {
			if ( _.isString(param.short) ) {
				param.short = [param.short];
			}

			_.each(param.short, function(s) {
				cliOpts.push('-' + s);
				paramAliases.push('-' + s);
			});
		}

		if ( paramAliases.length ) {
			namedParams.push(param);
			alias[paramAliases.join(' ')] = param.key;
		}

		if ( 'position' in param ) {
			positionalParams.push(param);
		}
	});

	positionalParams = _.sortBy(positionalParams, 'position');

	var result = cliArgparse(this.remaining, {
		options: options,
		flags: flags,
		alias: alias,
		flat: true,
		strict: true
	});

	_.each(namedParams, function(param) {
		if ( param.key in result.options ) {
			self.options.set(param.key, param.type.parse(result.options[param.key]));
			param.used = true;
		}
	});

	var remaining = result.unparsed;

	_.each(positionalParams, function(param) {
		// If a param is both positional and named and the --name version is used skip the positional handling
		if ( param.used ) { return; }

		if ( remaining.length ) {
			var arg = remaining.shift();
			self.options.set(param.key, param.type.parse(arg));
			param.used = true;
		}
	});

	_.forIn(params, function(param) {
		// If the param wasn't used, then use the default
		if ( !param.used ) {
			if ( 'default' in param ) {
				self.options.set(param.key, param.default);
			} else {
				self.options.set(param.key, param.type.default);
			}
		}
	});

	this.remaining = remaining;

	return this;
};

argparse.prototype.get = function(name) {
	return this.options.get(name);
};
