"use strict";

var Q = require('q'),
	child_process = require('child_process'),
	fs = require('fs'),
	mkdirp = require('mkdirp'),
	datastore = require('../datastore');

exports.description = "mount a sshfs endpoint";

exports.aliases = ['mnt', 'm'];

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

	// These options avoid having permissions broken by things like ACLs on the server
	cmdArgs.push('-o', 'allow_other,default_permissions');

	cmdArgs.push(mount.dest);
	cmdArgs.push(mount.point);

	if ( !fs.existsSync(mount.point) ) {
		mkdirp.sync(mount.point);
	}

	child_process.spawn('sshfs', cmdArgs, { stdio: 'inherit' })
		.on('close', function(code) {
			if ( code > 0 ) {
				// Remove the directory if the mount failed
				fs.rmdirSync(mount.point);
				console.error('/ Mount failed');
				d.reject({ exit: 1 });
			} else {
				console.log('/ %s mounted at %s', mount.name, mount.point);
				d.resolve();
			}
		})
		.on('error', function(err) {
			d.reject(err);
		});

	return d.promise;
};
