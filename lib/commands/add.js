"use strict";

var datastore = require('../datastore');

exports.description = "add new sshfs endpoints";

exports.options = {
	force: {
		type: 'bool',
		short: 'f'
	},
	name: {
		type: 'string',
		named: false,
		position: 0
	},
	dest: {
		type: 'string',
		named: false,
		position: 1
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
