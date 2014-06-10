#!/usr/bin/env node
"use strict";

var ssmount = require('../lib/ssmount');

try {
	ssmount.parse(process.argv);
} catch ( e ) {
	if ( e.exit ) {
		process.exit(1);
	} else {
		throw e;
	}
}

if ( process.argv.length <= 2 ) {
	ssmount.help();
}
