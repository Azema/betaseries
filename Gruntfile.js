/* eslint-disable no-undef */
'use strict';
const fs = require('fs');
var path = require('path');
//const exit = require('process');
// var util = require('util');

const storageFile = './db/betaseries.json';

/**
 *
 * @param {IGrunt} grunt
 */
module.exports = function(grunt) {
    // On définit les fins de ligne en mode linux
    grunt.util.linefeed = '\n';

    grunt.registerTask('dev', [
        'clean', 'ts', 'cleanExports:dist', 'concat:dist', 'lineending:dist',
        'copy:dist', 'sri:dist', 'version']
    );
    grunt.registerTask('prod', [
        'clean', 'ts', 'cleanExports:dist', 'concat:dist', 'lineending:dist',
        'copy:dist', 'sri:dist', 'replace_sri:dist', 'version', 'deploy']
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
                '<%= distdir %>/tsc/Comments.js',
                '<%= distdir %>/tsc/Comment.js',
                '<%= distdir %>/tsc/Note.js',
                '<%= distdir %>/tsc/User.js',
                '<%= distdir %>/tsc/Base.js',
                '<%= distdir %>/tsc/Media.js',
                '<%= distdir %>/tsc/Show.js',
                '<%= distdir %>/tsc/Movie.js',
                '<%= distdir %>/tsc/Subtitle.js',
                '<%= distdir %>/tsc/Season.js',
                '<%= distdir %>/tsc/Episode.js',
                '<%= distdir %>/tsc/Similar.js',
                '<%= distdir %>/tsc/UpdateAuto.js',
                '<%= distdir %>/tsc/Member.js',
                '<%= distdir %>/tsc/Notification.js',
                '<%= distdir %>/tsc/Search.js',
                '<%= distdir %>/tsc/index.js'
            ],
            js: [
                '<%= distdir %>/js/Cache.js',
                '<%= distdir %>/js/Character.js',
                '<%= distdir %>/js/Comments.js',
                '<%= distdir %>/js/Comment.js',
                '<%= distdir %>/js/Note.js',
                '<%= distdir %>/js/User.js',
                '<%= distdir %>/js/Base.js',
                '<%= distdir %>/js/Media.js',
                '<%= distdir %>/js/Show.js',
                '<%= distdir %>/js/Movie.js',
                '<%= distdir %>/js/Subtitle.js',
                '<%= distdir %>/js/Season.js',
                '<%= distdir %>/js/Episode.js',
                '<%= distdir %>/js/Similar.js',
                '<%= distdir %>/js/UpdateAuto.js',
                '<%= distdir %>/js/Member.js',
                '<%= distdir %>/js/Notification.js',
                '<%= distdir %>/js/Search.js',
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
        replace_sri: {
            dist: {
                src: '<%= paths.oauth %>/sri.sha384',
                dest: ['./local.betaseries.user.js', './betaseries.user.js']
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
                        src: ['js/app-bundle.js', 'README.md', 'sri.sha384'],
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
        },
        connect: {
            server: {
                options: {
                    protocol: 'https',
                    key: grunt.file.read('./ssl/RootCA.key').toString(),
                    cert: grunt.file.read('./ssl/RootCA.crt').toString(),
                    ca: grunt.file.read('./ssl/RootCA.pem').toString(),
                    port: 9001,
                    hostname: 'localhost',
                    base: {
                        path: '<%= paths.oauth %>',
                        options: {
                            cacheControl: true,
                            dotfiles: 'deny',
                            etag: true,
                            lastModified: true,
                            maxAge: '1w',
                            index: false
                        }
                    },
                    debug: true,
                    keepalive: true,
                    /**
                     *
                     * @param {Server} _server
                     * @param {Connect} _connect
                     */
                    // eslint-disable-next-line no-unused-vars
                    onCreateServer: function(server, connect) {
                        connect.storageFile = false;
                    },
                    // remove next from params
                    middleware: function(connect, _options, middlewares) {
                        // inject a custom middleware into the array of default middlewares
                        // Middleware PROXY
                        middlewares.unshift(function(req, res, next) {
                            if (!/^\/proxy\//.test(req.url)) {
                                // console.log('URL is not proxy');
                                return next();
                            }
                            // console.log('Middleware proxy', req.url);
                            const { createProxyMiddleware, responseInterceptor } = require('http-proxy-middleware');
                            const options = {
                                target: 'https://thetvdb.com',
                                changeOrigin: true,
                                pathRewrite: {'^/proxy' : ''},
                                // logLevel: 'debug',
                                followRedirects: true,
                                secure: false,
                                selfHandleResponse: true, // res.end() will be called internally by responseInterceptor()
                                onProxyRes: responseInterceptor(async (_buffer, proxyRes, _req, res) => {
                                    // console.log('[DEBUG] response proxy', proxyRes.responseUrl);
                                    res.setHeader('content-type', 'application/json');
                                    return JSON.stringify({url: proxyRes.responseUrl});
                                }),
                                logger: console,
                            };
                            const apiProxy = createProxyMiddleware('/proxy', options);
                            apiProxy(req, res, next);
                        });
                        middlewares.unshift(function(req, res, next) {
                            if (!/^\/posters\//.test(req.url)) {
                                // console.log('URL is not proxy');
                                return next();
                            }
                            // console.log('Middleware proxy', req.url);
                            const { createProxyMiddleware } = require('http-proxy-middleware');
                            const options = {
                                target: 'https://thetvdb.com',
                                changeOrigin: true,
                                pathRewrite: {'^/posters' : ''},
                                followRedirects: true,
                                secure: false,
                                logger: console
                            };
                            const apiProxy = createProxyMiddleware('/posters', options);
                            apiProxy(req, res, next);
                        });
                        // Middleware CORS
                        middlewares.unshift(function(req, res, next) {
                            // console.log('allowingCrossDomain');
                            res.setHeader('Access-Control-Allow-Origin', '*');
                            res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
                            res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Accept, Origin, Referer, User-Agent, Content-Type, Authorization, X-Mindflash-SessionID');
                            res.setHeader('Access-Control-Allow-Private-Network', 'true');
                            // res.setHeader('Access-Control-Allow-Credentials', 'true');
                            // res.setHeader('pragma', 'public');
                            res.setHeader('vary', 'Accept-Encoding');
                            if (/(.js|.css)$/.test(req.url)) {
                                res.setHeader('Expires', new Date(Date.now() + 604800000).toUTCString());
                            } else if (/.json$/.test(req.url)) {
                                res.setHeader('Cache-Control', 'no-cache, private');
                            }

                            // intercept OPTIONS method
                            if ('OPTIONS' == req.method.toUpperCase()) {
                                res.statusCode = 204;
                                return res.end();
                            }
                            next();
                        });
                        /**
                         * Middleware pour le stockage des données partagées
                         */
                        middlewares.unshift(
                            /**
                             * @param {Request} req - La requête HTTP
                             * @param {Response} res - La réponse HTTP
                             * @param {function} next - Fonction de callback
                             */
                            async function(req, res, next) {
                                if (!/^\/db\/(get|save)\//.test(req.url)) {
                                    return next();
                                }
                                res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Accept, Origin, Referer, User-Agent, Content-Type');
                                res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
                                res.setHeader('Access-Control-Allow-Origin', 'https://www.betaseries.com');
                                res.setHeader('Access-Control-Max-Age', 0);
                                res.setHeader('Cache-Control', 'no-cache, private');
                                if (req.method.toUpperCase() === 'OPTIONS') {
                                    res.statusCode = 204;
                                    return res.end();
                                }
                                if (connect.storageFile) {
                                    return setTimeout(() => {this(req, res, next)}, 50);
                                }
                                const releaseFile = function() {
                                    connect.storageFile = false;
                                }
                                connect.storageFile = true;
                                res.setHeader('Content-Type', 'application/json');
                                try {
                                    fs.accessSync(storageFile, fs.constants.R_OK | fs.constants.W_OK);
                                } catch (error) {
                                    fs.writeFileSync(storageFile, JSON.stringify({
                                        objUpAuto: {},
                                        toSee: {},
                                        override: {}
                                    }));
                                }
                                // console.log('db tested ok');
                                /*
                                * RegExp Groups:
                                *  1: Type d'appel (GET or SAVE)
                                *  2: La clé d'identification dans la table
                                */
                                const reg = new RegExp(/^\/db\/(\w*)\/(\w*)\/*/);
                                const resultReq = reg.exec(req.url);
                                // console.log('resultReq', resultReq);
                                if (resultReq.length >= 3) {
                                    let dataFile = null;
                                    try {
                                        dataFile = JSON.parse(fs.readFileSync(storageFile));
                                    } catch (err) {
                                        return res.end(JSON.stringify({error: 'Error from get data: ' + err.toString()}));
                                    }
                                    const method = resultReq[1].toUpperCase();
                                    const key = resultReq[2];
                                    if (method === 'GET') {
                                        releaseFile();
                                        if (dataFile && dataFile[key]) {
                                            return res.end(JSON.stringify({error: null, data: dataFile[key]}));
                                        }
                                        return res.end(JSON.stringify({error: null, data: null}));
                                    } else if (method === 'SAVE' && req.method === 'POST') {
                                        const buffers = [];
                                        for await (const chunk of req) {
                                            buffers.push(chunk);
                                        }
                                        let data = Buffer.concat(buffers).toString();
                                        if (data.length <= 0) {
                                            releaseFile();
                                            return res.end(JSON.stringify({error: 'No data to save'}));
                                        }
                                        data = JSON.parse(data);
                                        dataFile[key] = data;
                                        try {
                                            fs.writeFileSync(storageFile, JSON.stringify(dataFile));
                                        } catch(err) {
                                            console.error('data are not saved', err);
                                            return res.end(JSON.stringify({error: 'Data are not saved: '+ err.toString(), save: false}));
                                        }
                                        releaseFile();
                                        return res.end(JSON.stringify({error:null, save: true}));
                                    } else {
                                        releaseFile();
                                        return res.end(JSON.stringify({error: `Method unknown: ${method} - req.method: ${req.method}`}));
                                    }
                                } else {
                                    releaseFile();
                                    return res.end(JSON.stringify({error: 'Error on middleware: check the url'}));
                                }
                            }
                        );
                        return middlewares;
                    }
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
    grunt.loadNpmTasks('grunt-contrib-connect');
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
    grunt.registerMultiTask('replace_sri', 'Remplace les SRI des fichiers static', function() {
        if (!this.data.src || !this.data.dest) {
            grunt.log.error("Veuillez fournir les paramètres 'src' et 'dest' à la tâche");
            return false;
        }
        if (!grunt.file.exists(this.data.src)) {
            grunt.log.error(`Le fichier de destination (${this.data.src}) n'existe pas.`);
            return;
        }
        const srcPath = path.resolve(this.data.src);
        const content = grunt.file.read(srcPath);
        const lines = content.split('\n');
        const reg = new RegExp(/^(\w+).min.*:\s(.*)$/);
        let results = new Array();
        for (let l = 0; l < lines.length; l++) {
            let matches = reg.exec(lines[l]);
            if (matches && matches.length > 2) {
                let filename = matches[1];
                let sri = matches[2];
                results.push({name: filename, sri});
            }
        }
        const changeSri = function(dest, results) {
            if (!grunt.file.exists(dest)) {
                grunt.log.error(`Le fichier de destination (${dest}) n'existe pas.`);
                return;
            }
            let content = grunt.file.read(dest);
            const lines = content.split('\n');
            const regIntegrity = new RegExp(/^(\s*)integrity:\s*'[^']*',/);
            for (let r = 0; r < results.length; r++) {
                let found = false,
                    foundSection = false,
                    name = results[r].name,
                    sri = results[r].sri,
                    regName = new RegExp(`"${name}`);
                for (let l = 0; l < lines.length; l++) {
                    if (!foundSection && !/scriptsAndStyles/.test(lines[l])) { continue; }
                    foundSection = true;
                    if (!found && regName.test(lines[l])) {
                        found = true;
                        grunt.verbose.writeln('Replace SRI name found: ' + name + ', line: ' + lines[l]);
                    } else if (found && regIntegrity.test(lines[l])) {
                        lines[l] = lines[l].replace(regIntegrity, `$1integrity: '${sri}',`);
                        grunt.verbose.writeln('Replace SRI: ' + name + ', line: ' + lines[l]);
                        break;
                    }
                }
            }
            content = lines.join('\n');
            if (content.length > 0)
                grunt.file.write(dest, content);
        }
        if (this.data.dest instanceof Array) {
            for (let d = 0; d < this.data.dest.length; d++) {
                changeSri(path.resolve(this.data.dest[d]), results);
            }
        } else {
            changeSri(path.resolve(this.data.dest), results);
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