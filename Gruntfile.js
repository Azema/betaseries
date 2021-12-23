/* eslint-disable no-undef */
'use strict';

var path = require('path');
// var util = require('util');

/**
 * 
 * @param {IGrunt} grunt 
 */
module.exports = function(grunt) {
    grunt.util.linefeed = '\n';
    grunt.registerTask('build', ['clean', 'ts', 'cleanExports:dist', 'concat:dist', 'lineending:dist', 'copy:dist', 'sri:dist', 'version']);
    grunt.initConfig({
        distdir: './dist',
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
                files: [{ dest: '../../betaseries-oauth/js/app-bundle.js', src : '<%= distdir %>/bundle.js' }]
            }
        },
        sri: {
            dist: {
                src: '<%= distdir %>/bundle.js',
                dest: './betaseries.user.js'
            },
            test: {
                src: '<%= distdir %>/app-bundle.js',
                dest: './betaseries.user.js'
            }
        },
        version: {
            v: '<%= pkg.version %>'
        }
    });
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks("grunt-ts");
    grunt.loadNpmTasks('grunt-lineending');
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
        if (!grunt.file.exists(this.data.dest)) {
            grunt.log.error(`Le fichier de destination (${this.data.dest}) n'existe pas.`);
            return;
        }
        const sri = `${options.algorithm}-${hash}`;
        const content = grunt.file.read(this.data.dest)
                      .replace(/const sriBundle = '[^']*';/, `const sriBundle = '${sri}';`);
        if (content.length <= 0) {
            grunt.log.error('Erreur durant le remplacement du hash dans le fichier ' + this.data.dest);
            return;
        }
        grunt.file.write(this.data.dest, content);
    });
    grunt.registerMultiTask('version', 'Remplace le numéro de version du userscript par celle du package', function() {
        const version = this.data;
        if (!version || version.length <= 0) {
            grunt.log.error('Le paramètre "v" est requis');
            return false;
        }
        const filepath = './betaseries.user.js';
        let content = grunt.file.read(filepath)
                    .replace(/@version(\s+)[0-9.]*/, `@version$1${version}`);
        grunt.file.write(filepath, content);
    });
};