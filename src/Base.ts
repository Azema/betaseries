import { DataTypesCache, CacheUS } from "./Cache";
import { Character } from "./Character";
import { CommentsBS } from "./Comments";
import { implAddNote, Note } from "./Note";
import { User } from "./User";

export function ExceptionIdentification(message: string) {
    this.message = message;
    this.name = "ExceptionIdentification";
}
type Class<T> = new (...args: any[]) => T;
export enum NetworkState {
    'offline',
    'online'
}
export enum MediaType {
    show = 'show',
    movie = 'movie',
    episode = 'episode'
}
export type MediaTypes = {
    singular: MediaType;
    plural: string;
    className: Class<Base>;
};
export enum EventTypes {
    UPDATE = 'update',
    SAVE = 'save',
    ADD = 'add',
    ADDED = 'added',
    REMOVE = 'remove',
    NOTE = 'note',
    ARCHIVE = 'archive',
    UNARCHIVE = 'unarchive',
    SHOW = 'show',
    HIDE = 'hide'
}
export enum HTTP_VERBS {
    GET = 'GET',
    POST = 'POST',
    PUT = 'PUT',
    DELETE = 'DELETE',
    OPTIONS = 'OPTIONS',
    HEAD = 'HEAD'
}
export type Rating = {
    img: string;
    title: string;
};
export type Ratings = {
    [key: string]: Rating;
};
export type Obj = {
    [key: string]: any;
};
export type Callback = () => void;
export type Changes = {
    oldValue: any;
    newValue: any;
}
export type RelatedProp = {
    key: string; // Nom de la propriété dans l'objet
    type: any; // type de donnée
    default?: any; // valeur par défaut
    transform?: (obj: object, data: Obj) => any; // Fonction de transformation de la donnée
}
export function objToArr(obj: Base, data: Obj): Array<any> {
    if (data instanceof Array) return data;
    const values = [];
    for (const key in data) {
         values.push(data[key]);
    }
    return values;
}
export function isNull(val: any): boolean {
    return val === null || val === undefined;
}
interface FetchTimeout {
    abort: () => void;
    ready: () => Promise<Response>;
}
/**
 * Fonction pour les requêtes fetch avec un timeout
 * @param request - URL à appeler
 * @param opts - Options de la requête
 * @param timeout - Durée en secondes du timeout de la requête
 * @returns {FetchTimeout}
 */
function fetchTimeout(request: URL | RequestInfo, opts: RequestInit = {}, timeout = 30): FetchTimeout {
    const controller = new AbortController();
    opts.signal = controller.signal;

    return {
        abort: (): void => controller.abort(),
        ready: (): Promise<Response> => {
            const timer: NodeJS.Timer = setTimeout(() => controller.abort(), timeout * 1000);
            return fetch(request, opts).then((resp) => {
                if (timer) clearTimeout(timer);
                return resp;
            });
        }
    };
}
function checkNetwork(milliseconds = 0) {
    const request = `${Base.serverOauthUrl}/index.html`;
    const init: RequestInit = {
        method: HTTP_VERBS.HEAD,
        mode: 'cors',
        cache: 'no-cache',
    };
    const timeout = 5;
    /**
     * Transforme des secondes en durée heures, minutes, secondes
     * @param seconds - La durée en secondes
     * @returns {string}
     */
    const duration = function(seconds: number): string {
        if (seconds < 60) {
            return `${seconds.toString()} secondes`;
        }
        let minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        seconds -= (minutes * 60);
        let duration = '';
        if (hours > 0) {
            minutes -= (hours * 60);
            duration += `${hours.toString()} heure${hours > 1 ? 's' : ''} `;
        }
        duration += `${minutes.toString()} min. ${seconds.toString()} sec.`;
        return duration;
    }
    fetchTimeout(request, init, timeout).ready()
    .then((response: Response) => {
        if (response.ok) {
            if (Base.networkTimeout) {
                clearTimeout(Base.networkTimeout);
                Base.networkTimeout = null;
            }
            Base.changeNetworkState(NetworkState.online);
            console.log('Network is come back');
        }
    }).catch(err => {
        if (err.name === 'AbortError') {
            milliseconds += (milliseconds === 0) ? 1000 : 10000;
            console.log('checkNetwork: Fetch aborted (next check in: %s)', duration(milliseconds/1000));
        }
        else if (err.message.toLowerCase() !== 'failed to fetch') {
            console.error('checkNetwork catch: ', err);
        }
        Base.networkTimeout = setTimeout(checkNetwork, milliseconds, milliseconds);
    });
}
/**
 * FakePromise - Classe servant à simuler une promesse
 * d'appel à l'API lorsque le réseau est offline et
 * de réaliser le souhait lorsque le réseau est online
 * @class
 */
export class FakePromise {
    /**
     * Permet de vérifier si la fonction se trouve déjà dans le
     * tableau des fonctions callback
     * @param   {any} fn - Fonction callback de référence
     * @param   {any[]} funcs - Tableau des fonctions
     * @returns {boolean}
     */
    static fnAlreadyInclude(fn: any, funcs: Array<any>): boolean {
        const strFn = fn.toString();
        for (let t = 0; t < funcs.length; t++) {
            if (funcs[t].toString() === strFn) {
                return true;
            }
        }
        return false;
    }
    /**
     * Tableau des fonctions callback de type **then**
     * @type {Array<(data: Obj) => void>}
     */
    thenQueue: Array<(data:Obj)=>void>;
    /**
     * Tableau des fonctions callback de type **catch**
     * @type {Array<(reason: any) => void>}
     */
    catchQueue: Array<(reason: any)=>void>;
    /**
     * Tableau des fonctions callback de type **finally**
     * @type {Array<() => void>}
     */
    finallyQueue: Array<()=>void>;
    /**
     * Fonction qui sera executée lors de l'appel à la méthode **launch**
     * @see FakePromise.launch
     * @type {() => Promise<Obj>}
     */
    promiseFunc: (reason?: string) => Promise<Obj>;

    /**
     * Constructor
     * @param   {(reason?: string) => Promise<Obj>} [func] - Fonction promise qui sera executée plus tard
     * @returns {FakePromise}
     */
    constructor(func?: (reason?: string) => Promise<Obj>) {
        this.thenQueue = [];
        this.catchQueue = [];
        this.finallyQueue = [];
        this.promiseFunc = func;
        return this;
    }
    /**
     * Permet de définir la fonction qui retourne la vraie promesse
     * @param   {() => Promise<Obj>} func Fonction promise qui sera executée plus tard
     * @returns {FakePromise}
     */
    setFunction(func: (reason?: string) => Promise<Obj>): FakePromise {
        this.promiseFunc = func;
        return this;
    }
    /**
     * Simule un objet promise et stocke les fonctions pour plus tard
     * @param   {(data: Obj) => void} onfulfilled - Fonction appelée lorsque la promesse est tenue
     * @param   {(reason: any) => PromiseLike<never>} [onrejected] - Fonction appelée lorsque la promesse est rejetée
     * @returns {FakePromise}
     */
    then(onfulfilled?: (data: Obj) => void, onrejected?: (reason: any) => void | PromiseLike<never>): FakePromise {
        if (onfulfilled/*  && !FakePromise.fnAlreadyInclude(onfulfilled, this.thenQueue) */) {
            this.thenQueue.push(onfulfilled);
        }
        if (onrejected/*  && !FakePromise.fnAlreadyInclude(onrejected, this.catchQueue) */) {
            this.catchQueue.push(onrejected);
        }
        return this;
    }
    /**
     * Simule un objet promise et stocke les fonctions pour plus tard
     * @param   {(reason: any) => void | PromiseLike<void>} [onrejected] - Fonction appelée lorsque la promesse est rejetée
     * @returns {FakePromise}
     */
    catch(onrejected?: (reason: any) => void | PromiseLike<never>): FakePromise {
        return this.then(null, onrejected);
    }
    /**
     * Simule un objet promise et stocke les fonctions pour plus tard
     * @param   {() => void} [onfinally] - Fonction appelée lorsque la promesse est terminée
     * @returns {FakePromise}
     */
    finally(onfinally?: () => void): FakePromise {
        if (onfinally/*  && FakePromise.fnAlreadyInclude(onfinally, this.finallyQueue) */) {
            this.finallyQueue.push(onfinally);
        }
        return this;
    }
    /**
     * Rejet de la promise
     * @param reason - Le raison du rejet de la promise
     * @returns {Promise<void | Obj>}
     */
    reject(reason: string): Promise<void | Obj> {
        return this.promiseFunc(reason)
            .catch(() => {
                const catchs = this.catchQueue;
                for (let c = catchs.length; c >= 0; c--) {
                    if (typeof catchs[c] === 'function') {
                        catchs[c](reason);
                        // return;
                    }
                }
            })
            .finally(() => {
                const finallies = this.finallyQueue;
                for (let f = finallies.length; f >= 0; f--) {
                    if (typeof finallies[f] === 'function') {
                        finallies[f]();
                        // return;
                    }
                }
            });
    }
    /**
     * Permet de lancer la fonction qui retourne la vraie promesse
     * ainsi que d'appliquer les fonctions (then, catch et finally) précédemment stockées
     * @returns {Promise<any>}
     */
    launch(): Promise<any> {
        return this.promiseFunc()
        .then((data: Obj) => {
            const thens = this.thenQueue;
            for (let t = thens.length; t >= 0; t--) {
                if (typeof thens[t] === 'function') {
                    thens[t](data);
                    // return;
                }
            }
        })
        .catch(err => {
            const catchs = this.catchQueue;
            for (let c = catchs.length; c >= 0; c--) {
                if (typeof catchs[c] === 'function') {
                    catchs[c](err);
                    // return;
                }
            }
        })
        .finally(() => {
            const finallies = this.finallyQueue;
            for (let f = finallies.length; f >= 0; f--) {
                if (typeof finallies[f] === 'function') {
                    finallies[f]();
                    // return;
                }
            }
        });
    }
}

export abstract class Base implements implAddNote {
    /*
                    STATIC
    */
    /**
     * Flag de debug pour le dev
     * @static
     * @type {boolean}
     */
    static debug = false;
    /**
     * L'objet cache du script pour stocker les données
     * @static
     * @type {CacheUS}
     */
    static cache: CacheUS = null;
    /**
     * Objet contenant les informations de l'API
     * @static
     * @type {Obj}
     */
    static api: Obj = {
            "url": 'https://api.betaseries.com',
            "versions": {"current": '3.0', "last": '3.0'},
            "resources": [ // Les ressources disponibles dans l'API
                'badges', 'comments', 'episodes', 'friends', 'members', 'messages',
                'movies', 'news', 'oauth', 'persons', 'pictures', 'planning',
                'platforms', 'polls', 'reports', 'search', 'seasons', 'shows',
                'subtitles', 'timeline'
            ],
            "check": { // Les endpoints qui nécessite de vérifier la volidité du token
                "episodes": ['display', 'list', 'search', 'watched'],
                "members" : ['notifications'],
                "movies"  : ['list', 'movie', 'search', 'similars'],
                "search"  : ['all', 'movies', 'shows'],
                "shows"   : ['display', 'episodes', 'list', 'member', 'search', 'similars']
            },
            "notDisplay": ['membersnotifications'],
            "tokenRequired": { // Endpoints nécessitant un token
                "comments": {
                    "close": ['POST'],
                    "comment": ['POST', 'DELETE'],
                    "comment_event": ['POST'],
                    "open": ['POST'],
                    "subscription": ['POST', 'DELETE'],
                    "thumb": ['POST', 'DELETE']
                },
                "episodes": {
                    "downloaded": ['POST', 'DELETE'],
                    "hidden": ['POST', 'DELETE'],
                    "latest": ['GET'],
                    "list": ['GET'],
                    "next": ['GET'],
                    "note": ['POST', 'DELETE'],
                    "scraper": ['GET'],
                    "search": ['GET'],
                    "unrated": ['GET'],
                    "watched": ['POST', 'DELETE'],
                },
                "members": {
                    "avatar": ['POST', 'DELETE'],
                    "banner": ['POST', 'DELETE'],
                    "delete": ['POST'],
                    "destroy": ['POST'],
                    "email": ['GET', 'POST'],
                    "facebook": ['POST'],
                    "is_active": ['GET'],
                    "lametric": ['GET'],
                    "locale": ['GET'],
                    "notification": ['DELETE'],
                    "notifications": ['GET'],
                    "option": ['POST'],
                    "options": ['GET'],
                    "password": ['POST'],
                    "sync": ['POST'],
                    "twitter": ['POST', 'DELETE'],
                },
                "movies": {
                    "favorite": ['POST', 'DELETE'],
                    "movie": ['POST', 'DELETE'],
                    "note": ['POST', 'DELETE'],
                    "scraper": ['GET'],
                },
                "platforms": {
                    "service": ['POST', 'DELETE']
                },
                "shows": {
                    "archive": ['POST', 'DELETE'],
                    "favorite": ['POST', 'DELETE'],
                    "note": ['POST', 'DELETE'],
                    "recommendation": ['POST', 'DELETE', 'PUT'],
                    "recommendations": ['GET'],
                    "show": ['POST', 'DELETE'],
                    "tags": ['POST'],
                    "unrated": ['GET'],
                },
                "subtitles": {
                    "report": ['POST']
                }
            }
    };
    /**
     * Le token d'authentification de l'API BetaSeries
     * @static
     * @type {String}
     */
    static token: string = null;
    /**
     * La clé d'utilisation de l'API BetaSeries
     * @static
     * @type {String}
     */
    static userKey: string = null;
    /**
     * L'identifiant du membre connecté
     * @static
     * @type {Number}
     */
    static userId: number = null;
    /**
     * Clé d'authentification pour l'API TheMovieDB
     * @static
     * @type {string}
     */
    static themoviedb_api_user_key: string = null;
    /**
     * Compteur d'appels à l'API
     * @static
     * @type {Number}
     */
    static counter = 0;
    /**
     * L'URL de base du serveur contenant les ressources statiques
     * et les proxy
     * @static
     * @type {String}
     */
    static serverBaseUrl = '';
    /**
     * L'URL de base du serveur pour l'authentification
     * @static
     * @see Base.authenticate
     * @type {String}
     */
    static serverOauthUrl = '';
    /**
     * Indique le theme d'affichage du site Web (light or dark)
     * @static
     * @type {string}
     */
    static theme = 'light';
    /**
     * Fonction de notification sur la page Web
     * @type {Function}
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static notification = (title: string, text: string): void => {};
    /**
     * Fonction pour vérifier que le membre est connecté
     * @type {Function}
     */
    static userIdentified: () => boolean = () => { return false; };
    /**
     * Fonction vide
     * @type {Function}
     */
    static noop: Callback = () => {};
    /**
     * Fonction de traduction de chaînes de caractères
     * @param   {String}  msg  - Identifiant de la chaîne à traduire
     * @param   {Obj}     [params] - Variables utilisées dans la traduction {"%key%"": value}
     * @param   {number}  [count=1] - Nombre d'éléments pour la version plural
     * @returns {string}
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static trans = (msg: string, params?: Obj, count = 1): string => { return msg; };
    /**
     * Contient les infos sur les différentes classification TV et cinéma
     * @type {Ratings}
     */
    static ratings: Ratings = null;
    static gm_funcs = {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        getValue: (key: string, defaultValue: Obj | Array<Obj> | Array<string> | Array<number>): any => { return defaultValue; },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        setValue: (key: string, val: Obj | Array<Obj> | Array<string> | Array<number>): void => {}
    };
    /**
     * Types d'évenements gérés par cette classe
     * @type {Array}
     */
    static EventTypes: Array<EventTypes> = [
        EventTypes.UPDATE,
        EventTypes.SAVE,
        EventTypes.NOTE
    ];
    /**
     * Méthode servant à afficher le loader sur la page Web
     * @static
     */
    static showLoader() {
        jQuery('#loader-bg').show();
    }
    /**
     * Méthode servant à masque le loader sur la page Web
     * @static
     */
    static hideLoader() {
        jQuery('#loader-bg').hide();
    }
    /**
     * Fonction d'authentification à l'API BetaSeries
     * @static
     * @return {Promise}
     */
    static authenticate(): Promise<string> {
        if (Base.debug) console.log('authenticate');
        if (jQuery('#containerIframe').length <= 0) {
            jQuery('body').append(`
                <div id="containerIframe">
                <iframe id="userscript"
                        name="userscript"
                        title="Connexion à BetaSeries"
                        width="50%"
                        height="400"
                        src="${Base.serverOauthUrl}/index.html"
                        style="background:white;margin:auto;">
                </iframe>
                </div>'
            `);
        }
        return new Promise((resolve, reject) => {
            function receiveMessage(event) {
                const origin = new URL(Base.serverOauthUrl).origin;
                // if (debug) console.log('receiveMessage', event);
                if (event.origin !== origin) {
                    if (Base.debug) console.error('receiveMessage {origin: %s}', event.origin, event);
                    reject(`event.origin is not ${origin}`);
                    return;
                }
                if (event.data.message === 'access_token') {
                    Base.token = event.data.value;
                    $('#containerIframe').remove();
                    resolve(event.data.message);
                    window.removeEventListener("message", receiveMessage, false);
                } else {
                    console.error('Erreur de récuperation du token', event);
                    reject(event.data);
                    Base.notification('Erreur de récupération du token', 'Pas de message');
                    window.removeEventListener("message", receiveMessage, false);
                }
            }
            window.addEventListener("message", receiveMessage, false);
        });
    }
    /**
     * @type {boolean} Flag indiquant qu'une demande d'authentification est en cours
     */
    static __checkAuthenticate = false;
    /**
     * Nombre de timeout consécutifs lors des appels à l'API
     * @type {number}
     * @private
     * @static
     */
    private static __nbNetTimeout = 0;
    private static __maxTimeout = 2;
    /**
     * Durée du timeout des requêtes à l'API exprimé en secondes
     * @type {number}
     */
    static timeoutRequests = 30;
    /**
     * Fonction servant à appeler l'API de BetaSeries
     * @static
     * @param  {String}   type - Type de methode d'appel Ajax (GET, POST, PUT, DELETE)
     * @param  {String}   resource - La ressource de l'API (ex: shows, seasons, episodes...)
     * @param  {String}   action - L'action à appliquer sur la ressource (ex: search, list...)
     * @param  {Obj}      args - Un objet (clef, valeur) à transmettre dans la requête
     * @param  {bool}     [force=false] - Indique si on doit forcer l'appel à l'API ou
     * si on peut utiliser le cache (Par défaut: false)
     * @return {Promise<Obj>} Les données provenant de l'API
     * @throws Error
     */
    static callApi(type: string, resource: string, action: string, args: Obj, force = false): Promise<Obj> {
        if (Base.api && Base.api.resources.indexOf(resource) === -1) {
            throw new Error(`Ressource (${resource}) inconnue dans l'API.`);
        }
        if (! Base.userKey) {
            Base.notification('Call API', `La clé API doit être renseignée`);
            throw new Error('userKey are required');
        }
        if (! Base.token && resource in Base.api.tokenRequired &&
            action in Base.api.tokenRequired[resource] &&
            Base.api.tokenRequired[resource][action].indexOf(type) !== 1)
        {
            Base.notification('Call API', `Identification requise pour cet appel: ${type} ${resource}/${action}`);
            // Identification required
            throw new ExceptionIdentification("Identification required");
        }
        let check = false;
        let display = true;

        // On vérifie si on doit afficher les infos de requêtes dans la console
        if (Base.api.notDisplay.indexOf(resource + action) >= 0) {
            display = false;
        } else {
            Base.showLoader();
        }

        // Les en-têtes pour l'API
        const myHeaders = {
                'Accept'                : 'application/json',
                'X-BetaSeries-Version'  : Base.api.versions.current,
                'X-BetaSeries-Token'    : Base.token,
                'X-BetaSeries-Key'      : Base.userKey
            },
            checkKeys = Object.keys(Base.api.check);

        if (Base.debug && display) {
            console.log('Base::callApi', {
                type: type,
                resource: resource,
                action: action,
                args: args,
                force: force
            });
        }

        // On retourne la ressource en cache si elle y est présente
        if (Base.cache && ! force && type === 'GET' && args && 'id' in args &&
            Base.cache.has((resource as DataTypesCache), args.id))
        {
            //if (debug) console.log('Base.callApi retourne la ressource du cache (%s: %d)', resource, args.id);
            return new Promise((resolve) => {
                resolve(Base.cache.get((resource as DataTypesCache), args.id));
                Base.hideLoader();
            });
        }
        // Vérification de l'état du réseau, doit être placé après la gestion du cache
        if (Base.networkState === NetworkState.offline) {
            const key = type + resource + action;
            if (!isNull(Base.__networkQueue[key])) {
                Base.__networkQueue[key].reject('another request called');
            }
            const promise = new FakePromise((reason?: string) => {
                if (reason && reason.length > 0) {
                    return Promise.reject(reason);
                }
                return Base.callApi(type, resource, action, args, force)
                .then(data => data)
                .catch(err => err);
            });
            Base.__networkQueue[key] = promise;
            return promise as unknown as Promise<Obj>;
        }

        // On check si on doit vérifier la validité du token
        // (https://www.betaseries.com/bugs/api/461)
        if (Base.userIdentified() && checkKeys.indexOf(resource) !== -1 &&
            Base.api.check[resource].indexOf(action) !== -1)
        {
            check = true;
            if (Base.__checkAuthenticate) {
                if (Base.debug) console.log('Base::callApi authenticate in progress');
                return new Promise((res, rej) => {
                    let loop = 0;
                    const checkAuthenticate = function checkAuthenticate(): void {
                        if (Base.debug) console.log('checkAuthenticate(%d) for %s %s/%s', ++loop, type, resource, action);
                        if (Base.__checkAuthenticate && Base.networkState === NetworkState.online) {
                            setTimeout(checkAuthenticate, 1000);
                        } else if (Base.networkState === NetworkState.offline) {
                            Base.__checkAuthenticate = false;
                            rej('network offline');
                        } else if (Base.networkState === NetworkState.online) {
                            Base.callApi(type, resource, action, args, force)
                            .then(data => res(data))
                            .catch(err => rej(err));
                        } else {
                            if (Base.debug)
                                console.log('Base::callApi checkAuthenticate - condition unknown', {checkAuthenticate: Base.__checkAuthenticate});
                        }
                    };
                    checkAuthenticate();
                });
            }
        }

        /**
         * Appel à l'API
         * @param {function} resolve - Fonction appelée en cas de succès
         * @param {function} reject - Fonction appelée en cas d'échec
         */
        function fetchUri(resolve: (data: Obj) => void, reject: (reason?: any) => void) {
            const initFetch: RequestInit = { // objet qui contient les paramètres de la requête
                method: type,
                headers: myHeaders,
                mode: 'cors',
                cache: 'no-cache'
            };
            let uri = `${Base.api.url}/${resource}/${action}`;
            const keys = Object.keys(args);
            // On crée l'URL de la requête de type GET avec les paramètres
            if (type === 'GET' && keys.length > 0) {
                const params = [];
                for (const key of keys) {
                    params.push(key + '=' + encodeURIComponent(args[key]));
                }
                uri += '?' + params.join('&');
            } else if (keys.length > 0) {
                initFetch.body = new URLSearchParams(args);
            }
            fetchTimeout(uri, initFetch, Base.timeoutRequests).ready()
            .then(response => {
                Base.__nbNetTimeout = 0;
                Base.counter++; // Incrément du compteur de requêtes à l'API
                if (Base.debug && (display || response.status !== 200))
                    console.log('Base::callApi fetchUri (%s %s) response status: %d', type, uri, response.status);
                // On récupère les données et les transforme en objet
                response.json().then((data) => {
                    if (Base.debug && (display || response.status !== 200))
                        console.log('Base::callApi fetchUri (%s %s) data', type, uri, data);
                    // On gère le retour d'erreurs de l'API
                    if (data.errors !== undefined && data.errors.length > 0) {
                        const code = data.errors[0].code,
                                text = data.errors[0].text;
                        if (code === 2005 ||
                            (response.status === 400 && code === 0 &&
                                text === "L'utilisateur a déjà marqué cet épisode comme vu."))
                        {
                            reject('changeStatus');
                        } else if (code == 2001) {
                            // Appel de l'authentification pour obtenir un token valide
                            Base.authenticate().then(() => {
                                Base.callApi(type, resource, action, args, force)
                                    .then(data => resolve(data), err => reject(err));
                            }, (err) => {
                                reject(err);
                            });
                        } else {
                            reject(data.errors[0]);
                        }
                        Base.hideLoader();
                        return;
                    }
                    // On gère les erreurs réseau
                    if (!response.ok) {
                        console.error('Base::callApi Fetch erreur network', response);
                        reject(response);
                        Base.hideLoader();
                        return;
                    }
                    resolve(data);
                    Base.hideLoader();
                });
            }).catch(error => {
                console.warn('Base::callApi fetchUri catch (%s: %s/%s)', type, resource, action);
                if (error.name === 'AbortError') {
                    if (++Base.__nbNetTimeout > Base.__maxTimeout) {
                        if (Base.debug)
                            console.log('%d timeout consecutifs, Network state to offline', Base.__nbNetTimeout);
                        Base.changeNetworkState(NetworkState.offline, true);
                    }
                    if (Base.debug)
                        console.log('Base::callApi AbortError Timeout(nb retry: %d) fetchUri', Base.__nbNetTimeout);
                    return;
                }
                console.warn('Base::callApi fetchUri error: ' + error.message);
                console.error(error);
                reject(error);
            }).finally(() => {
                Base.hideLoader();
            });
        }
        return new Promise((resolve: (value:Obj | PromiseLike<Obj>) => void, reject: (reason?: any) => void) => {
            if (check) {
                Base.__checkAuthenticate = true;
                const paramsFetch: RequestInit = {
                    method: HTTP_VERBS.GET,
                    headers: myHeaders,
                    mode: 'cors',
                    cache: 'no-cache'
                };
                if (Base.debug && display) console.info('%ccall /members/is_active', 'color:#1d6fb2');
                fetchTimeout(`${Base.api.url}/members/is_active`, paramsFetch, Base.timeoutRequests).ready()
                .then((resp: Response) => {
                    Base.__nbNetTimeout = 0;
                    Base.counter++; // Incrément du compteur de requêtes à l'API
                    if ( ! resp.ok && resp.status === 400) {
                        if (Base.debug) console.log('authenticate for %s: %s/%s', type, resource, action);
                        // Appel de l'authentification pour obtenir un token valide
                        Base.authenticate().then(() => {
                            // On met à jour le token pour le prochain appel à l'API
                            myHeaders['X-BetaSeries-Token'] = Base.token;
                            Base.__checkAuthenticate = false;
                            fetchUri(resolve, reject);
                        }).catch(err => reject(err));
                        return;
                    }
                    Base.__checkAuthenticate = false;
                    fetchUri(resolve, reject);
                }).catch(error => {
                    Base.__checkAuthenticate = false;
                    console.warn('Base::callApi fetch members/is_active catch');
                    if (error.name === 'AbortError') {
                        if (++Base.__nbNetTimeout > Base.__maxTimeout) {
                            if (Base.debug)
                                console.log('%d timeout consecutifs, Network state to offline', Base.__nbNetTimeout);
                            Base.changeNetworkState(NetworkState.offline, true);
                        }
                        if (Base.debug)
                            console.log('Base::callApi AbortError Timeout(nb retry: %d) members/is_active', Base.__nbNetTimeout);
                        return;
                    }
                    else if (error.message.toLowerCase() === 'failed to fetch') {
                        if (Base.debug) console.log('On déclare le réseau hors ligne. Le retour du réseau sera testé régulièrement.');
                        Base.changeNetworkState(NetworkState.offline, true);
                    }
                    else {
                        if (Base.debug) console.log('Il y a eu un problème avec l\'opération fetch: ' + error.message);
                    }
                    console.error(error);
                    reject(error);
                })
                .finally(() => {
                    Base.__checkAuthenticate = false;
                });
            } else {
                fetchUri(resolve, reject);
            }
        });
    }
    /**
     * *setPropValue* - Permet de modifier la valeur d'une propriété dans un objet,
     * ou dans un sous objet de manière dynamique
     * @param obj - Objet à modifier
     * @param key - chemin d'accès à la propriété à modifier
     * @param val - Nouvelle valeur de la propriété
     */
    static setPropValue(obj: object, key: string, val: string) {
        if (key.indexOf('.') >= 0) {
            const data: Array<string> = key.split('.');
            const path = data.shift();
            key = data.join('.');

            // On verifie si il s'agit d'un element de tableau
            if (/\[\d+\]$/.test(path)) {
                // On récupère le tableau et on laisse l'index
                const tab = path.replace(/\[\d+\]$/, '');
                const index = parseInt(path.replace(/[^\d]*/, ''), 10);
                Base.setPropValue(obj[tab][index], key, val);
            } else if (/\[.*\]$/.test(path)) {
                const tab = path.replace(/\[.+\]$/, '');
                const index = path.replace(/^.*\[/, '').replace(/\]$/, '');
                Base.setPropValue(obj[tab][index], key, val);
            }
            else {
                Base.setPropValue(obj[path], key, val);
            }
        }
        else if (/\[.*\]$/.test(key)) {
            const tab = key.replace(/\[.+\]$/, '');
            const index = key.replace(/^.*\[/, '').replace(/\]$/, '');
            obj[tab][index] = val;
        }
        else {
            obj[key] = val;
        }
    }
    /**
     * *replaceParams* - Permet de remplacer des paramètres par des valeurs dans une chaîne de caractères
     * @param   {string} path -   Chaine à modifier avec les valeurs
     * @param   {object} params - Objet contenant les paramètres autorisés et leur type
     * @param   {object} data -   Objet contenant les valeurs des paramètres
     * @returns {string}
     */
    static replaceParams(path: string, params: object, data: object): string {
        const keys = Object.keys(params);
        for (let k = 0; k < keys.length; k++) {
            const key = keys[k];
            const type = params[key];
            if (data[key] === undefined) { throw new Error(`Parameter[${key}] missing`); }
            let param = data[key];
            if (type == 'number') {
                param = parseInt(param, 10);
            } else if (type == 'string') {
                param = String(param);
            }
            const reg = new RegExp(`#${key}#`, 'g');
            path = path.replace(reg, param);
        }
        return path;
    }
    static relatedProps: Record<string, RelatedProp> = {};
    static selectorsCSS: Record<string, string> = {};
    /**
     * Etat du réseau
     * @type {NetworkState}
     */
    static networkState: NetworkState = NetworkState.online;
    static networkTimeout: NodeJS.Timer;
    /**
     * Stockage des appels à l'API lorsque le réseau est offline
     * @type {Record<string, FakePromise>}
     */
    static __networkQueue: Record<string, FakePromise> = {};
    /**
     * Modifie la variable de l'état du réseau
     * Et gère les promesses d'appels à l'API lorsque le réseau est online
     * @param {NetworkState} state - Etat du réseau
     * @param {boolean} testNetwork - Flag demandant de vérifier l'état du réseau régulièrement
     */
    static changeNetworkState(state: NetworkState, testNetwork = false) {
        this.networkState = state;
        if (state === NetworkState.online && Object.keys(this.__networkQueue).length > 0) {
            const keys = Reflect.ownKeys(this.__networkQueue);
            for (const key of keys) {
                this.__networkQueue[key as string].launch();
                // promise.finally(() => delete this.__networkQueue[key as string]);
            }
        } else if (state === NetworkState.offline) {
            this.__networkQueue = {};
            if (testNetwork) {
                checkNetwork();
            }
        }
    }

    /*
                    PROPERTIES
    */
    /** @type {string} */
    description: string;
    /** @type {number} */
    nbComments: number;
    /** @type {number} */
    id: number;
    /** @type {Note} */
    objNote: Note;
    /** @type {string} */
    resource_url: string;
    /** @type {string} */
    title: string;
    /** @type {User} */
    user: User;
    /** @type {Array<Character>} */
    characters: Array<Character>;
    /** @type {CommentsBS} */
    comments: CommentsBS;
    /** @type {MediaTypes} */
    mediaType: MediaTypes;

    /**
     * @type {boolean} Flag d'initialisation de l'objet, nécessaire pour les methodes fill and compare
     */
    protected __initial: boolean;
    /**
     * @type {Record<string, Changes} Stocke les changements des propriétés de l'objet
     */
    protected __changes: Record<string, Changes>;
    /**
     * @type {Array<string>} Tableau des propriétés énumerables de l'objet
     */
    protected __props: Array<string>;
    /**
     * @type {JQuery<HTMLElement>} Element HTML de référence du média
     */
    private __elt: JQuery<HTMLElement>;
    /**
     * @type {object} Contient les écouteurs d'évènements de l'objet
     */
    private __listeners: object;

    /*
                    METHODS
    */
    constructor(data: Obj) {
        if (!(data instanceof Object)) {
            throw new Error("data is not an object");
        }
        this.__initial = true;
        this.__changes = {};
        this.characters = [];
        this.__elt = null;
        this.__props = ['characters', 'comments', 'mediaType'];
        this._initListeners();
        return this;
    }

    /**
     * Symbol.Iterator - Methode Iterator pour les boucles for..of
     * @returns {object}
     */
    [Symbol.iterator](): object {
        const self = this;
        return {
            pos: 0,
            props: self.__props,
            next(): IteratorResult<any> {
                if (this.pos < this.props.length) {
                    const item = {value: this.props[this.pos], done: false};
                    this.pos++;
                    return item;
                } else {
                    this.pos = 0;
                    return {value: null, done: true};
                }
            }
        }
    }

    /**
     * Retourne l'objet sous forme d'objet simple, sans référence circulaire,
     * pour la méthode JSON.stringify
     * @returns {object}
     */
    toJSON(): object {
        const obj: object = {};
        const keys = Reflect.ownKeys(this)
            .filter((key:string) => !key.startsWith('_'));
        for (const key of keys) {
            obj[key] = this[key];
        }
        return obj;
    }

    /**
     * Remplit l'objet avec les données fournit en paramètre
     * @param  {Obj} data - Les données provenant de l'API
     * @returns {Base}
     * @virtual
     */
    fill(data: Obj): this {
        const self = this;
        if (typeof data !== 'object') {
            const err = new TypeError('Base.fill data is not an object: ' + typeof data);
            console.error(err);
            throw err;
        }
        const checkTypeValue = (target: any, key: string, type: any, value: any, relatedProp: RelatedProp): any => {
            const typeNV = typeof value;
            const oldValue = target['_' + key];
            const hasDefault = Reflect.has(relatedProp, 'default');
            const hasTransform = Reflect.has(relatedProp, 'transform');
            if (!isNull(value) && hasTransform && typeof relatedProp.transform === 'function') {
                value = relatedProp.transform(target, value);
            }
            if (isNull(oldValue) && isNull(value)) return undefined;
            switch(type) {
                case 'string':
                    value = (! isNull(value)) ? String(value) : hasDefault ? relatedProp.default : null;
                    if (oldValue === value) return undefined;
                    break;
                case 'number':
                    if (!isNull(value) && !hasTransform && typeNV === 'string') {
                        value = parseInt(value, 10);
                    }
                    else if (isNull(value) && hasDefault) {
                        value = relatedProp.default;
                    }
                    if (oldValue === value) return undefined;
                    break;
                case 'boolean':
                    value = (typeNV === 'boolean') ? value : hasDefault ? relatedProp.default : null;
                    if (oldValue === value) return undefined;
                    break;
                case 'array': {
                    if (this.__initial || !Array.isArray(oldValue)) return value;
                    let diff = false;
                    for (let i = 0, _len = oldValue.length; i < _len; i++) {
                        if (oldValue[i] !== value[i]) {
                            diff = true;
                            break;
                        }
                    }
                    if (!diff) return undefined;
                    break;
                }
                case 'date': {
                    if (typeNV !== 'number' && !(value instanceof Date) &&
                        (typeNV === 'string' && Number.isNaN(Date.parse(value))))
                    {
                        throw new TypeError(`Invalid value for key "${key}". Expected type (Date | Number | string) but got ${JSON.stringify(value)}`);
                    }
                    if (typeNV === 'number' || typeNV === 'string')
                        value = new Date(value);
                    if (oldValue instanceof Date && value.getTime() === oldValue.getTime()) {
                        return undefined;
                    }
                    break;
                }
                case 'object':
                default: {
                    if (typeNV === 'object' && type === 'object') {
                        value = (! isNull(value)) ? Object.assign({}, value) : hasDefault ? relatedProp.default : null;
                    }
                    else if (typeof type === 'function' && !isNull(value)) {
                        // if (Base.debug) console.log('fill type function', {type: relatedProp.type, dataProp});
                        value = Reflect.construct(type, [value]);
                        if (typeof value === 'object' && Reflect.has(value, 'parent')) {
                            value.parent = target;
                        }
                    }
                    if (this.__initial || isNull(oldValue)) return value;
                    let changed = false;
                    try {
                        if (
                            (isNull(oldValue) && !isNull(value)) ||
                            (!isNull(oldValue) && isNull(value))
                        ) {
                            changed = true;
                        }
                        else if (typeof value === 'object' && !isNull(value)) {
                            if (JSON.stringify(oldValue) !== JSON.stringify(value)) {
                                console.log('compare objects with JSON.stringify and are differents', {oldValue, value});
                                changed = true;
                            }
                            // changed = compareObj(oldValue, value);
                        }
                        if (!changed) return undefined;
                    } catch (err) {
                        console.warn('Base.fill => checkTypeValue: error setter[%s.%s]', target.constructor.name, key, {oldValue, value});
                        throw err;
                    }
                }
            }
            if (type === 'date') {
                type = Date;
            }
            if ((typeof type === 'string' && typeof value !== type) ||
                (typeof type === 'function' && !(value instanceof type)))
            {
                throw new TypeError(`Invalid value for key "${target.constructor.name}.${key}". Expected type "${(typeof type === 'string') ? type : JSON.stringify(type)}" but got "${typeof value}"`);
            }
            return value;
        }
        // On reinitialise les changements de l'objet
        this.__changes = {};
        for (const propKey in (this.constructor as typeof Base).relatedProps) {
            if (!Reflect.has(data, propKey)) continue;
            /** relatedProp contient les infos de la propriété @see RelatedProp */
            const relatedProp = (this.constructor as typeof Base).relatedProps[propKey];
            // dataProp contient les données provenant de l'API
            const dataProp = data[propKey];
            // Le descripteur de la propriété, utilisé lors de l'initialisation de l'objet
            let descriptor: PropertyDescriptor;
            if (this.__initial) {
                descriptor = {
                    configurable: true,
                    enumerable: true,
                    get: () => {
                        return self['_' + relatedProp.key];
                    },
                    set: (newValue: any) => {
                        // On vérifie le type et on modifie, si nécessaire, la valeur
                        // pour la rendre conforme au type définit (ex: number => Date or object => Note)
                        const value = checkTypeValue(self, relatedProp.key, relatedProp.type, newValue, relatedProp);
                        // Lors de l'initialisation, on set directement la valeur
                        if (self.__initial) {
                            self['_' + relatedProp.key] = value;
                            return;
                        }
                        // On récupère l'ancienne valeur pour identifier le changement
                        const oldValue = self['_' + relatedProp.key];
                        // Si value est undefined, alors pas de modification de valeur
                        if (value === undefined) {
                            // console.log('Base.fill setter[%s.%s] not changed', self.constructor.name, relatedProp.key, relatedProp.type, {newValue, oldValue, relatedProp});
                            return;
                        }
                        if (Base.debug) console.log('Base.fill setter[%s.%s] value changed', self.constructor.name, relatedProp.key, {type: relatedProp.type, newValue, oldValue, value, relatedProp});
                        // On set la nouvelle valeur
                        self['_' + relatedProp.key] = value;
                        // On stocke le changement de valeurs
                        self.__changes[relatedProp.key] = {oldValue, newValue};
                        // On appelle la methode de mise à jour du rendu HTML pour la propriété
                        self.updatePropRender(relatedProp.key);
                    }
                };
            }

            // if (Base.debug) console.log('Base.fill descriptor[%s.%s]', this.constructor.name, relatedProp.key, {relatedProp, dataProp, descriptor});
            // Lors de l'initialisation, on définit la propriété de l'objet
            // et on ajoute le nom de la propriété dans le tableau __props
            if (this.__initial) {
                Object.defineProperty(this, relatedProp.key, descriptor);
                this.__props.push(relatedProp.key);
            }
            // On set la valeur
            this[relatedProp.key] = dataProp;
        }
        // Fin de l'initialisation
        if (this.__initial) {
            this.__props.sort();
            this.__initial = false;
        }
        return this.save();
    }

    /**
     * Initialisation du rendu HTML
     * @returns {void}
     */
    _initRender(): void {
        if (!this.elt) return;
        // console.log('Base._initRender', this);
        this.objNote
            .updateAttrTitle()
            .updateStars();
        this.decodeTitle();
    }
    /**
     * Met à jour le rendu HTML des propriétés de l'objet,
     * si un sélecteur CSS exite pour la propriété fournit en paramètre\
     * **Méthode appelée automatiquement par le setter de la propriété**
     * @see Show.selectorsCSS
     * @param   {string} propKey - La propriété de l'objet à mettre à jour
     * @returns {void}
     */
    updatePropRender(propKey: string): void {
        if (! this.elt || ! this.__props.includes(propKey)) return;
        const fnPropKey = 'updatePropRender' + propKey.camelCase().upperFirst();
        // if (Base.debug) console.log('updatePropRender', propKey, fnPropKey);
        if (Reflect.has(this, fnPropKey)) {
            // if (Base.debug) console.log('updatePropRender Reflect has method');
            this[fnPropKey]();
        } else if ((this.constructor as typeof Base).selectorsCSS &&
            (this.constructor as typeof Base).selectorsCSS[propKey])
        {
            // if (Base.debug) console.log('updatePropRender default');
            const selectorCSS = (this.constructor as typeof Base).selectorsCSS[propKey];
            jQuery(selectorCSS).text(this[propKey].toString());
            delete this.__changes[propKey];
        }
    }
    /**
     * Met à jour les informations de la note du média sur la page Web
     */
    updatePropRenderObjNote(): void {
        if (! this.elt) return;
        if (Base.debug) console.log('updatePropRenderObjNote');
        this.objNote
            .updateStars()
            .updateAttrTitle();
        this._callListeners(EventTypes.NOTE);
        delete this.__changes.objNote;
    }
    /**
     * Met à jour le titre du média sur la page Web
     */
    updatePropRenderTitle(): void {
        if (! this.elt) return;
        const $title = jQuery((this.constructor as typeof Base).selectorsCSS.title);
        if (/&#/.test(this.title)) {
            $title.text($('<textarea />').html(this.title).text());
        } else {
            $title.text(this.title);
        }
        delete this.__changes.title;
    }
    /**
     * Indique si cet objet a été modifié
     * @returns {boolean}
     */
    isModified(): boolean {
        return Object.keys(this.__changes).length > 0;
    }
    /**
     * Retourne les changements apportés à cet objet
     * @returns {Record<string, Changes>}
     */
    getChanges(): Record<string, Changes> {
        return this.__changes;
    }
    /**
     * Indique si la propriété passée en paramètre a été modifiée
     * @param   {string} propKey - La propriété ayant potentiellement été modifiée
     * @returns {boolean}
     */
    hasChange(propKey: string): boolean {
        if (! this.__props.includes(propKey)) {
            throw new Error(`Property[${propKey}] not exists in this object(${this.constructor.name})`);
        }
        return Reflect.has(this.__changes, propKey);
    }
    /**
     * Retourne l'objet Changes correspondant aux changements apportés à la propriété passée en paramètre
     * @param   {string} propKey - La propriété ayant été modifiée
     * @returns {Changes} L'objet Changes correspondant aux changement
     */
    getChange(propKey: string): Changes {
        if (! this.__props.includes(propKey)) {
            throw new Error(`Property[${propKey}] not exists in this object(${this.constructor.name})`);
        }
        return this.__changes[propKey];
    }
    /**
     * Initialize le tableau des écouteurs d'évènements
     * @returns {Base}
     * @sealed
     */
    private _initListeners(): this {
        this.__listeners = {};
        const EvtTypes = (this.constructor as typeof Base).EventTypes;
        for (let e = 0; e < EvtTypes.length; e++) {
            this.__listeners[EvtTypes[e]] = [];
        }
        return this;
    }
    /**
     * Permet d'ajouter un listener sur un type d'évenement
     * @param  {EventTypes} name - Le type d'évenement
     * @param  {Function}   fn   - La fonction à appeler
     * @return {Base} L'instance du média
     * @sealed
     */
    public addListener(name: EventTypes, fn: Callback, ...args: any[]): this {
        //if (Base.debug) console.log('Base[%s] add Listener on event %s', this.constructor.name, name);
        // On vérifie que le type d'event est pris en charge
        if ((this.constructor as typeof Base).EventTypes.indexOf(name) < 0) {
            throw new Error(`${name} ne fait pas partit des events gérés par cette classe`);
        }
        if (this.__listeners[name] === undefined) {
            this.__listeners[name] = [];
        }
        for (const func of this.__listeners[name]) {
            if (typeof func === 'function' && func.toString() == fn.toString()) return;
        }
        if (args.length > 0) {
            this.__listeners[name].push({fn: fn, args: args});
        } else {
            this.__listeners[name].push(fn);
        }
        if (Base.debug) console.log('Base[%s] add Listener on event %s', this.constructor.name, name, this.__listeners[name]);
        return this;
    }
    /**
     * Permet d'ajouter un listener sur plusieurs types d'évenements
     * @param  {EventTypes[]} names -   Le type d'évenement
     * @param  {Function} fn -          La fonction à appeler
     * @param  {any[]} [args] -         Paramètres optionnels
     * @return {Base} L'instance du média
     * @sealed
     */
    public addListeners(names: EventTypes[], fn: Callback, ...args: any[]): this {
        try {
            for (const name of names) {
                this.addListener(name, fn, args);
            }
        } catch (err) {
            console.warn('Base.addListeners error', err);
        }
        return this;
    }
    /**
     * Permet de supprimer un listener sur un type d'évenement
     * @param  {string}   name - Le type d'évenement
     * @param  {Function} fn   - La fonction qui était appelée
     * @return {Base} L'instance du média
     * @sealed
     */
    public removeListener(name: EventTypes, fn: Callback): this {
        if (this.__listeners[name] !== undefined) {
            for (let l = 0; l < this.__listeners[name].length; l++) {
                if ((typeof this.__listeners[name][l] === 'function' && this.__listeners[name][l].toString() === fn.toString()) ||
                    this.__listeners[name][l].fn.toString() == fn.toString())
                {
                    this.__listeners[name].splice(l, 1);
                }
            }
        }
        return this;
    }
    /**
     * Appel les listeners pour un type d'évenement
     * @param  {EventTypes} name - Le type d'évenement
     * @return {Base} L'instance du média
     * @sealed
     */
    public _callListeners(name: EventTypes): this {
        // if (Base.debug) console.log('Base[%s] call Listeners of event %s', this.constructor.name, name, this.__listeners);
        if ((this.constructor as typeof Base).EventTypes.indexOf(name) >= 0 && this.__listeners[name].length > 0)
        {
            if (Base.debug) console.log('Base[%s] call %d Listeners on event %s', this.constructor.name, this.__listeners[name].length, name, this.__listeners);
            const event = new CustomEvent('betaseries', {detail: {name}});
            for (let l = 0; l < this.__listeners[name].length; l++) {
                if (typeof this.__listeners[name][l] === 'function') {
                    this.__listeners[name][l].call(this, event, this);
                } else {
                    const args: any[] = this.__listeners[name][l].args;
                    this.__listeners[name][l].fn.apply(this, [event, this].concat(args));
                }
            }
        }
        return this;
    }
    /**
     * Méthode d'initialisation de l'objet
     * @returns {Promise<Base>}
     */
    public init(): Promise<this> {
        if (this.elt) {
            this.comments = new CommentsBS(this.nbComments, this);
        }
        return new Promise(resolve => resolve(this));
    }
    /**
     * Sauvegarde l'objet en cache
     * @return {Base} L'instance du média
     */
    public save(): this {
        if (Base.cache instanceof CacheUS) {
            Base.cache.set(this.mediaType.plural as DataTypesCache, this.id, this);
            this._callListeners(EventTypes.SAVE);
        }
        return this;
    }
    /**
     * Retourne le DOMElement de référence du média
     * @returns {JQuery<HTMLElement>} Le DOMElement jQuery
     */
    get elt(): JQuery<HTMLElement> {
        return this.__elt;
    }
    /**
     * Définit le DOMElement de référence du média\
     * Nécessaire **uniquement** pour le média principal de la page Web\
     * Il sert à mettre à jour les données du média sur la page Web
     * @param  {JQuery<HTMLElement>} elt - DOMElement auquel est rattaché le média
     */
    set elt(elt: JQuery<HTMLElement>) {
        this.__elt = elt;
    }
    /**
     * Retourne le nombre d'acteurs référencés dans ce média
     * @returns {number}
     */
    get nbCharacters(): number {
        return this.characters.length;
    }
    /**
     * Décode le titre de la page
     * @return {Base} L'instance du média
     */
    decodeTitle(): Base {
        if (!this.elt) return this;

        let $elt = jQuery('.blockInformations__title', this.elt);
        if ((this.constructor as typeof Base).selectorsCSS.title) {
            $elt = jQuery((this.constructor as typeof Base).selectorsCSS.title);
        }
        const title = $elt.text();

        if (/&#/.test(title)) {
            $elt.text($('<textarea />').html(title).text());
        }
        return this;
    }
    /**
     * Ajoute le nombre de votes, à la note, dans l'attribut title de la balise
     * contenant la représentation de la note du média
     *
     * @param  {boolean} [change=true] - Indique si on doit changer l'attribut title du HTMLElement
     * @return {string} Le titre modifié de la note
     */
    changeTitleNote(change = true): string {
        const $elt = jQuery('.js-render-stars', this.elt);
        if (this.objNote.mean <= 0 || this.objNote.total <= 0) {
            if (change) $elt.attr('title', 'Aucun vote');
            return;
        }

        const title = this.objNote.toString();
        if (change) {
            $elt.attr('title', title);
        }
        return title;
    }
    /**
     * Ajoute le vote du membre connecté pour le média
     * @param   {number} note - Note du membre connecté pour le média
     * @returns {Promise<boolean>}
     */
    addVote(note: number): Promise<boolean> {
        const self = this;
        // return new Promise((resolve, reject) => {
        return Base.callApi(HTTP_VERBS.POST, this.mediaType.plural, 'note', {id: this.id, note: note})
            .then((data: Obj) => {
                self.fill(data[this.mediaType.singular]);
                return this.objNote.user == note;
            })
            .catch(err => {
                Base.notification('Erreur de vote', 'Une erreur s\'est produite lors de l\'envoi de la note: ' + err);
                return false;
            }) as Promise<boolean>;
        // });
    }
    /**
     * *fetchCharacters* - Récupère les acteurs du média
     * @abstract
     * @returns {Promise<this>}
     */
    fetchCharacters(): Promise<this> {
        throw new Error('Method abstract');
    }
    /**
     * *getCharacter* - Retourne un personnage à partir de son identifiant
     * @param   {number} id - Identifiant du personnage
     * @returns {Character | null}
     */
    getCharacter(id: number): Character | null {
        for (const actor of this.characters) {
            if (actor.id === id) return actor;
        }
        return null;
    }
}

/*
 * Date Format 1.2.3
 * (c) 2007-2009 Steven Levithan <stevenlevithan.com>
 * MIT license
 *
 * Includes enhancements by Scott Trenda <scott.trenda.net>
 * and Kris Kowal <cixar.com/~kris.kowal/>
 *
 * Accepts a date, a mask, or a date and a mask.
 * Returns a formatted version of the given date.
 * The date defaults to the current date/time.
 * The mask defaults to dateFormat.masks.default.
 */
const dateFormat = function () {
    const token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
          timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
          timezoneClip = /[^-+\dA-Z]/g,
          pad = (val, len = 2) => String(val).padStart(len, '0');
    // Some common format strings
    const masks = {
        "default":      "ddd dd mmm yyyy HH:MM:ss",
        datetime:       "dd/mm/yyyy HH:MM",
        shortDate:      "d/m/yy",
        mediumDate:     "d mmm yyyy",
        longDate:       "d mmmm yyyy",
        fullDate:       "dddd, d mmmm yyyy",
        shortTime:      "h:MM TT",
        mediumTime:     "h:MM:ss TT",
        longTime:       "h:MM:ss TT Z",
        isoDate:        "yyyy-mm-dd",
        isoTime:        "HH:MM:ss",
        isoDateTime:    "yyyy-mm-dd'T'HH:MM:ss",
        isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
    };

    // Internationalization strings
    const i18n = {
        dayNames: {
            abr: [ "Dim.", "Lun.", "Mar.", "Mer.", "Jeu.", "Ven.", "Sam." ],
            full: [ "Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"]
        },
        monthNames: {
            abr: [ "Jan.", "Fev.", "Mar.", "Avr.", "Mai", "Juin", "Juil.", "Août", "Sept.", "Oct.", "Nov.", "Dec." ],
            full: [
                "Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet",
                "Août", "Septembre", "Octobre", "Novembre", "Décembre"
            ]
        }
    };
    // Regexes and supporting functions are cached through closure
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return function (date: any, mask: string, utc: boolean) {
        // const dF = dateFormat;

        // You can't provide utc if you skip other args (use the "UTC:" mask prefix)
        if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
            mask = date;
            date = undefined;
        }

        // Passing date through Date applies Date.parse, if necessary
        date = date ? new Date(date) : new Date;
        if (isNaN(date)) throw TypeError("invalid date");

        mask = String(masks[mask] || mask || masks["default"]);

        // Allow setting the utc argument via the mask
        if (mask.slice(0, 4) == "UTC:") {
            mask = mask.slice(4);
            utc = true;
        }

        const    _ = utc ? "getUTC" : "get",
            d:number = date[_ + "Date"](),
            D:number = date[_ + "Day"](),
            m:number = date[_ + "Month"](),
            y:number = date[_ + "FullYear"](),
            H:number = date[_ + "Hours"](),
            M:number = date[_ + "Minutes"](),
            s:number = date[_ + "Seconds"](),
            L:number = date[_ + "Milliseconds"](),
            o:number = utc ? 0 : date.getTimezoneOffset(),
            flags = {
                d:    d,
                dd:   pad(d),
                ddd:  i18n.dayNames.abr[D],
                dddd: i18n.dayNames.full[D],
                m:    m + 1,
                mm:   pad(m + 1),
                mmm:  i18n.monthNames.abr[m],
                mmmm: i18n.monthNames.full[m],
                yy:   String(y).slice(2),
                yyyy: y,
                h:    H % 12 || 12,
                hh:   pad(H % 12 || 12),
                H:    H,
                HH:   pad(H),
                M:    M,
                MM:   pad(M),
                s:    s,
                ss:   pad(s),
                l:    pad(L, 3),
                L:    pad(L > 99 ? Math.round(L / 10) : L),
                t:    H < 12 ? "a"  : "p",
                tt:   H < 12 ? "am" : "pm",
                T:    H < 12 ? "A"  : "P",
                TT:   H < 12 ? "AM" : "PM",
                Z:    utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
                o:    (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4)
            };

        return mask.replace(token, function ($0) {
            return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
        });
    };
}();
const calculDuration = function() {
    const dayOfYear = (date: Date): number => {
        const ref = new Date(date.getFullYear(), 0, 0);
        return Math.floor((date.getTime() - ref.getTime()) / 86400000);
    };
    const i18n = {
        yesterday: 'Hier',
        dayBeforeYesterday: 'Avant-hier',
        longTime: 'Il y a longtemps',
        days: 'Il y a %days% jours',
        hours: 'Il y a %hours% heures',
        minutes: 'Il y a %minutes% minutes'
    };
    return function(date: Date): string {
        const now = new Date();
        const days = Math.round(dayOfYear(now) - dayOfYear(date));
        if (days > 0) {
            if (days === 1) {
                return i18n.yesterday;
            } else if (days === 2) {
                return i18n.dayBeforeYesterday;
            } else if (days > 30) {
                return i18n.longTime;
            }
            return i18n.days.replace('%days%', days.toString());
        } else {
            const minutes = Math.round((now.getTime() - date.getTime()) / 60000);
            const hours = Math.round((now.getTime() - date.getTime()) / 3600000);
            if (hours === 0 && minutes > 0) {
                return i18n.minutes.replace('%minutes%', minutes.toString());
            } else if (hours > 0) {
                return i18n.hours.replace('%hours%', hours.toString());
            }
        }
    };
}();
const upperFirst = function() {
    return function(word: string): string {
        return word.charAt(0).toUpperCase() + word.slice(1);
    }
}();
const camelCase = function() {
    return function(words: string): string {
        return words
            // eslint-disable-next-line no-useless-escape
            .replace(/[.,\/#!$%\^&\*;:][{}=\-_`~()]/g, '_')
            .replace(/[^a-zA-Z_]/g, '')
            .split('_')
            .reduce((result, word, index) => {
                return result + (index ? word.upperFirst() : word.toLowerCase());
            }, '');
    }
}();
declare global {
    interface Date {
        format: (mask: string, utc?: boolean) => string;
        duration: () => string;
    }
    interface String {
        upperFirst: () => string;
        camelCase: () => string;
    }
}
// For convenience...
Date.prototype.format = function (mask: string, utc = false) {
    return dateFormat(this, mask, utc);
};
Date.prototype.duration = function() {
    return calculDuration(this);
};
String.prototype.upperFirst = function() {
    return upperFirst(this);
};
String.prototype.camelCase = function() {
    return camelCase(this);
};