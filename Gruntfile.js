/*jshint camelcase: false*/
// Generated on 2014-03-10 using generator-chromeapp 0.2.5
'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports = function (grunt) {
    // show elapsed time at the end
    require('time-grunt')(grunt);
    // load all grunt tasks
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        yeoman: {
            app: 'app',
            dist: 'dist'
        },
        watch: {
            options: {
                spawn: false
            },
            cc: {
                files: ['<%= yeoman.app %>/nacl_src/*.cc'],
                tasks: ['make'],
                options: {
                    livereload: true
                }
            },
            h: {
                files: ['<%= yeoman.app %>/nacl_src/*.h'],
                tasks: ['make'],
                options: {
                    livereload: true
                }
            },
            livereload: {
                options: {
                    livereload: '<%= connect.livereload.options.livereload %>'
                },
                files: [
                    '<%= yeoman.app %>/*.html',
                    '<%= yeoman.app %>/templates/*.html',
                    '<%= yeoman.app %>/styles/{,*/}*.css',
                    '<%= yeoman.app %>/scripts/{,*/}*.js',
                    '<%= yeoman.app %>/scripts/window/{,*/}*.js',
                    '<%= yeoman.app %>/scripts/window/controller/{,*/}*.js',
                    '<%= yeoman.app %>/scripts/window/services/{,*/}*.js',
                    '<%= yeoman.app %>/scripts/window/utils/{,*/}*.js',
                    '<%= yeoman.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
                    '<%= yeoman.app %>/manifest.json',
                    '<%= yeoman.app %>/_locales/{,*/}*.json'
                ]
            }
        },
        connect: {
            options: {
                port: 9000,
                // change this to '0.0.0.0' to access the server from outside
                hostname: 'localhost'
            },
            livereload: {
                options: {
                    livereload: 35729,
                    base: [
                        '<%= yeoman.app %>'
                    ]
                }
            },
            test: {
                options: {
                    base: [
                        'test',
                        '<%= yeoman.app %>'
                    ]
                }
            }
        },
        clean: {
            all: [
                "dist"
            ]
        },
        jshint: {
            options: {
                jshintrc: '.jshintrc',
                reporter: require('jshint-stylish')
            },
            all: [
                'Gruntfile.js',
                '<%= yeoman.app %>/scripts/*.js',
                '<%= yeoman.app %>/scripts/window/*.js',
                'test/spec/{,*/}*.js'
            ]
        },
        ngAnnotate: {
            all: {
                files: [
                    {
                        expand: true,
                        src: [
                            '<%= yeoman.app %>/scripts/window/{,*/}.js',
                            '<%= yeoman.app %>/scripts/window/controllers/{,*/}*.js',
                            '<%= yeoman.app %>/scripts/window/services/{,*/}*.js',
                            '<%= yeoman.app %>/scripts/window/utils/{,*/}*.js'
                        ],
                        dest: '<%= yeoman.dist %>'
                    }
                ]
            }
        },
        useminPrepare: {
            options: {
                dest: '<%= yeoman.dist %>'
            },
            html: [
                '<%= yeoman.app %>/window.html'
            ]
        },
        usemin: {
            options: {
                dest: '<%= yeoman.dist %>'
            },
            html: [
                '<%= yeoman.dist %>/window.html'
            ]
        },
        htmlmin: {
            dist: {
                options: {
                },
                files: [{
                    expand: true,
                    cwd: '<%= yeoman.app %>',
                    src: 'window.html',
                    dest: '<%= yeoman.dist %>'
                }]
            }
        },
        preprocess: {
            options: {
                inline: true,
                context: {
                    DEBUG: false
                }
            },
            html: {
                src: [
                    '<%= yeoman.dist %>/window.html'
                ]
            }
        },
        copy: {
            angular_csp_css: {
                files: [{
                    expand: false,
                    dest: '<%= yeoman.app %>/styles/angular-csp.css',
                    src: [
                        'bower_components/angular/angular-csp.css'
                    ]
                }]
            },
            dist: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: '<%= yeoman.app %>',
                    dest: '<%= yeoman.dist %>',
                    src: [
                        'images/{,*/}*.{webp,gif,png}',
                        '_locales/{,*/}*.json',
                        'styles/fonts/{,*/}*.*',
                        'styles/*.css',
                        'styles/*.map',
                        'scripts/background.js',
                        'scripts/lib/bootstrap.min.js',
                        'scripts/lib/ng-grid-2.0.7.min.js',
                        'scripts/lib/forge.min.js',
                        'scripts/lib/mysql_js_driver_*.min.js',
                        'scripts/lib/ace-builds/src-min-noconflict/{,*/}*.js',
                        'scripts/lib/jquery.jqplot.min.js',
                        'scripts/lib/jcanvas.min.js',
                        'fonts/{,*/}*.*',
                        '*.html',
                        'templates/*.html',
                        'newlib/Release/*.{nexe,nmf}'
                    ]
                }]
            }
        },
        concurrent: {
            dist: [
                'htmlmin'
            ]
        },
        chromeManifest: {
            dist: {
                options: {
                    buildnumber: false,
                    background: {
                        target: 'scripts/background.js',
                        exclude: [
                            'scripts/chromereload.js'
                        ]
                    }
                },
                src: '<%= yeoman.app %>',
                dest: '<%= yeoman.dist %>'
            }
        },
        compress: {
            dist: {
                options: {
                    archive: 'package/chrome_mysql_admin.zip'
                },
                files: [{
                    expand: true,
                    cwd: 'dist/',
                    src: ['**'],
                    dest: ''
                }]
            }
        },
        bower: {
            install: {
                options: {
                    targetDir: '<%= yeoman.app %>/scripts/lib',
                    verbose: true
                }
            }
        },
        shell: {
            make: {
                command: [
                    'cd app/nacl_src',
                    'make',
                    'cd ../..'
                ].join(';')
            }
        }
    });

    grunt.registerTask('debug', function (opt) {
        if (opt && opt === 'jshint') {
            var watch = grunt.config('watch');
            watch.livereload.tasks.push('jshint');
            grunt.config('watch', watch);
        }

        grunt.task.run([
            'jshint',
            'connect:livereload',
            'watch'
        ]);
    });

    grunt.registerTask('test', [
        'connect:test'
    ]);

    grunt.registerTask('build', [
        'clean',
        'bower:install',
        'make',
        'copy:angular_csp_css',
        'chromeManifest:dist',
        'ngAnnotate',
        'useminPrepare',
        'concurrent:dist',
        'concat',
        'uglify',
        'copy:dist',
        'usemin',
        'preprocess',
        'compress'
    ]);

    grunt.registerTask('default', [
        'jshint',
        'test',
        'build'
    ]);

    grunt.registerTask('make', [
        'shell:make'
    ]);
};
