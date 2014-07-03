"use strict";

var _ = require('lodash'),
	S = require('string'),
	datastore = require('../datastore');

exports.description = "list the saved sshfs endpoints";

exports.aliases = ['ls', 'l'];

exports.action = function(args) {
	datastore.setup({config: args.get('config')});

	_(datastore.mounts.list())
		.sortBy('name')
		.each(function(mount) {
			console.log('%s %s', S(mount.name).padRight(10).s, mount.dest);
		});

	console.log("/ End of list");
};
