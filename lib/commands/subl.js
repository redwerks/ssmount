"use strict";

var Q = require('q'),
	child_process = require('child_process'),
	fs = require('fs'),
	path = require('path'),
	which = require('which'),
	datastore = require('../datastore');

exports.description = "open the mount point (or a path within it) in Sublime Edit";

// Only make `ssmount subl` available when the subl command has been installed
exports.available = (function() {
	try {
		return !!which.sync('subl');
	} catch ( e ) {
		return false;
	}
})();

exports.options = {
	name: {
		type: 'string',
		named: false,
		position: 0,
		require: true,
		help: 'the mount name'
	},
	path: {
		type: 'string',
		named: false,
		position: 1,
		help: 'a path relative to the mount to open'
	}
};

exports.action = function(args) {
	datastore.setup({config: args.get('config')});
	var d = Q.defer(),
		name = args.get('name'),
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
					d.reject({ exit: 1 });
				} else {
					console.log('/ Done');
					d.resolve();
				}
			})
			.on('error', function(err) {
				d.reject(err);
			});
	}

	return d.promise;
};
