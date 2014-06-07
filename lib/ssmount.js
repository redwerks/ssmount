#!/usr/bin/env node
"use strict";

require('pkginfo')(module, ['name', 'description', 'version']);

var child_process = require('child_process'),
	fs = require('fs'),
	path = require('path'),
	mkdirp = require('mkdirp'),
	which = require('which'),
	_ = require('lodash'),
	S = require('string'),
	program = require('commander'),
	datastore = require('./datastore');

program
	.version(exports.version)
	.option('-c, --config <file>', 'use a different user config file, defaults to ~/.config/ssmount.json');

program
	.command('list')
	.description('List the saved sshfs endpoints')
	.action(function() {
		datastore.setup(program);

		_(datastore.mounts.list())
			.sortBy('name')
			.each(function(mount) {
				console.log('%s %s', S(mount.name).padRight(10).s, mount.dest);
			});

		console.log("/ End of list");
	});

program
	.command('add <name> <dest>')
	.description('add new sshfs endpoints')
	.option('-f, --force', 'add endpoint even if name is already in use')
	.action(function(name, dest, o) {
		datastore.setup(program);

		if ( datastore.mounts.get(name) && !o.force ) {
			console.error("A mount by the name %s already exists", name);
			throw { exit: 1 };
		} else {
			datastore.mounts.add(name, dest);
			datastore.save();
		}
	});

program
	.command('rm <name>')
	.description('remove sshfs endpoints')
	.action(function(name) {
		datastore.setup(program);
		datastore.mounts.rm(name);
		datastore.save();
	});

program
	.command('mount <name>')
	.description('mount a sshfs endpoint')
	.action(function(name) {
		datastore.setup(program);

		var mount = datastore.mounts.get(name),
			cmdArgs = [];

		if ( !mount ) {
			console.error('/ There is no saved mount by the name %s', name);
			throw { exit: 1 };
		}

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
					throw { exit: 1 };
				} else {
					console.log('/ %s mounted at %s', mount.name, mount.point);
				}
			})
			.on('error', function(err) {
				throw err;
			});
	});

program
	.command('unmount <name>')
	.description('unmount a mounted sshfs endpoint')
	.option('-f, --force', 'unmount even if in use')
	.action(function(name, o) {
		datastore.setup(program);

		var mount = datastore.mounts.get(name),
			cmdArgs = ['unmount'];

		if ( !mount ) {
			console.error('/ There is no saved mount by the name %s', name);
			throw { exit: 1 };
		}

		if ( o.force ) {
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
						throw { exit: 1 };
					} else {
						fs.rmdirSync(mount.point);
						console.log('/ Unmount finished');
					}
				})
				.on('error', function(err) {
					throw err;
				});
		}
	});

// Only make `ssmount subl` available when the subl command has been installed
if ( which.sync('subl') ) {
	program
		.command('subl <name> [file]')
		.description('open the mount point (or a file within it) in Sublime Edit')
		.action(function(name, file) {
			datastore.setup(program);

			var mount = datastore.mounts.get(name),
				cmdArgs = [];

			if ( !mount ) {
				console.error('/ There is no saved mount by the name %s', name);
				throw { exit: 1 };
			}

			if ( file ) {
				cmdArgs.push(path.join(mount.point, file));
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
							throw { exit: 1 };
						} else {
							console.log('/ Done');
						}
					})
					.on('error', function(err) {
						throw err;
					});
			}
		});
}

program
	.command('help [command]')
	.description('output usage information')
	.action(function(command) {
		if ( command ) {
			console.error("Sorry, per command help hasn't been implemented.");
		} else {
			program.help();
		}
	});

try {
	program.parse(process.argv);
} catch ( e ) {
	if ( e.exit ) {
		process.exit(1);
	} else {
		throw e;
	}
}

if ( process.argv.length <= 2 ) {
	program.help();
}
