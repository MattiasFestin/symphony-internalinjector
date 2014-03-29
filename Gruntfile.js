module.exports = function(grunt) {
	'use strict';

	var reportDir = 'report/';
	var tasks = 'test/specs/**/*_test.js';
	//var tests = 'test/specs/**/*.js';
	var coverage = 'test/coverage/*';
	var src = 'src/**/*.js';

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
			'<%= grunt.template.today("yyyy-mm-dd") %>\n' +
			'<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
			'* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
			' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',

		clean: [coverage],

		simplemocha: {
			options: {
				globals: ['should'],
				timeout: 3000,
				ignoreLeaks: false,
				ui: 'bdd',
				reporter: 'spec'
			},

			all: { src: [tasks] }
		},

		copy: {
		    dev: {
		        expand: true,
		        src: 'src/**/*.js',
		        dest: 'test/coverage/',
		    }
		},

		jshint: {
			files: ['gruntfile.js', src, tasks],
			options: {
				jshintrc: '.jshintrc'
			}
		},

		watch: {
			files: ['<%= jshint.files %>'],
			tasks: ['cover']
		},

		instrument : {
			files : src,
			options : {
				lazy : true,
				basePath : 'test/coverage'
			}
		},

		reloadTasks : {
			rootPath : 'test/coverage'
		},

		storeCoverage : {
			options : {
				dir : 'test/' + reportDir
			}
		},

		makeReport : {
			src : 'test/report/*.json',
			options : {
				type : 'lcov',
				dir : 'test/' + reportDir,
				print : 'detail'
			}
		},
		coverage: {
			options: {
				thresholds: {
					'statements': 100,
					'branches': 100,
					'lines': 100,
					'functions': 100
				},
				dir: reportDir,
				root: 'test'
			}
		},
		complexity: {
            generic: {
                src: ['src/**/*.js'],
                options: {
                    breakOnErrors: true,
                    jsLintXML: 'test/complexity/report.xml',			// create XML JSLint-like report
                    checkstyleXML: 'test/complexity/checkstyle.xml',	// create checkstyle report
                    errorsOnly: false,									// show only maintainability errors
                    cyclomatic: 4,										// or optionally a single value, like 3
                    halstead: 16,										// or optionally a single value, like 8
                    maintainability: 100
                }
            }
        }
	});

	grunt.loadNpmTasks('grunt-istanbul');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-simple-mocha');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-istanbul-coverage');
	grunt.loadNpmTasks('grunt-complexity');

	grunt.registerTask('test', ['jshint', 'cover']);
	grunt.registerTask('cover', [ 'clean', 'instrument', 'reloadTasks', 'simplemocha', 'storeCoverage', 'makeReport', 'coverage', 'complexity']);

	grunt.registerTask('default', ['test']);
};