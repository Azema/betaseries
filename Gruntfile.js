/* eslint-disable no-undef */
'use strict';

var path = require('path');
// var util = require('util');

/**
 * 
 * @param {IGrunt} grunt 
 */
module.exports = function(grunt) {
    // On définit les fins de ligne en mode linux
    grunt.util.linefeed = '\n';
    
    grunt.registerTask('build', [
        'clean', 'ts', 'cleanExports:dist', 'concat:dist', 'lineending:dist', 
        'copy:dist', 'sri:dist', 'version', 'deploy']
    );
    grunt.registerTask('deploy', ['gitadd:oauth', 'gitcommit:oauth', 'gitpush:oauth']);

    grunt.initConfig({
        distdir: path.resolve('./dist'),
        pkg: grunt.file.readJSON('package.json'),
        banner:
        '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n' +
        '<%= pkg.homepage ? " * " + pkg.homepage + "\\n" : "" %>' +
        ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;\n' +
        ' * Licensed <%= pkg.license %>\n */\n"use strict";\n\n',
        ts: {
            default : {
                tsconfig: './tsconfig.json'
            }
        },
        src: {
            tsc: [
                '<%= distdir %>/tsc/Cache.js',
                '<%= distdir %>/tsc/Character.js',
                '<%= distdir %>/tsc/Comment.js',
                '<%= distdir %>/tsc/Note.js',
                '<%= distdir %>/tsc/User.js',
                '<%= distdir %>/tsc/Base.js',
                '<%= distdir %>/tsc/Media.js',
                '<%= distdir %>/tsc/Show.js',
                '<%= distdir %>/tsc/Movie.js',
                '<%= distdir %>/tsc/Subtitle.js',
                '<%= distdir %>/tsc/Episode.js',
                '<%= distdir %>/tsc/Similar.js',
                '<%= distdir %>/tsc/UpdateAuto.js',
                '<%= distdir %>/tsc/Member.js',
                '<%= distdir %>/tsc/index.js'
            ],
            js: [
                '<%= distdir %>/js/Cache.js',
                '<%= distdir %>/js/Character.js',
                '<%= distdir %>/js/Comment.js',
                '<%= distdir %>/js/Note.js',
                '<%= distdir %>/js/User.js',
                '<%= distdir %>/js/Base.js',
                '<%= distdir %>/js/Media.js',
                '<%= distdir %>/js/Show.js',
                '<%= distdir %>/js/Movie.js',
                '<%= distdir %>/js/Subtitle.js',
                '<%= distdir %>/js/Episode.js',
                '<%= distdir %>/js/Similar.js',
                '<%= distdir %>/js/UpdateAuto.js',
                '<%= distdir %>/js/Member.js',
                '<%= distdir %>/js/index.js'
            ]
        },
        paths: {
            oauth: path.resolve('../../betaseries-oauth')
        },
        clean: ['<%= distdir %>/*'],
        lineending: {
            dist: {
                options: {
                    overwrite: true,
                    eol: 'lf'
                },
                files: {
                    '': ['<%= distdir %>/bundle.js']
                }
            }
        },
        concat: {
            dist: {
                options: {
                    banner: "<%= banner %>",
                    separator: '\n',
                    stripBanners: false
                },
                src:['<%= src.js %>'],
                dest:'<%= distdir %>/bundle.js'
            }
        },
        cleanExports: {
            dist: {
                src: ['<%= src.tsc %>'],
                dest: '<%= distdir %>/js'
            }
        },
        copy: {
            dist: {
                files: [{ src : '<%= distdir %>/bundle.js', dest: '<%= paths.oauth %>/js/app-bundle.js' }]
            }
        },
        sri: {
            dist: {
                src: '<%= distdir %>/bundle.js',
                dest: [
                    './betaseries.user.js', 
                    './local.betaseries.user.js'
                ]
            },
            test: {
                src: '<%= distdir %>/app-bundle.js',
                dest: './betaseries.user.js'
            }
        },
        version: {
            v: '<%= pkg.version %>'
        },
        gitadd: {
            oauth: {
                options: {
                    cwd: '<%= paths.oauth %>',
                    force: true
                },
                files: [
                    {
                        src: ['js/app-bundle.js'],
                        expand: true,
                        cwd: '<%= paths.oauth %>'
                    }
                ]
            }
        },
        gitcommit: {
            oauth: {
                options: {
                    cwd: '<%= paths.oauth %>',
                    message: 'Update bundle.js',
                    allowEmpty: true
                },
                files: [
                    {
                        src: ['js/app-bundle.js', 'README.md', 'sri.sha384'],
                        expand: true,
                        cwd: '<%= paths.oauth %>'
                    }
                ]
            }
        },
        gitpush: {
            oauth: {
                options: {
                    remote: 'origin',
                    cwd: '<%= paths.oauth %>',
                    all: true,
                    force: true
                }
            }
        }
    });
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks("grunt-ts");
    grunt.loadNpmTasks('grunt-lineending');
    grunt.loadNpmTasks('grunt-git');
    grunt.registerMultiTask('cleanExports', 'concatene all classes', function() {
        this.files.forEach(
            /**
             * @param {grunt.file.IFilesConfig} f 
             */
            function(f) {
                f.src.filter(function(filepath) {
                    // Warn on and remove invalid source files (if nonull was set).
                    if (!grunt.file.exists(filepath)) {
                      grunt.log.warn('Source file "' + filepath + '" not found.');
                      return false;
                    }
                    return true;
                }).map((filepath) => {
                    grunt.verbose.writeln('filepath: ' + filepath);
                    var content = grunt.file.read(filepath);
                    var lines = content.split('\n');
                    /**
                     * @type {Array<string>}
                     */
                    var linesToDest = [];
                    /**
                     * @type {Array<string>}
                     */
                    var modulesName = [];
                    /**
                     * @type {string}
                     */
                    var line;
                    for (let l = 0; l < lines.length; l++) {
                        line = lines[l];
                        // On supprime les lignes contenant les exports
                        if (/esModule/.test(line) || /^exports./.test(line) || /use strict/.test(line)) {
                            continue;
                        }
                        // On supprime les occurences 'exports.'
                        else if (/exports\./.test(line)) {
                            line = line.replace(/exports\./g, '');
                        }
                        // On récupère les noms des modules
                        else if (/require\(/.test(line)) {
                            let matches = /^const ([a-zA-Z_1]+) = require/.exec(line);
                            if (matches && matches.length > 1) {
                                modulesName.push(matches[1]);
                            }
                            continue;
                        }
                        linesToDest.push(line);
                    }
                    grunt.verbose.writeln(`lines origine(${lines.length}) dest(${linesToDest.length}), modules(${modulesName.length})`);
                    let regex;
                    // On supprime les occurences de modules
                    for (let m = 0; m < modulesName.length; m++) {
                        regex = new RegExp(modulesName[m] + '.', 'g');
                        for (let l = 0; l < linesToDest.length; l++) {
                            if (regex.test(linesToDest[l])) {
                                linesToDest[l] = linesToDest[l].replace(regex, '');
                            }
                        }
                    }
                    content = linesToDest.join('\n');
                    
                    if (!grunt.file.exists(path.resolve(f.dest))) {
                        grunt.verbose.writeln(`Création du répertoire ${f.dest}`);
                        grunt.file.mkdir(path.resolve(f.dest));
                    }
                    grunt.file.write(path.resolve(f.dest, path.basename(filepath)), content);
                });
            }
        );
    });
    grunt.registerMultiTask('sri', 'Copie le SRI du bundle dans le userscript', function() {
        if (!this.data.src || !this.data.dest) {
            grunt.log.error("Veuillez fournir les paramètres 'src' et 'dest' à la tâche");
            return false;
        }
        const crypto = require('crypto');
        const options = this.options({
            algorithm: 'sha384'
        });
        const calcHash = (url, algorithm) => {
            const fileContent = grunt.file.read(url);
      
            // openssl dgst -sha384 -binary file.js | openssl base64 -A
            return crypto.createHash(algorithm).update(fileContent).digest('base64');
        };
        const srcPath = path.resolve(this.data.src);
        grunt.verbose.writeln('file: ' + srcPath);
        // Warn on and remove invalid source files (if nonull was set).
        if (!grunt.file.exists(srcPath)) {
            grunt.log.warn('Source file "' + srcPath + '" not found.');
            return false;
        }
        const hash = calcHash(srcPath, options.algorithm);
        grunt.verbose.writeln('hash: ' + hash);
        const sri = `${options.algorithm}-${hash}`;
        const changeSri = function(filepath, sri) {
            grunt.verbose.writeln('Change SRI in ' + filepath);
            if (!grunt.file.exists(filepath)) {
                grunt.log.error(`Le fichier de destination (${filepath}) n'existe pas.`);
                return;
            }
            const content = grunt.file.read(filepath)
                          .replace(/const sriBundle = '[^']*';/, `const sriBundle = '${sri}';`);
            if (content.length <= 0) {
                grunt.log.error('Erreur durant le remplacement du hash dans le fichier ' + filepath);
                return;
            }
            grunt.file.write(filepath, content);
        }
        if (this.data.dest instanceof Array) {
            for (let d = 0; d < this.data.dest.length; d++) {
                changeSri(this.data.dest[d], sri);
            }
        } else {
            changeSri(this.data.dest, sri);
        }
    });
    grunt.registerMultiTask('version', 'Remplace le numéro de version du userscript par celle du package', function() {
        const version = this.data;
        if (!version || version.length <= 0) {
            grunt.log.error('Le paramètre "v" est requis');
            return false;
        }
        const filepaths = [
            path.resolve('./betaseries.user.js'),
            path.resolve('./local.betaseries.user.js')
        ];
        for (let p = 0; p < filepaths.length; p++) {
            grunt.verbose.writeln('Change SRI in ' + filepaths[p]);
            if (!grunt.file.exists(filepaths[p])) {
                grunt.log.error(`Le fichier de destination (${filepaths[p]}) n'existe pas.`);
                return;
            }
            let content = grunt.file.read(filepaths[p])
                        .replace(/@version(\s+)[0-9.]*/, `@version$1${version}`);
            grunt.file.write(filepaths[p], content);
        }
    });
};