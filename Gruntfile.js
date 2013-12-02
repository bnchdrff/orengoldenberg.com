module.exports = function(grunt) {
  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    curl: {
      'assets/videos.json': 'http://vimeo.com/api/v2/user5904516/videos.json'
    },

    browserify: {
      main: {
        options: {
          debug: true,
          transform: ['uglifyify', 'hbsfy'],
          aliasMappings: [
            {
              cwd: 'app/views',
              src: ['**/*'],
              dest: 'app/views',
              rename: function(cwd, src) {
                // Little hack to ensure that file extension is preserved.
                // This allows us to have '.hbs' and '.js' files in same
                // directory with same basename.
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
      main: {
        options: {
          'sassDir': 'assets/stylesheets',
          'cssDir': 'public',
          'require': ['compass-normalize', 'sass-globbing'],
          'bundleExec': true
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
        tasks: ['browserify'],
        options: {
          interrupt: true
        }
      },
      styles: {
        files: 'assets/stylesheets/**/*',
        tasks: ['stylus'],
        options: {
          interrupt: true
        }
      }
    },

    concurrent: {
      main: {
        tasks: ['nodemon', 'watch'],
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
  grunt.loadNpmTasks('grunt-curl');
  grunt.loadNpmTasks('grunt-nodemon');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-concurrent');
  grunt.loadNpmTasks('grunt-node-inspector');

  grunt.registerTask('compile', ['curl', 'browserify', 'compass']);
  grunt.registerTask('default', ['compile']);
  grunt.registerTask('server', ['compile', 'concurrent']);
  grunt.registerTask('server:debug', ['compile', 'concurrent:debug']);

};
