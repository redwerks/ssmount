'use strict';

module.exports = function(grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		jshint: {
			options: {
				jshintrc: '.jshintrc'
			},
			gruntfile: {
				src: 'Gruntfile.js'
			},
			bin: {
				src: ['bin/*.js']
			},
			lib: {
				src: ['lib/**/*.js']
			},
		},

		markedman: {
			options: {
				version: '<%= pkg.version %>',
				name: '<%= pkg.nam %>',
				section: '1'
			},
			ssmount: {
				files: [
					{
						src: 'man/ssmount.md',
						dest: 'man/ssmount.1'
					}
				]
			},
		},

		watch: {
			gruntfile: {
				files: '<%= jshint.gruntfile.src %>',
				tasks: ['jshint:gruntfile']
			},
			bin: {
				files: '<%= jshint.bin.src %>',
				tasks: ['jshint:bin']
			},
			lib: {
				files: '<%= jshint.lib.src %>',
				tasks: ['jshint:lib']
			},
			man: {
				files: 'man/*.md',
				tasks: ['markedman']
			},
		}
	});

	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-markedman');
	grunt.loadNpmTasks('grunt-contrib-watch');

	grunt.registerTask('man', ['markedman']);

};
