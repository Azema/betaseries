'use strict';
const axios = require('axios').default;
const betaseries_api_user_key = '45028a0b0d3c';

const axiosAPI = axios.create({
    baseURL: 'https://api.betaseries.com',
    timeout: 10000
});

// Alter defaults after instance has been created
axiosAPI.defaults.headers.common['Accept'] = 'application/json';
axiosAPI.defaults.headers.common['X-BetaSeries-Version'] = '3.0';
axiosAPI.defaults.headers.common['X-BetaSeries-Key'] = betaseries_api_user_key;

function checkToken(socket, cb) {
    axiosAPI.get('/members/is_active')
        .then(res => {
            if (res.status == 400) {
                authApi((err, newToken) => {
                    if (err) {
                        console.log('Error from authApi: ', err);
                        return cb(err);
                    }
                    socket.token = newToken;
                    return cb();
                });
            } else {
                return cb();
            }
        }).catch(err => {
            console.log('checkToken error request', err);
        });
}

const checkNotifs = function(socket) {
    axiosAPI.defaults.headers.common['X-BetaSeries-Token'] = socket.token || '';
    // On check d'abord le token
    checkToken(socket, (err) => {
        if (err) {
            console.log('checkNotifs error from checkToken', err);
            if (socket.nbRetry && socket.nbRetry < 5) {
                socket.nbRetry++;
                socket.timer = setTimeout(checkNotifs, 300000, socket);
            } else if (socket.timer) {
                clearTimeout(socket.timer);
            }
            return null;
        }
        socket.nbRetry = 0;

        axiosAPI.get('/members/notifications?all=true&sort=DESC&number=20')
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
                    console.log(error.message);
                    // Consume response data to free up memory
                    if (socket.nbRetry && socket.nbRetry < 5) {
                        socket.nbRetry++;
                        socket.timer = setTimeout(checkNotifs, 300000, socket);
                    } else if (socket.timer) {
                        clearTimeout(socket.timer);
                    }
                    return;
                }
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
                        console.log('news notifications(%d) found', notifs.length);
                        socket.emit('notifications', {notifications: notifs});
                        // Nouvelles notifications
                        socket.lastNotifId = data.notifications[0].id;
                    }
                } catch (err) {
                    console.log('Error parse json data', err);
                }
                socket.timer = setTimeout(checkNotifs, 300000, socket);
            }).catch(e => {
                console.log(`problem with request: ${e.message}`);
                socket.timer = setTimeout(checkNotifs, 300000, socket);
            });
    });
};

const authApi = function(socket, cb) {
    axiosAPI.defaults.headers.common['X-BetaSeries-Token'] = socket.token || '';
    const postData = {
        'login': 'azema31',
        "password": 'b1cfd6adb42a4874cdeaa57a071463ee'
    };
    axiosAPI.post('https://api.betaseries.com/members/auth', postData)
        .then((res) => {
            let error;
            if (res.status !== 200) {
                console.error('request API members/auth error', res.statusText);
                error = new Error('Request Failed.\n' + `Status Code: ${res.status}`);
            }
            const contentType = res.headers['content-type'];
            if (!/^application\/json/.test(contentType)) {
                error = new Error('Invalid content-type.\n' +
                `Expected application/json but received ${contentType}`);
            }
            if (error) {
                console.log(error.message);
                // Consume response data to free up memory
                res.resume();
                return cb(error.message);
            }
            try {
                // console.log('auth request body:', res.data);
                if (res.data.token) {
                    socket.token = res.data.token;
                    axiosAPI.defaults.headers.common['X-BetaSeries-Token'] = res.data.token;
                    return cb(null, res.data.token);
                }
            } catch (err) {
                console.log('Error parse json data', err);
                return cb(err.message);
            }
        }).catch(err => {
            console.log(`problem with request: ${err.message}`);
            cb(err.message);
        });
};

module.exports = {checkNotifs, authApi};