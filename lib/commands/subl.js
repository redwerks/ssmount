"use strict";

var child_process = require('child_process'),
	fs = require('fs'),
	path = require('path'),
	which = require('which'),
	datastore = require('../datastore');

exports.description = "open the mount point (or a path within it) in Sublime Edit";

// Only make `ssmount subl` available when the subl command has been installed
exports.available = which.sync('subl');

exports.options = {
	name: {
		type: 'string',
		named: false,
		position: 0,
		require: true
	},
	path: {
		type: 'string',
		named: false,
		position: 1
	}
};

exports.action = function(args) {
	datastore.setup({config: args.get('config')});

	var name = args.get('name'),
		filePath = args.get('path'),
		mount = datastore.mounts.get(name),
		cmdArgs = [];

	if ( !mount ) {
		console.error('/ There is no saved mount by the name %s', name);
		throw { exit: 1 };
	}

	if ( filePath ) {
		cmdArgs.push(path.join(mount.point, filePath));
	} else {
		cmdArgs.push(mount.point);
	}

	if ( !fs.existsSync(mount.point) ) {
		console.error('/ %s is not mounted', mount.name);
		throw { exit: 1 };
	} else {
		child_process.spawn('subl', cmdArgs, { stdio: 'inherit' })
			.on('close', function(code) {
				if ( code > 0 ) {
					console.error('/ Failed');
					process.exit(1);
				} else {
					console.log('/ Done');
				}
			})
			.on('error', function(err) {
				throw err;
			});
	}
};
