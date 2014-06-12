"use strict";

var datastore = require('../datastore');

exports.description = "add new sshfs endpoints";

exports.options = {
	force: {
		type: 'bool',
		short: 'f',
		help: 'add endpoint even if name is already in use'
	},
	name: {
		type: 'string',
		named: false,
		position: 0,
		require: true,
		help: 'the mount name'
	},
	dest: {
		type: 'string',
		named: false,
		position: 1,
		require: true,
		usage: '[user@]host:[dir]',
		help: 'the SSHFS destination'
	}
};

exports.action = function(args) {
	datastore.setup({config: args.get('config')});
	var name = args.get('name'),
		dest = args.get('dest');

	if ( datastore.mounts.get(name) && !args.get('force') ) {
		console.error("A mount by the name %s already exists", name);
		throw { exit: 1 };
	} else {
		datastore.mounts.add(name, dest);
		datastore.save();
	}
};
