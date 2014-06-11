"use strict";

var child_process = require('child_process'),
	fs = require('fs'),
	datastore = require('../datastore');

exports.description = "unmount a mounted sshfs endpoint";

exports.options = {
	force: {
		type: 'bool',
		short: 'f'
	},
	name: {
		type: 'string',
		named: false,
		position: 0,
		require: true
	}
};

exports.action = function(args) {
	datastore.setup({config: args.get('config')});

	var name = args.get('name'),
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
	} else {
		child_process.spawn('diskutil', cmdArgs, { stdio: 'inherit' })
			.on('close', function(code) {
				if ( code > 0 ) {
					console.error('/ Unmount failed');
					process.exit(1);
				} else {
					fs.rmdirSync(mount.point);
					console.log('/ Unmount finished');
				}
			})
			.on('error', function(err) {
				throw err;
			});
	}
};
