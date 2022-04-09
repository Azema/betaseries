declare var getScrollbarWidth, subscribeToggle;

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
export enum MediaType {
    show = 'show',
    movie = 'movie',
    episode = 'episode'
};
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
};
export enum HTTP_VERBS {
    GET = 'GET',
    POST = 'POST',
    PUT = 'PUT',
    DELETE = 'DELETE',
    OPTIONS = 'OPTIONS'
};
export type Rating = {
    img: string;
    title: string;
};
export type Ratings = {
    [key: string]: Rating;
};
export type GM_funcs = {
    [key: string]: Function;
};
export type Obj = {
    [key: string]: any;
};
export abstract class Base implements implAddNote {
    /*
                    STATIC
    */
    /**
     * Flag de debug pour le dev
     * @type {boolean}
     */
    static debug: boolean = false;
    /**
     * L'objet cache du script pour stocker les données
     * @type {CacheUS}
     */
    static cache: CacheUS = null;
    /**
     * Objet contenant les informations de l'API
     * @type {Obj}
     */
    static api: any = {
            "url": 'https://api.betaseries.com',
            "versions": {"current": '3.0', "last": '3.0'},
            "resources": [ // Les ressources disponibles dans l'API
                'badges', 'comments', 'episodes', 'friends', 'members', 'messages',
                'movies', 'news', 'oauth', 'pictures', 'planning', 'platforms',
                'polls', 'reports', 'search', 'seasons', 'shows', 'subtitles',
                'timeline'
            ],
            "check": { // Les endpoints qui nécessite de vérifier la volidité du token
                "episodes": ['display', 'list', 'search'],
                "movies"  : ['list', 'movie', 'search', 'similars'],
                "search"  : ['all', 'movies', 'shows'],
                "shows"   : ['display', 'episodes', 'list', 'search', 'similars']
            },
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
    static counter: number = 0;
    /**
     * L'URL de base du serveur contenant les ressources statiques
     * @type {String}
     */
    static serverBaseUrl: string = '';
    /**
     * L'URL de base du serveur servant pour l'authentification
     * @type {String}
     */
    static serverOauthUrl: string = '';
    /**
     * Indique le theme d'affichage du site Web (light or dark)
     * @type {string}
     */
    static theme: string = 'light';
    /**
     * Fonction de notification sur la page Web
     * @type {Function}
     */
    static notification: Function = function() {};
    /**
     * Fonction pour vérifier que le membre est connecté
     * @type {Function}
     */
    static userIdentified: Function = function() {};
    /**
     * Fonction vide
     * @type {Function}
     */
    static noop: Function = function() {};
    /**
     * Fonction de traduction de chaînes de caractères
     * @param   {String}  msg  - Identifiant de la chaîne à traduire
     * @param   {Obj}     [params={}] - Variables utilisées dans la traduction {"%key%"": value}
     * @param   {number}  [count=1] - Nombre d'éléments pour la version plural
     * @returns {string}
     */
    // eslint-disable-next-line no-unused-vars
    static trans: Function = function(msg: string, params: Obj = {}, count: number = 1) {};
    /**
     * Contient les infos sur les différentes classification TV et cinéma
     * @type {Ratings}
     */
    static ratings: Ratings = null;
    static gm_funcs: GM_funcs = {
        getValue: this.noop,
        setValue: this.noop
    };
    /**
     * Types d'évenements gérés par cette classe
     * @type {Array}
     */
    static EventTypes: Array<EventTypes> = new Array(
        EventTypes.UPDATE,
        EventTypes.SAVE,
        EventTypes.NOTE
    );
    /**
     * Fonction d'authentification sur l'API BetaSeries
     *
     * @return {Promise}
     */
    static authenticate(): Promise<any> {
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
    static callApi(type: string, resource: string, action: string, args: any, force: boolean = false): Promise<Obj> {
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
        let check = false,
            // Les en-têtes pour l'API
            myHeaders = {
                'Accept'                : 'application/json',
                'X-BetaSeries-Version'  : Base.api.versions.current,
                'X-BetaSeries-Token'    : Base.token,
                'X-BetaSeries-Key'      : Base.userKey
            },
            checkKeys = Object.keys(Base.api.check);

        if (Base.debug) {
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
            });
        }

        // On check si on doit vérifier la validité du token
        // (https://www.betaseries.com/bugs/api/461)
        if (Base.userIdentified() && checkKeys.indexOf(resource) !== -1 &&
            Base.api.check[resource].indexOf(action) !== -1)
        {
            check = true;
        }

        function fetchUri(resolve: Function, reject: Function) {
            let initFetch: RequestInit = { // objet qui contient les paramètres de la requête
                method: type,
                headers: myHeaders,
                mode: 'cors',
                cache: 'no-cache'
            };
            let uri = `${Base.api.url}/${resource}/${action}`;
            const keys = Object.keys(args);
            // On crée l'URL de la requête de type GET avec les paramètres
            if (type === 'GET' && keys.length > 0) {
                let params = [];
                for (let key of keys) {
                    params.push(key + '=' + encodeURIComponent(args[key]));
                }
                uri += '?' + params.join('&');
            } else if (keys.length > 0) {
                initFetch.body = new URLSearchParams(args);
            }

            fetch(uri, initFetch).then(response => {
                Base.counter++; // Incrément du compteur de requêtes à l'API
                if (Base.debug) console.log('fetch (%s %s) response status: %d', type, uri, response.status);
                // On récupère les données et les transforme en objet
                response.json().then((data) => {
                    if (Base.debug) console.log('fetch (%s %s) data', type, uri, data);
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
                        return;
                    }
                    // On gère les erreurs réseau
                    if (!response.ok) {
                        console.error('Fetch erreur network', response);
                        reject(response);
                        return;
                    }
                    resolve(data);
                });
            }).catch(error => {
                if (Base.debug) console.log('Il y a eu un problème avec l\'opération fetch: ' + error.message);
                console.error(error);
                reject(error.message);
            });
        }
        return new Promise((resolve: Function, reject: Function) => {
            if (check) {
                let paramsFetch: RequestInit = {
                    method: 'GET',
                    headers: myHeaders,
                    mode: 'cors',
                    cache: 'no-cache'
                };
                if (Base.debug) console.info('%ccall /members/is_active', 'color:blue');
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
            this._listeners[EvtTypes[e]] = new Array();
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
    public addListener(name: EventTypes, fn: Function, ...args): this {
        //if (Base.debug) console.log('Base[%s] add Listener on event %s', this.constructor.name, name);
        // On vérifie que le type d'event est pris en charge
        if ((this.constructor as typeof Base).EventTypes.indexOf(name) < 0) {
            throw new Error(`${name} ne fait pas partit des events gérés par cette classe`);
        }
        if (this._listeners[name] === undefined) {
            this._listeners[name] = new Array();
        }
        for (let func in this._listeners[name]) {
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
    public removeListener(name: EventTypes, fn: Function): this {
        if (this._listeners[name] !== undefined) {
            for (let l = 0; l < this._listeners[name].length; l++) {
                if (this._listeners[name][l] === fn)
                    this._listeners[name].splice(l, 1);
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
    public init(): this {
        return this;
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
        let $elt = this.elt.find('.blockInformations__title'),
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
    changeTitleNote(change: boolean = true): string {
        const $elt = this.elt.find('.js-render-stars');
        if (this.objNote.mean <= 0 || this.objNote.total <= 0) {
            if (change) $elt.attr('title', 'Aucun vote');
            return;
        }

        let title = this.objNote.toString();
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
        const _this = this;
        const votes = $('.stars.js-render-stars'); // ElementHTML ayant pour attribut le titre avec la note de la série

        let title = this.changeTitleNote(true);
        // if (Base.debug) console.log('addNumberVoters - title: %s', title);
        // On ajoute un observer sur l'attribut title de la note, en cas de changement lors d'un vote
        new MutationObserver((mutationsList) => {
            const changeTitleMutation = () => {
                // On met à jour le nombre de votants, ainsi que la note du membre connecté
                const upTitle = _this.changeTitleNote(false);
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
        const _this = this;
        return new Promise((resolve: Function, reject:Function) => {
            Base.callApi(HTTP_VERBS.POST, this.mediaType.plural, 'note', {id: this.id, note: note})
            .then((data: Obj) => {
                _this.fill(data[this.mediaType.singular])._callListeners(EventTypes.NOTE);
                resolve(true);
            })
            .catch(err => {
                Base.notification('Erreur de vote', 'Une erreur s\'est produite lors de l\'envoi de la note: ' + err);
                reject(err);
            })
        });
    }
}