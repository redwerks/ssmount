"use strict";

var Q = require('q'),
	child_process = require('child_process'),
	fs = require('fs'),
	datastore = require('../datastore');

exports.description = "unmount a mounted sshfs endpoint";

exports.options = {
	force: {
		type: 'bool',
		short: 'f',
		help: 'unmount even if in use'
	},
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
		cmdArgs = ['unmount'];

	if ( !mount ) {
		console.error('/ There is no saved mount by the name %s', name);
		throw { exit: 1 };
	}

	if ( args.get('force') ) {
		cmdArgs.push('force');
	}

	cmdArgs.push(mount.point);

	if ( !fs.existsSync(mount.point) ) {
		console.warn('/ %s was not mounted', mount.name);
		d.resolve();
	} else {
		child_process.spawn('diskutil', cmdArgs, { stdio: 'inherit' })
			.on('close', function(code) {
				if ( code > 0 ) {
					console.error('/ Unmount failed');
					d.reject({ exit: 1 });
				} else {
					fs.rmdirSync(mount.point);
					console.log('/ Unmount finished');
					d.resolve();
				}
			})
			.on('error', function(err) {
				d.reject(err);
			});
	}

	return d.promise;
};
