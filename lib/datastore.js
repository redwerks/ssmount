"use strict";

var fs = require('fs'),
	path = require('path'),
	_ = require('lodash');

function DataStore(filename) {
	this.filename = filename;
}

DataStore.prototype.setup = function(program) {
	if ( this._program !== program ) {
		this._program = program;
		this.setFile(program.config || path.join(process.env['HOME'], '.config/ssmount.json'));
	}
};

DataStore.prototype.setFile = function(filename) {
	this.filename = filename;
	delete this._config;
};

DataStore.prototype.load = function() {
	if ( !this.filename ) {
		throw new Error("Filename must be defined to load datastore.");
	}

	try {
		var data = fs.readFileSync(this.filename),
			json = JSON.parse(data);

		this._config = json;
	} catch ( e ) {
		if ( e.code === 'ENOENT' ) {
			// Config file does not exist
			this._config = {};
		} else {
			throw e;
		}
	}

	this._config.mounts = this._config.mounts || {};
};

DataStore.prototype._loaded = function() {
	if ( !this._config ) {
		this.load();
	}
};

DataStore.prototype.save = function() {
	if ( !this.filename ) {
		throw new Error("Filename must be defined to save datastore.");
	}

	this._loaded();

	// The default dir is ~/.config which may not exist for some users,
	// so attempt one level of directory creation before allowing missing
	// directories to cause save to fail.
	if ( !fs.existsSync(path.dirname(this.filename)) ) {
		fs.mkdirSync(path.dirname(this.filename));
	}

	fs.writeFileSync(this.filename, JSON.stringify(this._config));
};

Object.defineProperty(DataStore.prototype, 'mounts', {
	get: function() {
		if ( !_.has(this, '_mounts') ) {
			this._mounts = new Mounts(this);
		}

		return this._mounts;
	}
});

function Mounts(config) {
	this.config = config;
}

Mounts.prototype.get = function(name) {
	this.config._loaded();

	if ( _.has( this.config._config.mounts, name ) ) {
		return new Mount(this, name, this.config._config.mounts[name]);
	} else {
		return undefined;
	}
};

Mounts.prototype.list = function() {
	this.config._loaded();

	return _.map(this.config._config.mounts, _.bind(function(opts, name) {
		return new Mount(this, name, opts);
	}, true));
};

Mounts.prototype.add = function(name, dest) {
	this.config._loaded();

	this.config._config.mounts[name] = Mount.parse(dest);
};

Mounts.prototype.rm = function(name) {
	this.config._loaded();

	delete this.config._config.mounts[name];
};

function Mount(mounts, name, opts) {
	this._mounts = mounts;
	this.name = name;
	_.merge(this, opts || {});
}

Mount.parse = function(dest) {
	// Parse anything in the [user@]host:[dir] format
	var m = /^(?:(.+?)@)?(.+?)(?::(.+)?)?$/.exec(dest);
	if ( !m ) {
		// Should never really happen
		throw new Error("unexpected error, dest failed to match regexp");
	}

	var mount = {};

	mount.host = m[2];

	if ( m[1] ) {
		mount.user = m[1];
	}

	if ( m[3] ) {
		mount.dir = m[3];
	}

	return mount;
};

Object.defineProperty(Mount.prototype, 'dest', {
	get: function() {
		var str = this.host;

		if ( this.user ) {
			str = this.user + '@' + str;
		}

		if ( this.dir ) {
			str = str + ':' + this.dir;
		}

		return str;
	}
});

Object.defineProperty(Mount.prototype, 'point', {
	get: function() {
		return path.join('/tmp/ssmount', this.name);
	}
});

exports.DataStore = DataStore;
module.exports = new DataStore();
module.exports.DataStore = DataStore;
