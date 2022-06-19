// declare const getScrollbarWidth, subscribeToggle;

import { DataTypesCache, CacheUS } from "./Cache";
import { Character } from "./Character";
import { CommentsBS } from "./Comments";
import { implAddNote, Note } from "./Note";
import { User } from "./User";

export function ExceptionIdentification(message: string) {
    this.message = message;
    this.name = "ExceptionIdentification";
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Class<T> = new (...args: any[]) => T;
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
    OPTIONS = 'OPTIONS'
}
export type Rating = {
    img: string;
    title: string;
};
export type Ratings = {
    [key: string]: Rating;
};
export type Obj = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
};
export type Callback = () => void;

export abstract class Base implements implAddNote {
    /*
                    STATIC
    */
    /**
     * Flag de debug pour le dev
     * @type {boolean}
     */
    static debug = false;
    /**
     * L'objet cache du script pour stocker les données
     * @type {CacheUS}
     */
    static cache: CacheUS = null;
    /**
     * Objet contenant les informations de l'API
     * @type {Obj}
     */
    static api: Obj = {
            "url": 'https://api.betaseries.com',
            "versions": {"current": '3.0', "last": '3.0'},
            "resources": [ // Les ressources disponibles dans l'API
                'badges', 'comments', 'episodes', 'friends', 'members', 'messages',
                'movies', 'news', 'oauth', 'pictures', 'planning', 'platforms',
                'polls', 'reports', 'search', 'seasons', 'shows', 'subtitles',
                'timeline'
            ],
            "check": { // Les endpoints qui nécessite de vérifier la volidité du token
                "episodes": ['display', 'list', 'search', 'watched'],
                "members" : ['notifications'],
                "movies"  : ['list', 'movie', 'search', 'similars'],
                "search"  : ['all', 'movies', 'shows'],
                "shows"   : ['display', 'episodes', 'list', 'member', 'search', 'similars']
            },
            "notDisplay": ['membersnotifications'],
            "tokenRequired": {
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
     * Le token d'authentification de l'API
     * @type {String}
     */
    static token: string = null;
    /**
     * La clé d'utilisation de l'API
     * @type {String}
     */
    static userKey: string = null;
    /**
     * L'identifiant du membre connecté
     * @type {Number}
     */
    static userId: number = null;
    /**
     * Clé pour l'API TheMovieDB
     * @type {string}
     */
    static themoviedb_api_user_key: string = null;
    /**
     * Le nombre d'appels à l'API
     * @type {Number}
     */
    static counter = 0;
    /**
     * L'URL de base du serveur contenant les ressources statiques
     * @type {String}
     */
    static serverBaseUrl = '';
    /**
     * L'URL de base du serveur servant pour l'authentification
     * @type {String}
     */
    static serverOauthUrl = '';
    /**
     * Indique le theme d'affichage du site Web (light or dark)
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
    static showLoader() {
        jQuery('#loader-bg').show();
    }
    static hideLoader() {
        jQuery('#loader-bg').hide();
    }
    /**
     * Fonction d'authentification sur l'API BetaSeries
     *
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
     * Fonction servant à appeler l'API de BetaSeries
     *
     * @param  {String}   type - Type de methode d'appel Ajax (GET, POST, PUT, DELETE)
     * @param  {String}   resource - La ressource de l'API (ex: shows, seasons, episodes...)
     * @param  {String}   action - L'action à appliquer sur la ressource (ex: search, list...)
     * @param  {Obj}      args - Un objet (clef, valeur) à transmettre dans la requête
     * @param  {bool}     [force=false] - Indique si on doit utiliser le cache ou non (Par défaut: false)
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
        Base.showLoader();
        let check = false;
        let display = true;

        // On vérifie si on doit afficher les infos de requêtes dans la console
        if (Base.api.notDisplay.indexOf(resource + action) >= 0) {
            display = false;
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
            console.log('Base.callApi', {
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

        // On check si on doit vérifier la validité du token
        // (https://www.betaseries.com/bugs/api/461)
        if (Base.userIdentified() && checkKeys.indexOf(resource) !== -1 &&
            Base.api.check[resource].indexOf(action) !== -1)
        {
            check = true;
        }

        function fetchUri(resolve, reject) {
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

            fetch(uri, initFetch).then(response => {
                Base.counter++; // Incrément du compteur de requêtes à l'API
                if (Base.debug && (display || response.status !== 200)) console.log('fetch (%s %s) response status: %d', type, uri, response.status);
                // On récupère les données et les transforme en objet
                response.json().then((data) => {
                    if (Base.debug && (display || response.status !== 200)) console.log('fetch (%s %s) data', type, uri, data);
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
                        console.error('Fetch erreur network', response);
                        reject(response);
                        Base.hideLoader();
                        return;
                    }
                    resolve(data);
                    Base.hideLoader();
                });
            }).catch(error => {
                if (Base.debug) console.log('Il y a eu un problème avec l\'opération fetch: ' + error.message);
                console.error(error);
                reject(error.message);
                Base.hideLoader();
            });
        }
        return new Promise((resolve, reject) => {
            if (check) {
                const paramsFetch: RequestInit = {
                    method: 'GET',
                    headers: myHeaders,
                    mode: 'cors',
                    cache: 'no-cache'
                };
                if (Base.debug && display) console.info('%ccall /members/is_active', 'color:#1d6fb2');
                fetch(`${Base.api.url}/members/is_active`, paramsFetch).then(resp => {
                    Base.counter++; // Incrément du compteur de requêtes à l'API
                    if ( ! resp.ok) {
                        // Appel de l'authentification pour obtenir un token valide
                        Base.authenticate().then(() => {
                            // On met à jour le token pour le prochain appel à l'API
                            myHeaders['X-BetaSeries-Token'] = Base.token;
                            fetchUri(resolve, reject);
                        }).catch(err => reject(err) );
                        return;
                    }
                    fetchUri(resolve, reject);
                }).catch(error => {
                    if (Base.debug) console.log('Il y a eu un problème avec l\'opération fetch: ' + error.message);
                    console.error(error);
                    reject(error.message);
                });
            } else {
                fetchUri(resolve, reject);
            }
        });
    }
    /**
     * setPropValue - Permet de modifier la valeur d'une propriété dans un objet,
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
     * replaceParams - Permet de remplacer des paramètres par des valeurs dans une chaîne de caractères
     * @param   {string} path - Chaine à modifier avec les valeurs
     * @param   {object} params - Objet contenant les paramètres autorisés et leur type
     * @param   {object} data - Objet contenant les valeurs des paramètres
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

    /*
                    PROPERTIES
    */
    description: string;
    characters: Array<Character>;
    comments: CommentsBS;
    nbComments: number;
    id: number;
    objNote: Note;
    resource_url: string;
    title: string;
    user: User;
    mediaType: MediaTypes;
    private _elt: JQuery;
    private _listeners: object;

    /*
                    METHODS
    */
    constructor(data: Obj) {
        if (!(data instanceof Object)) {
            throw new Error("data is not an object");
        }
        this._initListeners();
        return this;
    }
    /**
     * Remplit l'objet avec les données fournit en paramètre
     * @param  {Obj} data - Les données provenant de l'API
     * @returns {Base}
     * @virtual
     */
    fill(data: Obj): this {
        this.id = parseInt(data.id, 10);
        this.characters = [];
        if (data.characters && data.characters instanceof Array) {
            for (let c = 0; c < data.characters.length; c++) {
                this.characters.push(new Character(data.characters[c]));
            }
        }
        this.nbComments = data.comments ? parseInt(data.comments, 10) : 0;
        if (!(this.comments instanceof CommentsBS)) {
            this.comments = new CommentsBS(this.nbComments, this);
        }
        this.objNote = (data.note) ? new Note(data.note, this) : new Note(data.notes, this);
        this.resource_url = data.resource_url;
        this.title = data.title;
        this.user = new User(data.user);
        this.description = data.description;
        return this;
    }
    /**
     * Initialize le tableau des écouteurs d'évènements
     * @returns {Base}
     * @sealed
     */
    private _initListeners(): this {
        this._listeners = {};
        const EvtTypes = (this.constructor as typeof Base).EventTypes;
        for (let e = 0; e < EvtTypes.length; e++) {
            this._listeners[EvtTypes[e]] = [];
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
    public addListener(name: EventTypes, fn: Callback, ...args): this {
        //if (Base.debug) console.log('Base[%s] add Listener on event %s', this.constructor.name, name);
        // On vérifie que le type d'event est pris en charge
        if ((this.constructor as typeof Base).EventTypes.indexOf(name) < 0) {
            throw new Error(`${name} ne fait pas partit des events gérés par cette classe`);
        }
        if (this._listeners[name] === undefined) {
            this._listeners[name] = [];
        }
        for (const func in this._listeners[name]) {
            if (func.toString() == fn.toString()) return;
        }
        if (args.length > 0) {
            this._listeners[name].push({fn: fn, args: args});
        } else {
            this._listeners[name].push(fn);
        }
        if (Base.debug) console.log('Base[%s] add Listener on event %s', this.constructor.name, name, this._listeners[name]);
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
        if (this._listeners[name] !== undefined) {
            for (let l = 0; l < this._listeners[name].length; l++) {
                if ((typeof this._listeners[name][l] === 'function' && this._listeners[name][l].toString() === fn.toString()) ||
                    this._listeners[name][l].fn.toString() == fn.toString())
                {
                    this._listeners[name].splice(l, 1);
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
        if ((this.constructor as typeof Base).EventTypes.indexOf(name) >= 0 && this._listeners[name].length > 0) {
            if (Base.debug) console.log('Base[%s] call %d Listeners on event %s', this.constructor.name, this._listeners[name].length, name, this._listeners);
            const event = new CustomEvent('betaseries', {detail: {name: name}});
            for (let l = 0; l < this._listeners[name].length; l++) {
                if (typeof this._listeners[name][l] === 'function') {
                    this._listeners[name][l].call(this, event, this);
                } else {
                    this._listeners[name][l].fn.apply(this, this._listeners[name][l].args);
                }
            }
        }
        return this;
    }
    public init(): Promise<this> {
        return new Promise(resolve => resolve(this));
    }
    /**
     * Sauvegarde l'objet en cache
     * @return {Base} L'instance du média
     */
    public save(): this {
        if (Base.cache instanceof CacheUS) {
            Base.cache.set(this.mediaType.plural, this.id, this);
            this._callListeners(EventTypes.SAVE);
        }
        return this;
    }

    /**
     * Retourne le DOMElement correspondant au média
     * @returns {JQuery} Le DOMElement jQuery
     */
    get elt(): JQuery {
        return this._elt;
    }
    /**
     * Définit le DOMElement de référence pour ce média
     * @param  {JQuery} elt - DOMElement auquel est rattaché le média
     */
    set elt(elt: JQuery) {
        this._elt = elt;
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
        const $elt = this.elt.find('.blockInformations__title'),
              title = $elt.text();

        if (/&#/.test(title)) {
            $elt.text($('<textarea />').html(title).text());
        }
        return this;
    }
    /**
     * Ajoute le nombre de votes à la note dans l'attribut title de la balise
     * contenant la représentation de la note de la ressource
     *
     * @param  {Boolean} [change=true] - Indique si on doit changer l'attribut title du DOMElement
     * @return {String} Le titre modifié de la note
     */
    changeTitleNote(change = true): string {
        const $elt = this.elt.find('.js-render-stars');
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
     * Ajoute le nombre de votes à la note de la ressource
     * @return {Base} L'instance du média
     */
    addNumberVoters(): Base {
        const self = this;
        const votes = $('.stars.js-render-stars'); // ElementHTML ayant pour attribut le titre avec la note de la série

        let title = this.changeTitleNote(true);
        // if (Base.debug) console.log('addNumberVoters - title: %s', title);
        // On ajoute un observer sur l'attribut title de la note, en cas de changement lors d'un vote
        new MutationObserver((mutationsList) => {
            const changeTitleMutation = () => {
                // On met à jour le nombre de votants, ainsi que la note du membre connecté
                const upTitle = self.changeTitleNote(false);
                // if (Base.debug) console.log('Observer upTitle: %s', upTitle);
                // On évite une boucle infinie
                if (upTitle !== title) {
                    votes.attr('title', upTitle);
                    title = upTitle;
                }
            };
            let mutation: MutationRecord;
            for (mutation of mutationsList) {
                // On vérifie si le titre a été modifié
                // @TODO: A tester
                if (! /vote/.test(mutation.target.nodeValue) && mutation.target.nodeValue != title) {
                    changeTitleMutation();
                }
            }
        }).observe(votes.get(0), {
            attributes: true,
            childList: false,
            characterData: false,
            subtree: false,
            attributeFilter: ['title']
        });
        return this;
    }
    /**
     * Ajoute une note au média
     * @param   {number} note - Note du membre connecté pour le média
     * @returns {Promise<boolean>}
     */
    addVote(note: number): Promise<boolean> {
        const self = this;
        return new Promise((resolve, reject) => {
            Base.callApi(HTTP_VERBS.POST, this.mediaType.plural, 'note', {id: this.id, note: note})
            .then((data: Obj) => {
                self.fill(data[this.mediaType.singular])._callListeners(EventTypes.NOTE);
                resolve(true);
            })
            .catch(err => {
                Base.notification('Erreur de vote', 'Une erreur s\'est produite lors de l\'envoi de la note: ' + err);
                reject(err);
            })
        });
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
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
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