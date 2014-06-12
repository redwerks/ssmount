"use strict";

var Q = require('q'),
	util = require('util'),
	child_process = require('child_process'),
	shellquote = require('shell-quote').quote,
	datastore = require('../datastore');

exports.description = "open a remote ssh connection to the mount's destination";

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
	var d = Q.defer(),
		name = args.get('name'),
		mount = datastore.mounts.get(name),
		cmdArgs = [];

	if ( !mount ) {
		console.error('/ There is no saved mount by the name %s', name);
		throw { exit: 1 };
	}

	// Present self as a TTY
	cmdArgs.push('-t');

	// Connect to the user@host
	cmdArgs.push(mount.sshUserHost);

	// cd into the relevant directory then run bash
	cmdArgs.push(util.format('cd %s; exec bash -l', shellquote([mount.dir || '.'])));

	child_process.spawn('ssh', cmdArgs, { stdio: 'inherit' })
		.on('close', function() {
			d.resolve();
		})
		.on('error', function(err) {
			d.reject(err);
		});

	return d.promise;
};
