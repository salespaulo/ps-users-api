"use strict";

var path = require('path');

module.exports = function (grunt) {

    var paths = {
        app: __dirname  + '/src/app',
        test: __dirname  + '/src/test',
        dist: __dirname + '/public',
        config: __dirname + '/config',
    };

    var clean = {
        src: '<%= paths.dist %>',
    };

    var ts = {
        options: {
            module: 'commonjs',
            target: 'ES6',
            rootDir: '<%= paths.app %>',
            inlineSourceMap: true
        },
        default: {
            src: ['<%= paths.app %>/**/*.ts', '!node_modules/**/*'],
            outDir: '<%= paths.dist %>/',
        },
        faster: {
            src: ['<%= paths.app %>/**/*.ts', '!node_modules/**/*'],
            outDir: '<%= paths.dist %>/',
            options: {
                fast: 'faster'
            }
        }
    };

    var copy = {
        json: {
            expand: true,
            cwd: path.join(path.resolve(), '/config', '/'),
            src: '**/*.json',
            dest: path.join(path.resolve(), '/public', '/config', '/'),
        },
    };

    var watch = {
        ts: {
            files: [ '<%= paths.app %>/**/*.ts' ],
            tasks: ['shell:stop', 'copy', 'ts:faster', 'mochaTest', 'concurrent']
        }
    }

    var nodemon = {
        default: {
            script: '<%= paths.dist %>/app.js',
            options: {
                cwd: __dirname,
                watch: ['<%= paths.dist %>'],
                ignore: ['node_modules'],
            }
        }
    };

    var mocha = {
      test: {
        options: {
          reporter: 'spec',
          captureFile: 'results.txt', // Optionally capture the reporter output to a file
          quiet: false, // Optionally suppress output to standard out (defaults to false)
          clearRequireCache: false, // Optionally clear the require cache before running tests (defaults to false)
          noFail: false // Optionally set to not fail on failed tests (will still fail on other errors)
        },
        src: ['./public/_test/**/*.js']
      }
    };

    var concurrent = {
        default: {
            tasks: ['shell:node', 'watch'],
            options: {
                logConcurrentOutput: true
            }
        }
    };

    var shell = {
        options: {
            stderr: true
        },
        node: {
            command: 'node public/app.js'
        },
        stop: {
            command: 'curl http://<%=process.env.NODE_ENV%>:<%=process.env.PORT%>/stop'
        },
        docker: {
            command: 'docker build -t ps-users-docker-api .'
        },
        dockercompose: {
            command: 'docker-compose up -d'
        },
    };

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        paths: paths,
        shell: shell, 
        copy: copy,
        mochaTest: mocha,
        ts: ts,
        clean: clean,
        watch: watch,
        nodemon: nodemon,
        concurrent: concurrent,
    });

    require('load-grunt-tasks')(grunt);

    grunt.registerTask('compile', ['clean', 'copy', 'ts:default']);
    grunt.registerTask('test', ['compile', 'mochaTest']);
    grunt.registerTask('dev', ['test', 'concurrent']);
    grunt.registerTask('default', ['compile', 'node:shell']);

    grunt.registerTask('docker', ['compile', 'shell:docker', 'shell:dockercompose']);
};
