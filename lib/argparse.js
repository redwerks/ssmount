"use strict";

module.exports = argparse;

var cliArgparse = require('cli-argparse'),
	util = require('util'),
	Dict = require('collections/dict'),
	_ = require('lodash'),
	err = require('./errors');

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

argparse.normalizeParams = function(params) {
	params = {
		all: _.cloneDeep(params),
		named: [],
		positional: []
	};

	_.forIn(params.all, function(param, name) {
		if ( !param.type ) {
			throw new Error("types must be defined for params");
		} else if ( _.isObject(param.type) && _.isFunction(param.type.parse) ) {
			// Do nothing since type is already an object
		} else if ( param.type in argparse.types ) {
			param.type = argparse.types[param.type];
		} else {
			throw new Error(util.format("argparse has no type %s", param.type));
		}

		param.key = name;
		param.name = param.name || name;
		param.flag = !!param.type.flag;
		param.cliArgs = [];
		delete param.metaVar;

		if ( param.short ) {
			if ( _.isString(param.short) ) {
				param.short = [param.short];
			}

			_.each(param.short, function(s) {
				param.cliArgs.push('-' + s);
			});
		}

		if ( param.named !== false ) {
			param.cliArgs.push('--' + param.name);
		}

		if ( param.cliArgs.length ) {
			params.named.push(param);

			if ( !param.flag ) {
				param.metaVar = util.format('<%s>', param.meta || param.key);
			}
		}

		if ( 'position' in param ) {
			params.positional.push(param);

			param.usage = param.usage || util.format(
				param.require ? '<%s>' : '[%s]',
				param.name);
		}
	});

	params.positional = _.sortBy(params.positional, 'position');

	return params;
};

argparse.prototype.parse = function(params) {
	var self = this,
		options = [],
		flags = [],
		alias = {};

	params = argparse.normalizeParams(params);

	_.forIn(params.all, function(param) {
		// Add to flags if the type says so, otherwise use options.
		var cliOpts = param.type.flag
			? flags
			: options;

		_.each(param.cliArgs, function(arg) {
			cliOpts.push(arg);
		});

		if ( param.cliArgs.length ) {
			alias[param.cliArgs.join(' ')] = param.key;
		}
	});

	var result = cliArgparse(this.remaining, {
		options: options,
		flags: flags,
		alias: alias,
		flat: true,
		strict: true
	});

	_.each(params.named, function(param) {
		if ( param.key in result.options ) {
			self.options.set(param.key, param.type.parse(result.options[param.key]));
			param.used = true;
		}
	});

	var remaining = result.unparsed;

	_.each(params.positional, function(param) {
		// If a param is both positional and named and the --name version is used skip the positional handling
		if ( param.used ) { return; }

		if ( remaining.length ) {
			var arg = remaining.shift();
			self.options.set(param.key, param.type.parse(arg));
			param.used = true;
		}
	});

	_.forIn(params.all, function(param) {
		// If the param wasn't used, then use the default
		if ( !param.used ) {
			if ( param.require ) {
				throw new err.RequiredOptionError(["missing required argument '%s'", param.name], {
					paramName: param.name
				});
			} else if ( 'default' in param ) {
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
