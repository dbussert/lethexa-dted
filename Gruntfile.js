/* global module */

module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        yuidoc: {
            all: {
                name: '<%= pkg.name %>',
                description: '<%= pkg.description %>',
                version: '<%= pkg.version %>',
	        url: '<%= pkg.homepage %>',
                options: {
		    exclude: '',
                    paths: ['./', 'lib/'],
                    outdir: 'doc/'
                }
            }
        },

        mochacli: {
          options: {
            reporter: "spec",
            ui: "tdd"
          },
          all: ["test/tests.js"]
        }
    });

    grunt.loadNpmTasks("grunt-mocha-cli");
    grunt.loadNpmTasks('grunt-contrib-yuidoc');

    grunt.registerTask('test', ['mochacli']);
    grunt.registerTask('default', ['mochacli', 'yuidoc']);
    grunt.registerTask('jenkins', ['mochacli', 'yuidoc']);
};
