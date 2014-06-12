"use strict";

var datastore = require('../datastore');

exports.description = "remove sshfs endpoints";

exports.aliases = ['-', 'delete'];

exports.options = {
	name: {
		type: 'string',
		named: false,
		position: 0,
		require: true,
		help: 'the mount name'
	}
};

exports.action = function(args) {
	datastore.setup({config: args.get('config')});
	datastore.mounts.rm(args.get('name'));
	datastore.save();
};
