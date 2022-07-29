/* eslint-disable no-undef */
'use strict';
const fs = require('fs');
// eslint-disable-next-line no-unused-vars
const { IncomingMessage, OutgoingMessage, Server } = require('http');
var path = require('path');
//const exit = require('process');
// var util = require('util');

const storageFile = './db/betaseries-#userId#.json';

/**
 *
 * @param {IGrunt} grunt
 */
module.exports = function(grunt) {
    // On définit les fins de ligne en mode linux
    grunt.util.linefeed = '\n';

    grunt.registerTask('dev', [
        'clean', 'ts', 'upVersion', 'cleanExports:dist', 'concat:dist', 'lineending:dist',
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
                '<%= distdir %>/tsc/Debug.js',
                '<%= distdir %>/tsc/Base.js',
                '<%= distdir %>/tsc/RenderHtml.js',
                '<%= distdir %>/tsc/Character.js',
                '<%= distdir %>/tsc/Comments.js',
                '<%= distdir %>/tsc/Comment.js',
                '<%= distdir %>/tsc/Note.js',
                '<%= distdir %>/tsc/User.js',
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
                '<%= distdir %>/tsc/Decorators.js',
                '<%= distdir %>/tsc/index.js'
            ],
            js: [
                '<%= distdir %>/js/Cache.js',
                '<%= distdir %>/js/Debug.js',
                '<%= distdir %>/js/Base.js',
                '<%= distdir %>/js/RenderHtml.js',
                '<%= distdir %>/js/Character.js',
                '<%= distdir %>/js/Comments.js',
                '<%= distdir %>/js/Comment.js',
                '<%= distdir %>/js/Note.js',
                '<%= distdir %>/js/User.js',
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
                '<%= distdir %>/js/Decorators.js',
                '<%= distdir %>/js/index.js'
            ]
        },
        paths: {
            oauth: path.resolve('../../betaseries-oauth'),
            doc: path.resolve('./doc'),
            pageTest: path.resolve('./PagesWebTest')
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
        jsdoc: {
            dist: {
                src: ['<%= src.js %>'],
                options: {
                    destination: '<%= paths.doc %>'
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
        upVersion: {
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
                    key: grunt.file.read('./ssl/localhost.key').toString(),
                    cert: grunt.file.read('./ssl/localhost.crt').toString(),
                    ca: grunt.file.read('./ssl/myCA.pem').toString(),
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
                     * onCreateServer
                     * @param {Server} server
                     * @param {Connect} connect
                     */
                    onCreateServer: function(server, connect) {
                        connect.storageFile = {};
                        /* const { Server } = require('socket.io');
                        const io = new Server(server, {
                            cors: {origin: 'https://www.betaseries.com'}
                        });
                        const Redis = require("ioredis");
                        const { checkNotifs, getRedisUrl } = require('./websockets/socket');
                        // TODO: pensez au fichier de config dans le répertoire websockets
                        const redisUrl = getRedisUrl();
                        /** @type {Redis} */
                        /* const redisClient = new Redis(redisUrl);
                        const { RedisSessionStore } = require("./websockets/sessionStore");
                        const sessionStore = new RedisSessionStore(redisClient);
                        const { randomBytes } = require("crypto");
                        const randomId = () => randomBytes(8).toString("hex");
                        const cleanToken = (token) => String(token).replace(/[^a-fA-F0-9]+/g, '').trim();
                        function Emitter(userId) {
                            this.userId = userId;
                            this.callbacks = {};
                            this.status = 0; // 0: not init, 1: init, 2: launch, 3: stopped
                            return this;
                        }
                        Emitter.prototype = {
                            init: function(socket) {
                                console.log('Emitter.init', this);
                                this.on('error', (err, nbRetry = 0) => {
                                    // Gérer les erreurs
                                    console.log('Emitter.on(error) nb retry: %d', nbRetry, err);
                                })
                                .on('goodbye', () => {
                                    this.status = 3;
                                    console.log('Emitter.on(goodbye) disconnect');
                                    socket.to(socket.userId.toString()).emit('goodbye');
                                    socket.disconnect(true);
                                })
                                .on('news', (data) => {
                                    console.log('Emitter.on(news): %d notifications found', data.notifications.length, {lastNotifId: data.lastNotifId, token: socket.token});
                                    socket.to(socket.userId.toString()).emit('notifications', {notifications: data.notifications, lastNotifId: data.lastNotifId});
                                    // console.log('Nouvelles notifications: last ID(%d)', data.lastNotifId);
                                    sessionStore.saveSession(socket.sessionID, {
                                        userId: socket.userId,
                                        lastNotifId: data.lastNotifId,
                                        token: socket.token,
                                        connected: true
                                    });
                                })
                                .on('token', async (token) => {
                                    const matchingSockets = await io.in(socket.userId.toString()).allSockets();
                                    console.log('Emitter.on(token) - nbSockets: %d', matchingSockets.size);
                                    io.in(socket.userId.toString()).emit('token', {token});
                                    sessionStore.saveSession(socket.sessionID, {
                                        userId: socket.userId,
                                        lastNotifId: socket.lastNotifId,
                                        token: token,
                                        connected: true
                                    });
                                })
                                .status = 1;
                                return this;
                            },
                            on: function(event, fn) {
                                this.callbacks = this.callbacks || {};
                                if (!this.callbacks[event]) {
                                    this.callbacks[event] = [];
                                }
                                this.callbacks[event].push(fn);
                                return this;
                            },
                            emit: function(event, ...args) {
                                if (this.callbacks[event]) {
                                    for (let c = 0, _len = this.callbacks[event].length; c < _len; c++) {
                                        this.callbacks[event][c].apply(this, args);
                                    }
                                }
                                return this;
                            }
                        }; */
                        /** @type {Object.<string, Emitter>} */
                        /* const emitters = {};
                        // Middleware authentification
                        io.use(async (socket, next) => {
                            // console.log('wbesocket middleware', socket.handshake.auth);
                            const sessionID = socket.handshake.auth.sessionID;
                            if (sessionID) {
                                // console.log('SessionID found', sessionID);
                                // find existing session
                                const session = await sessionStore.findSession(sessionID);
                                if (session) {
                                    // console.log('session found', session);
                                    socket.sessionID = sessionID;
                                    socket.userId = session.userId;
                                    socket.lastNotifId = session.lastNotifId;
                                    socket.token = session.token;
                                    socket.nbRetry = 0;
                                    if (socket.handshake.auth.lastNotifId) {
                                        socket.lastNotifId = parseInt(socket.handshake.auth.lastNotifId);
                                    }
                                    if (socket.handshake.auth.token) {
                                        socket.token = cleanToken(socket.handshake.auth.token);
                                    }
                                    if (!Reflect.has(emitters, socket.userId)) {
                                        emitters[socket.userId] = new Emitter(socket.userId).init(socket);
                                    }
                                    // console.log('wbesocket session found', {lastNotifId: socket.lastNotifId, token: socket.token, userId: socket.userId, sessionID: socket.sessionID});
                                    return next();
                                }
                            }
                            // 1. Récupérer l'identifiant du membre
                            const userId = socket.handshake.auth.userId;
                            const token = socket.handshake.auth.token;
                            if (!userId || typeof userId !== 'number' || userId <= 0) {
                                console.error('Error, userId not found or invalid', userId);
                                return next(new Error("invalid userId"));
                            }
                            socket.sessionID = randomId();
                            socket.userId = userId;
                            socket.lastNotifId = 0;
                            socket.token = '';
                            if (token) {
                                socket.token = token;
                            }
                            socket.nbRetry = 0;
                            sessionStore.saveSession(socket.sessionID, {
                                userId: socket.userId,
                                lastNotifId: socket.lastNotifId,
                                token: socket.token,
                                connected: true
                            });
                            if (!Reflect.has(emitters, userId)) {
                                emitters[userId] = new Emitter(userId).init(socket);
                            }
                            // console.log('a new session with user connected with userId: %d', userId, socket.sessionID);
                            next();
                        });
                        io.on('connection', (socket) => {
                            // console.log('wbesocket event.connection', {token: socket.token});
                            sessionStore.saveSession(socket.sessionID, {
                                userId: socket.userId,
                                lastNotifId: socket.lastNotifId,
                                token: socket.token,
                                connected: true,
                            });
                            // 1. Récupérer l'identifiant du membre
                            socket.emit("session", {
                                sessionID: socket.sessionID,
                                userId: socket.userId,
                                lastNotifId: socket.lastNotifId
                            });
                            socket.join(socket.userId.toString());
                            // 2. Récupérer les notifs sur l'API BS

                            socket.emitter = emitters[socket.userId];
                            console.log('Socket.on(connection) - emitter:', socket.emitter);
                            if (socket.emitter.status === 1) {
                                socket.emitter.status = 2;
                                checkNotifs(socket, sessionStore);
                            } */
                            /* if (socket.token && socket.token.length > 0) {
                            } else {
                                authApi(socket, (err) => {
                                    if (err) {
                                        console.error('websocket authApi error, disconnect', err);
                                        socket.disconnect(true);
                                        return false;
                                    }
                                    checkNotifs(socket, sessionStore);
                                });
                            } */
                            // 3. Si nouvelles notifs, envoyer les notifs au client

                            /* socket.on('disconnect', async () => {
                                const matchingSockets = await io.in(socket.userId.toString()).allSockets();
                                const isDisconnected = matchingSockets.size === 0;
                                console.log('wbesocket event.disconnect - nbSockets: %d', matchingSockets.size);
                                sessionStore.saveSession(socket.sessionID, {
                                    userId: socket.userId,
                                    lastNotifId: socket.lastNotifId,
                                    token: socket.token,
                                    connected: false
                                });
                                if (isDisconnected) {
                                    emitters[socket.userId].status = 3;
                                    delete emitters[socket.userId];
                                    if (socket.timer) {
                                        console.log('websocket disconnect clearTimeout');
                                        clearTimeout(socket.timer);
                                    }
                                }
                            });
                        }); */
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
                             * @param {IncomingMessage} req - La requête HTTP
                             * @param {OutgoingMessage} res - La réponse HTTP
                             * @param {function} next - Fonction de callback
                             */
                            async function(req, res, next) {
                                if (!/^\/db\/(get|save)\//.test(req.url)) {
                                    return next();
                                }
                                res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Accept, Origin, Referer, User-Agent, Content-Type, x-betaseries-user');
                                res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
                                res.setHeader('Access-Control-Allow-Origin', 'https://www.betaseries.com');
                                res.setHeader('Access-Control-Max-Age', 0);
                                res.setHeader('Cache-Control', 'no-cache, private');
                                res.setHeader('Access-Control-Allow-Credentials', 'true');
                                if (req.method.toUpperCase() === 'OPTIONS') {
                                    res.statusCode = 204;
                                    return res.end();
                                }

                                // Identifier l'utilisateur
                                if (req.headers['x-betaseries-user'] === undefined ||
                                    req.headers['x-betaseries-user'].length <= 0)
                                {
                                    res.statusCode = 401;
                                    return res.end();
                                }
                                const userId = req.headers['x-betaseries-user'];

                                // Récupération du fichier de stockage des données partagées
                                const filename = storageFile.replace('#userId#', userId);
                                if (connect.storageFile[userId]) {
                                    return setTimeout(() => {this(req, res, next)}, 50);
                                }
                                const releaseFile = function() {
                                    if (connect.storageFile[userId]) connect.storageFile[userId] = false;
                                }
                                connect.storageFile[userId] = true;
                                res.setHeader('Content-Type', 'application/json');
                                try {
                                    fs.accessSync(filename, fs.constants.R_OK | fs.constants.W_OK);
                                } catch (error) {
                                    const dataFile = './db/data.json';
                                    fs.copyFileSync(path.resolve(dataFile), filename);
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
                                        dataFile = JSON.parse(fs.readFileSync(filename));
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
                                            fs.writeFileSync(filename, JSON.stringify(dataFile));
                                        } catch(err) {
                                            console.error('data are not saved', err);
                                            releaseFile();
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
            },
            test: {
                options: {
                    protocol: 'https',
                    key: grunt.file.read('./ssl/localhost.key').toString(),
                    cert: grunt.file.read('./ssl/localhost.crt').toString(),
                    ca: grunt.file.read('./ssl/myCA.pem').toString(),
                    hostname: 'localhost',
                    port: 9002,
                    base: {
                        path: '<%= paths.pageTest %>',
                        options: {
                            dotfiles: 'allow',
                            index: 'index.html'
                        }
                    },
                    debug: true,
                    keepalive: true,
                    middleware: function(connect, options, middlewares) {
                        // inject a custom middleware into the array of default middlewares
                        middlewares.unshift(function(req, res, next) {
                            if (req.url.startsWith('/ajax')) {
                                res.statusCode = 404;
                                return res.end();
                            }
                            else if (req.url === '/serie/zoey-extraordinary-playlist') {
                                res.setHeader('Content-Type', 'text/html');
                                return res.end(fs.readFileSync(path.resolve('./PagesWebTest/Zoey-Extraordinary-Playlist.html')));
                            } else if (req.url.startsWith('/serie/Zoey-Extraordinary-Playlist_files/')) {
                                const pathFile = req.url.replace('/serie', path.resolve('./PagesWebTest')).replace(/\?.*$/, '');
                                try {
                                    if (fs.statSync(pathFile, {throwIfNoEntry: false})) {
                                        return res.end(fs.readFileSync(pathFile));
                                    }
                                } catch(err) {
                                    console.error('Error Stat file: ', err);
                                }
                            }
                            next();
                        });

                        return middlewares;
                    },
                }
            }
        }
    });
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks("grunt-ts");
    grunt.loadNpmTasks('grunt-lineending');
    grunt.loadNpmTasks('grunt-jsdoc');
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
        const pkg = grunt.file.readJSON('package.json');
        const version = pkg.version;
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
    grunt.registerMultiTask('upVersion', 'Incrémente et remplace le numéro de version du manifest par celui du package', function() {
        const version = this.data;
        if (!version || version.length <= 0) {
            grunt.log.error('Le paramètre "v" est requis');
            return false;
        }
        function incrementVersion(numero) {
            let minor = parseInt(numero.split('.').pop(), 10);
            return numero.replace(/\d+$/, ++minor);
        }
        const filepaths = [
            path.resolve('./package.json')
        ];
        const numero = incrementVersion(version);
        for (let p = 0; p < filepaths.length; p++) {
            grunt.verbose.writeln('Change Version in ' + filepaths[p]);
            if (!grunt.file.exists(filepaths[p])) {
                grunt.log.error(`Le fichier de destination (${filepaths[p]}) n'existe pas.`);
                continue;
            }
            let content = grunt.file.read(filepaths[p])
                        .replace(/"version":(\s*)"[0-9.]*"/, `"version":$1"${numero}"`);
            grunt.file.write(filepaths[p], content);
        }
    });
};