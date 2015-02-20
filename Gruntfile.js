module.exports = function(grunt) {
  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    browserify: {
      prod: {
        options: {
          debug: false,
          transform: ['hbsfy'],
          aliasMappings: [
            {
              cwd: 'app/views',
              src: ['**/*'],
              dest: 'app/views',
              rename: function(cwd, src) {
                var ext = src.split('.').pop();
                return cwd + '/' + src + '.' + ext;
              }
            }
          ],
          alias: ['jquery-browserify:jquery']
        },
        files: {
          'public/scripts.js': 'app/entry.js',
        },
      },
      devel: {
        options: {
          debug: true,
          transform: ['hbsfy'],
          aliasMappings: [
            {
              cwd: 'app/views',
              src: ['**/*'],
              dest: 'app/views',
              rename: function(cwd, src) {
                var ext = src.split('.').pop();
                return cwd + '/' + src + '.' + ext;
              }
            }
          ],
          alias: ['jquery-browserify:jquery']
        },
        files: {
          'public/scripts.js': 'app/entry.js',
        },
      },
    },

    compass: {
      devel: {
        options: {
          'sassDir': 'assets/stylesheets',
          'cssDir': 'public',
          'require': ['compass-normalize', 'sass-globbing'],
          'importPath': ['bower_components/foundation/scss', 'bower_components/font-awesome/scss'],
          'bundleExec': true,
          'sourcemap': true,
          'environment': 'development'
        }
      },
      prod: {
        options: {
          'sassDir': 'assets/stylesheets',
          'cssDir': 'public',
          'require': ['compass-normalize', 'sass-globbing'],
          'importPath': ['bower_components/foundation/scss', 'bower_components/font-awesome/scss'],
          'bundleExec': true,
          'environment': 'production',
          'outputStyle': 'compressed'
        }
      }
    },

    nodemon: {
      main: {},
      debug: {
        options: {
          nodeArgs: ['--debug']
        }
      }
    },

    watch: {
      app: {
        files: 'app/**/*',
        tasks: ['browserify:devel'],
        options: {
          interrupt: true
        }
      },
      styles: {
        files: 'assets/stylesheets/**/*',
        tasks: ['compass:devel'],
        options: {
          interrupt: true
        }
      }
    },

    concurrent: {
      main: {
        tasks: ['nodemon'],
        options: {
          logConcurrentOutput: true
        }
      },

      debug: {
        tasks: ['nodemon:debug', 'watch', 'node-inspector'],
        options: {
          logConcurrentOutput: true
        }
      }
    },

    'node-inspector': {
      main: {}
    }
  });

  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-compass');
  grunt.loadNpmTasks('grunt-nodemon');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-concurrent');
  grunt.loadNpmTasks('grunt-node-inspector');

  grunt.registerTask('compile', ['browserify:prod', 'compass:prod']);
  grunt.registerTask('compile:devel', ['browserify:devel', 'compass:devel']);
  grunt.registerTask('default', ['compile']);
  grunt.registerTask('server', ['compile', 'concurrent']);
  grunt.registerTask('server:debug', ['compile:devel', 'concurrent:debug']);

};
