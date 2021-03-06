/* eslint-disable no-unused-vars */
'use strict';

const { Socket } = require('socket.io');
const { RedisSessionStore } = require('./sessionStore');
const config = require('./conf.json');

const axios = require('axios').default;
const betaseries_api_user_key = config.apiUserKey;
const timeoutCheckNotifs = config.timeoutCheckNotifs || 300000; // 5 minutes
/**
 * Les couleurs pour les logs de la console
 * @type {Object<string, string>}
 */
const colors = {
    black: '\x1b[30m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    initial: '\x1b[0m'
};
/**
 * Retourne la date de maintenant sous forme de chaine (dd/mm/yyyy HH:MM:SS)
 * @returns {string}
 */
const dateFormatted = () => {
    const now = new Date();
    return `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth()+1).toString().padStart(2, '0')}/${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
}
/**
 * Création d'une instance axios pour l'API BetaSeries
 */
const axiosAPI = axios.create({
    baseURL: 'https://api.betaseries.com',
    timeout: 10000
});

// Ajout des en-têtes spécifiques à l'API BetaSeries
axiosAPI.defaults.headers.common['Accept'] = 'application/json';
axiosAPI.defaults.headers.common['X-BetaSeries-Version'] = '3.0';
axiosAPI.defaults.headers.common['X-BetaSeries-Key'] = betaseries_api_user_key;

/**
 * Retourne la chaine de connexion au serveur Redis
 * en utilisant les infos dans le fichier de config
 * @returns {string}
 */
function getRedisUrl() {
    if (!config || !config.redis) return; // config by default
    let redisUrl = 'redis://';
    if (config.redis.username && config.redis.password) {
        redisUrl += `${config.redis.username}:${config.redis.password}@`;
    } else if (config.redis.password) {
        redisUrl += `:${config.redis.password}@`;
    }
    const db = config.redis.db || '0';
    redisUrl += `${config.redis.host}:${config.redis.port}/${db}`;
    return redisUrl;
}

/**
 * Vérifie que le token est toujours actif sur l'API BetaSeries
 * @param {Socket} socket - La socket
 * @param {function} cb - Callback
 */
function checkToken(socket, cb) {
    console.log('[%s] %scheckToken\x1b[0m: token: %s', dateFormatted(), colors.yellow, socket.token);
    if (!socket.emitter || socket.emitter?.status !== 2) {
        return cb('Emitter status: ' + socket.emitter.status.toString());
    }
    axiosAPI.get('/members/is_active')
        .then(res => {
            if (res.status == 400) {
                authApi((err, newToken) => {
                    if (err) {
                        console.error('Error from authApi: ', err);
                        return cb(err);
                    }
                    socket.token = newToken;
                    socket.emitter.emit('token', newToken);
                    return cb();
                });
            } else {
                return cb();
            }
        }).catch(err => {
            console.error('checkToken error request:', err.message);
            if (err.message == 'Request failed with status code 400') {
                // console.log('checkToken1 cb', typeof cb);
                try {
                    authApi(socket, (err, newToken) => {
                        if (err) {
                            // console.log('checkToken2 cb', typeof cb);
                            console.error('Error from authApi: ', err);
                            return cb(err);
                        }
                        socket.token = newToken;
                        socket.emitter.emit('token', newToken);
                        console.log('checkToken3 cb', typeof cb);
                        return cb();
                    });
                } catch(err) {
                    console.error('Error authApi in checkToken', err);
                }
            } else {
                // console.log('checkToken4 cb', typeof cb);
                return cb(err);
            }
        });
}

/**
 * Vérifie les notifications
 * @param {Socket} socket - La socket
 * @param {RedisSessionStore} sessionStore - La stockage de session
 */
const checkNotifs = function(socket, sessionStore) {
    console.log('[%s] %scheckNotifs\x1b[0m: token: %s', dateFormatted(), colors.cyan, socket.token);
    axiosAPI.defaults.headers.common['X-BetaSeries-Token'] = socket.token || '';
    const relaunch = (err) => {
        if (err) {
            socket.nbRetry++;
            socket.emitter.emit('error', err, socket.nbRetry);
            console.error('relaunch checkNotifs error, nbRetry: %d - err: %s', socket.nbRetry, err);
            if (socket.nbRetry < 5) {
                console.log('relaunch checkNotifs in %d seconds', timeoutCheckNotifs/1000);
                socket.timer = setTimeout(checkNotifs, timeoutCheckNotifs, socket, sessionStore);
            } else if (socket.timer) {
                console.warn('checkNotifs no relaunch checkNotifs, clear timer');
                socket.emitter.emit('goodbye');
            }
        } else {
            console.log('relaunch checkNotifs in %d seconds', timeoutCheckNotifs/1000);
            socket.timer = setTimeout(checkNotifs, timeoutCheckNotifs, socket, sessionStore);
        }
    }
    // On check d'abord le token
    checkToken(socket, (err) => {
        if (err) {
            relaunch(err);
            return null;
        }
        const nbNotifs = config.nbNotifs || 20;
        axiosAPI.get('/members/notifications?all=true&sort=DESC&number=' + nbNotifs.toString())
            .then(res => {
                const contentType = res.headers['content-type'];
                let error;
                if (res.status !== 200) {
                    error = new Error('Request Failed.\n' + `Status Code: ${res.status}`);
                } else if (!/^application\/json/.test(contentType)) {
                    error = new Error('Invalid content-type.\n' +
                    `Expected application/json but received ${contentType}`);
                }
                if (error) {
                    // console.log(error.message);
                    // Consume response data to free up memory
                    relaunch(error.message);
                    return;
                }
                socket.nbRetry = 0;
                try {
                    // const data = JSON.parse(res.data);
                    const data = res.data;
                    if (data.notifications && data.notifications.length > 0 &&
                        data.notifications[0].id !== socket.lastNotifId)
                    {
                        const notifs = [];
                        for (let n = 0, _len = data.notifications.length; n < _len; n++) {
                            if (data.notifications[n].id === socket.lastNotifId) {
                                break;
                            }
                            notifs.push(data.notifications[n]);
                        }
                        socket.lastNotifId = data.notifications[0].id;
                        // socket.to(socket.userId.toString()).emit('notifications', {notifications: notifs, lastNotifId: socket.lastNotifId});
                        // Nouvelles notifications
                        socket.emitter.emit('news', {notifications: notifs, lastNotifId: socket.lastNotifId});
                        // console.log('news notifications(%d) found', notifs.length, {lastNotifId: socket.lastNotifId, token: socket.token});
                    }
                } catch (err) {
                    console.error('Error parse json data', err);
                }
                relaunch();
            }).catch(e => {
                // console.log(`problem with request: ${e.message}`);
                console.error('checkNotifs catch request, nbRetry: %d', e);
                relaunch(e);
            });
    });
};

/**
 * Realise une requête d'authentification sur l'API BetaSeries
 * @param {Socket} socket - La socket
 * @param {function} cb - Callback
 */
const authApi = function(socket, cb) {
    console.log('[%s] %sauthApi\x1b[0m: token: %s', dateFormatted(), colors.magenta, socket.token);
    axiosAPI.defaults.headers.common['X-BetaSeries-Token'] = socket.token || '';
    const postData = {
        'login': config.login,
        "password": config.hashPass
    };
    axiosAPI.post('https://api.betaseries.com/members/auth', postData)
        .then((res) => {
            let error;
            if (res.status !== 200) {
                // console.error('request API members/auth error', res.statusText);
                error = new Error('Request Auth Failed.\n' + `Status Code: ${res.status}`);
            }
            const contentType = res.headers['content-type'];
            if (!/^application\/json/.test(contentType)) {
                error = new Error('Invalid content-type.\n' +
                `Expected application/json but received ${contentType}`);
            }
            if (error) {
                console.error(error.message);
                // Consume response data to free up memory
                res.resume();
                return cb(error.message);
            }
            console.log('auth request body:', res.data);
            if (res.data.token) {
                socket.token = res.data.token;
                axiosAPI.defaults.headers.common['X-BetaSeries-Token'] = res.data.token;
                return cb(null, res.data.token);
            }
            res.resume();
        }).catch(err => {
            console.error('authApi catch - error request: %s', err.message);
            cb(err.message);
        });
};

module.exports = {checkNotifs, authApi, getRedisUrl};