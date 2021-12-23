import {DataTypesCache, CacheUS} from "./Cache";
import {Character} from "./Character";
import {CommentBS, implRepliesComment} from "./Comment";
import {implAddNote, Note} from "./Note";
import {User} from "./User";

type Class<T> = new (...args: any[]) => T;
export interface MediaTypes {
    singular: MediaType;
    plural: string;
    className: Class<Base>;
}
export enum MediaType {
    show = 'show',
    movie = 'movie',
    episode = 'episode'
}
export enum EventTypes {
    UPDATE = 'update',
    SAVE = 'save',
    ADD = 'add',
    REMOVE = 'remove'
}
export enum HTTP_VERBS {
    GET = 'GET',
    POST = 'POST',
    PUT = 'PUT',
    DELETE = 'DELETE',
    OPTIONS = 'OPTIONS'
}
export interface Rating {
    img: string,
    title: string;
}
export interface Ratings {
    [key: string]: Rating;
}
export interface Obj {
    [key: string]: any;
}
export abstract class Base implements implRepliesComment, implAddNote {
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
     * @type {*}
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
     * @param   {String}  msg     Identifiant de la chaîne à traduire
     * @param   {*[]}     args    Autres paramètres
     * @returns {string}
     */
    // eslint-disable-next-line no-unused-vars
    static trans: Function = function(msg: string, ...args: any[]) {};
    /**
     * Contient les infos sur les différentes classification TV et cinéma
     * @type {Ratings}
     */
    static ratings: Ratings = null;
    /**
     * Types d'évenements gérés par cette classe
     * @type {Array}
     */
    static EventTypes: Array<EventTypes> = new Array(
        EventTypes.UPDATE,
        EventTypes.SAVE
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
                        src="${Base.serverBaseUrl}/index.html"
                        style="background:white;margin:auto;">
                </iframe>
                </div>'
            `);
        }
        return new Promise((resolve, reject) => {
            function receiveMessage(event) {
                const origin = new URL(Base.serverBaseUrl).origin;
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
     * @param  {String}   type              Type de methode d'appel Ajax (GET, POST, PUT, DELETE)
     * @param  {String}   resource          La ressource de l'API (ex: shows, seasons, episodes...)
     * @param  {String}   action            L'action à appliquer sur la ressource (ex: search, list...)
     * @param  {*}        args              Un objet (clef, valeur) à transmettre dans la requête
     * @param  {bool}     [force=false]     Indique si on doit utiliser le cache ou non (Par défaut: false)
     * @return {Promise<Obj>}
     */
    static callApi(type: string, resource: string, action: string, args: any, force: boolean = false): Promise<Obj> {
        if (Base.api && Base.api.resources.indexOf(resource) === -1) {
            throw new Error(`Ressource (${resource}) inconnue dans l'API.`);
        }
        if (! Base.token || ! Base.userKey) {
            throw new Error('Token and userKey are required');
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
    comments: Array<CommentBS>;
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
     * @param  {Obj} data Les données provenant de l'API
     * @returns this
     */
    fill(data: Obj): this {
        this.id = parseInt(data.id, 10);
        this.characters = [];
        if (data.characters && data.characters instanceof Array) {
            for (let c = 0; c < data.characters.length; c++) {
                this.characters.push(new Character(data.characters[c]));
            }
        }
        this.comments = [];
        if (data.comments && data.comments instanceof Array) {
            for (let c = 0; c < data.comments.length; c++) {
                this.comments.push(new CommentBS(data.comments[c], this));
            }
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
     * @returns this
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
     * @param  {string}   name Le type d'évenement
     * @param  {Function} fn   La fonction à appeler
     * @return {this}          L'instance du média
     */
    public addListener(name: EventTypes, fn: Function): this {
        // On vérifie que le type d'event est pris en charge
        if ((this.constructor as typeof Base).EventTypes.indexOf(name) < 0) {
            throw new Error(`${name} ne fait pas partit des events gérés par cette classe`);
        }
        if (this._listeners[name] === undefined) {
            this._listeners[name] = new Array();
        }
        this._listeners[name].push(fn);
        return this;
    }
    /**
     * Permet de supprimer un listener sur un type d'évenement
     * @param  {string}   name Le type d'évenement
     * @param  {Function} fn   La fonction qui était appelée
     * @return {Base}          L'instance du média
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
     * @param  {string} name Le type d'évenement
     * @return {Show}        L'instance Show
     */
    protected _callListeners(name: EventTypes): this {
        if (this._listeners[name] !== undefined) {
            for (let l = 0; l < this._listeners[name].length; l++) {
                this._listeners[name][l].call(this, this);
            }
        }
        return this;
    }
    /**
     * Sauvegarde l'objet en cache
     * @return this
     */
    save(): this {
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
     * @param  {JQuery} elt DOMElement auquel est rattaché le média
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
     * Retourne le nombre de commentaires pour ce média
     * @returns number
     */
    get nbComments(): number {
        return this.comments.length;
    }
    /**
     * Décode le titre de la page
     * @return {Base} This
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
     * @param  {Boolean} change  Indique si on doit changer l'attribut title du DOMElement
     * @return {String}         Le titre modifié de la note
     */
    changeTitleNote(change: boolean = true): string {
        const $elt = this.elt.find('.js-render-stars');
        if (this.objNote.mean <= 0 || this.objNote.total <= 0) {
            if (change) $elt.attr('title', 'Aucun vote');
            return;
        }

        const votes = 'vote' + (this.objNote.total > 1 ? 's' : ''),
                // On met en forme le nombre de votes
                total = new Intl.NumberFormat('fr-FR', {style: 'decimal', useGrouping: true})
                        .format(this.objNote.total),
                // On limite le nombre de chiffre après la virgule
                note = this.objNote.mean.toFixed(1);
        let title = `${total} ${votes} : ${note} / 5`;
        // On ajoute la note du membre connecté, si il a voté
        if (Base.userIdentified() && this.objNote.user > 0) {
            title += `, votre note: ${this.objNote.user}`;
        }
        if (change) {
            $elt.attr('title', title);
        }
        return title;
    }
    /**
     * Ajoute le nombre de votes à la note de la ressource
     * @return {Base}
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
     * @param   {number} note Note du membre connecté pour le média
     * @returns {Promise<boolean>}
     */
    addVote(note: number): Promise<boolean> {
        const _this = this;
        return new Promise((resolve: Function, reject:Function) => {
            Base.callApi(HTTP_VERBS.POST, this.mediaType.plural, 'note', {id: this.id, note: note})
            .then((data: Obj) => {
                _this.fill(data[this.mediaType.singular]);
                resolve(true);
            })
            .catch(err => {
                Base.notification('Erreur de vote', 'Une erreur s\'est produite lors de l\'envoi de la note: ' + err);
                reject(err);
            })
        });
    }
    /**
     * Récupère les commentaires du média sur l'API
     * @returns {Promise<Base>}
     */
    public fetchComments(nbpp: number = 50, since: number = 0): Promise<Base> {
        const _this = this;
        return new Promise((resolve: Function, reject: Function) => {
            let params: Obj = {
                type: _this.mediaType.singular, 
                id: _this.id, 
                nbpp: nbpp, 
                replies: 0, 
                order: 'desc'
            };
            if (since > 0) {
                params.since_id = since;
            }
            Base.callApi(HTTP_VERBS.GET, 'comments', 'comments', params)
            .then((data: Obj) => {
                if (data.comments !== undefined) {
                    if (since <= 0) {
                        _this.comments = new Array();
                    } else {
                        // On modifie le flag de fin, vu qu'on rajoute des commentaires
                        this.comments[this.comments.length - 1].last = false;
                    }
                    for (let c = 0; c < data.comments.length; c++) {
                        data.comments[c].first = data.comments[c].last = false;
                        if (c === 0 && since <= 0) data.comments[c].first = true;
                        if (c === data.comments.length - 1) data.comments[c].last = true;
                        _this.comments.push(new CommentBS(data.comments[c], this));
                    }
                }
                resolve(_this);
            })
            .catch(err => {
                console.warn('fetchComments', err);
                Base.notification('Récupération des commentaires', "Une erreur est apparue durant la récupération des commentaires");
                reject(err);
            });
        });
    }
    /**
     * Retourne le commentaire correspondant à l'ID fournit en paramètre
     * @param   {number} cId L'identifiant du commentaire
     * @returns {CommentBS|null}
     */
    public getComment(cId: number): CommentBS {
        for (let c = 0; c < this.comments.length; c++) {
            if (this.comments[c].id === cId) {
                return this.comments[c];
            }
        }
        return null;
    }
    /**
     * Retourne le commentaire précédent celui fournit en paramètre
     * @param   {number} cId L'identifiant du commentaire
     * @returns {CommentBS|null}
     */
    public getPrevComment(cId: number): CommentBS {
        for (let c = 0; c < this.comments.length; c++) {
            if (this.comments[c].id === cId && c > 0) {
                return this.comments[c - 1];
            }
        }
        return null;
    }
    /**
     * Retourne le commentaire suivant celui fournit en paramètre
     * @param   {number} cId L'identifiant du commentaire
     * @returns {CommentBS|null}
     */
    public getNextComment(cId: number): CommentBS {
        const len = this.comments.length;
        for (let c = 0; c < this.comments.length; c++) {
            // TODO: Vérifier que tous les commentaires ont été récupérer
            if (this.comments[c].id === cId && c < len - 1) {
                return this.comments[c + 1];
            }
        }
        return null;
    }
    /**
     * Retourne les réponses d'un commentaire
     * @param   {number} commentId Identifiant du commentaire original
     * @returns {Array<CommentBS>}    Tableau des réponses
     */
    public async fetchRepliesOfComment(commentId: number): Promise<Array<CommentBS>> {
        const data = await Base.callApi(HTTP_VERBS.GET, 'comments', 'replies', { id: commentId, order: 'desc' });
        const replies = new Array();
        if (data.comments) {
            for (let c = 0; c < data.comments.length; c++) {
                replies.push(new CommentBS(data.comments[c], this));
            }
        }
        return replies;
    }
    /**
     * Modifie le nombre de votes pour un commentaire
     * @param   {number} commentId Identifiant du commentaire
     * @param   {number} thumbs    Nombre de votes
     * @returns {boolean}
     */
    public changeThumbsComment(commentId: number, thumbs: number): boolean {
        for (let c = 0; c < this.comments.length; c++) {
            if (this.comments[c].id === commentId) {
                this.comments[c].thumbs = thumbs;
                return true;
            }
        }
        return false;
    }
}