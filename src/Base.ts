declare var getScrollbarWidth, subscribeToggle;

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
        this.nbComments = parseInt(data.comments, 10);
        this.comments = [];
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
    public changeThumbsComment(commentId: number, thumbs: number, thumbed: number): boolean {
        for (let c = 0; c < this.comments.length; c++) {
            if (this.comments[c].id === commentId) {
                this.comments[c].thumbs = thumbs;
                this.comments[c].thumbed = thumbed;
                return true;
            }
        }
        return false;
    }

    public displayComments(): void {
        if (Base.debug) console.log('Base displayComments');
        // La popup et ses éléments
        const _this = this,
              $popup = jQuery('#popin-dialog'),
              $contentHtmlElement = $popup.find(".popin-content-html"),
              $contentReact = $popup.find('.popin-content-reactmodule'),
            //   $title = $contentHtmlElement.find(".title"),
            //   $text = $popup.find(".popin-content-ajax"),
              $closeButtons = $popup.find("#popin-showClose"),
              cleanEvents = () => {
                // On désactive les events
                $popup.find("#popin-showClose").off('click');
                $popup.find('.comments .comment .btnThumb').off('click');
                $popup.find('.btnToggleOptions').off('click');
                $contentReact.find('.view-spoiler').off('click');
                $popup.find('.sendComment').off('click');
                $popup.find('textarea').off('keypress');
                $popup.find('.baliseSpoiler').off('click');
                $contentReact.find('.comments .toggleReplies').off('click');
                $contentReact.find('.btnSubscribe').off('click');
              },
              hidePopup = () => {
                  document.body.style.overflow = "visible";
                  document.body.style.paddingRight = "";
                  $popup.attr('aria-hidden', 'true');
                  $popup.find("#popupalertyes").show();
                  $popup.find("#popupalertno").show();
                  $contentHtmlElement.hide();
                  $contentReact.empty();
                  cleanEvents();
                },
              showPopup = () => {
                  document.body.style.overflow = "hidden";
                  document.body.style.paddingRight = getScrollbarWidth() + "px";
                  $popup.find("#popupalertyes").hide();
                  $popup.find("#popupalertno").hide();
                  $contentHtmlElement.hide();
                  $contentReact.show();
                  $closeButtons.show();
                  $popup.attr('aria-hidden', 'false');
              };
        // On vérifie que la popup est masquée
        // hidePopup();
        $contentReact.empty().append(`<div class="title" id="dialog-title" tabindex="0">${Base.trans("blog.title.comments")}</div>`);
        const $title = $contentReact.find('.title');
        let templateLoader = `
            <div class="loaderCmt">
                <svg class="sr-only">
                    <defs>
                        <clipPath id="placeholder">
                            <path d="M50 25h160v8H50v-8zm0-18h420v8H50V7zM20 40C8.954 40 0 31.046 0 20S8.954 0 20 0s20 8.954 20 20-8.954 20-20 20z"></path>
                        </clipPath>
                    </defs>
                </svg>
        `;
        for (let l = 0; l < 4; l++) {
            templateLoader += `
                <div class="er_ex null"><div class="ComponentPlaceholder er_et " style="height: 40px;"></div></div>
            `;
        }
        templateLoader += '</div>';
        $contentReact.append(templateLoader);
        showPopup();

        let promise = Promise.resolve(this);

        if (Base.debug) console.log('Base ', {length: this.comments.length, nbComments: this.nbComments});
        if (this.comments.length <= 0 && this.nbComments > 0) {
            if (Base.debug) console.log('Base fetchComments call');
            promise = this.fetchComments() as Promise<this>;
        }
        let comment: CommentBS,
            template: string = `
                <div data-media-type="${this.mediaType.singular}"
                     data-media-id="${this.id}"
                     class="displayFlex flexDirectionColumn"
                     style="margin-top: 2px; min-height: 0">
                    <button type="button" class="btn-reset btnSubscribe" style="position: absolute; top: 3px; right: 31px; padding: 8px;">
                        <span class="svgContainer">
                            <svg fill="rgba(255, 255, 255, .5)" width="14" height="16" style="position: relative; top: 1px; left: -1px;">
                                <path fill-rule="nonzero" d="M13.176 13.284L3.162 2.987 1.046.812 0 1.854l2.306 2.298v.008c-.428.812-.659 1.772-.659 2.806v4.103L0 12.709v.821h11.307l1.647 1.641L14 14.13l-.824-.845zM6.588 16c.914 0 1.647-.73 1.647-1.641H4.941c0 .91.733 1.641 1.647 1.641zm4.941-6.006v-3.02c0-2.527-1.35-4.627-3.705-5.185V1.23C7.824.55 7.272 0 6.588 0c-.683 0-1.235.55-1.235 1.23v.559c-.124.024-.239.065-.346.098a2.994 2.994 0 0 0-.247.09h-.008c-.008 0-.008 0-.017.009-.19.073-.379.164-.56.254 0 0-.008 0-.008.008l7.362 7.746z"></path>
                            </svg>
                        </span>
                    </button>
                    <div class="comments overflowYScroll">`;
        promise.then(async () => {
            for (let c = 0; c < _this.comments.length; c++) {
                comment = this.comments[c];
                template += comment.getTemplateComment(comment, true);
                // Si le commentaires à des réponses et qu'elles ne sont pas chargées
                if (comment.nbReplies > 0 && comment.replies.length <= 0) {
                    // On récupère les réponses
                    comment.replies = await _this.fetchRepliesOfComment(comment.id);
                    // On ajoute un boutton pour afficher/masquer les réponses
                }
                for (let r = 0; r < comment.replies.length; r++) {
                    template += comment.replies[r].getTemplateComment(comment.replies[r], true);
                }
            }
            template += '</div>';
            // On définit le type d'affichage de la popup
            $popup.attr('data-popin-type', 'comments');
            // On affiche le titre de la popup
            // avec des boutons pour naviguer
            $contentReact.hide('fast', () => {
                $contentReact.find('.loaderCmt').remove();
                $contentReact.append(template + CommentBS.getTemplateWriting() + '</div>');
                $contentReact.fadeIn();
                // subscribeToggle($contentReact.find('.btnSubscribe').get(0), _this.mediaType.singular, _this.id);
                loadEvents();
            });
            function loadEvents() {
                // On ajoute les templates HTML du commentaire,
                // des réponses et du formulaire de d'écriture
                // On active le bouton de fermeture de la popup
                $closeButtons.click(() => {
                    hidePopup();
                    $popup.removeAttr('data-popin-type');
                });
                const $btnSubscribe = $contentReact.find('.btnSubscribe');
                $btnSubscribe.click((e: JQuery.ClickEvent) => {
                    e.stopPropagation();
                    e.preventDefault();
                    const $btn = $(e.currentTarget);
                    let params: Obj = {type: _this.mediaType.singular, id: _this.id};
                    if ($btn.hasClass('active')) {
                        Base.callApi(HTTP_VERBS.DELETE, 'comments', 'subscription', params)
                        .then((data: Obj) => {
                            $btn.removeClass('active');
                            $btn.attr('title', "Recevoir les commentaires par e-mail");
                            $btn.find('svg').replaceWith(`
                                <svg fill="rgba(255, 255, 255, .5)" width="14" height="16" style="position: relative; top: 1px; left: -1px;">
                                    <path fill-rule="nonzero" d="M13.176 13.284L3.162 2.987 1.046.812 0 1.854l2.306 2.298v.008c-.428.812-.659 1.772-.659 2.806v4.103L0 12.709v.821h11.307l1.647 1.641L14 14.13l-.824-.845zM6.588 16c.914 0 1.647-.73 1.647-1.641H4.941c0 .91.733 1.641 1.647 1.641zm4.941-6.006v-3.02c0-2.527-1.35-4.627-3.705-5.185V1.23C7.824.55 7.272 0 6.588 0c-.683 0-1.235.55-1.235 1.23v.559c-.124.024-.239.065-.346.098a2.994 2.994 0 0 0-.247.09h-.008c-.008 0-.008 0-.017.009-.19.073-.379.164-.56.254 0 0-.008 0-.008.008l7.362 7.746z"></path>
                                </svg>
                            `);
                        });
                    } else {
                        Base.callApi(HTTP_VERBS.POST, 'comments', 'subscription', params)
                        .then((data: Obj) => {
                            $btn.addClass('active');
                            $btn.attr('title', "Ne plus recevoir les commentaires par e-mail");
                            $btn.find('svg').replaceWith(`
                                <svg width="20" height="22" viewBox="0 0 20 22" style="width: 17px;">
                                    <g transform="translate(-4)" fill="none">
                                        <path d="M0 0h24v24h-24z"></path>
                                        <path fill="rgba(255, 255, 255, .5)" d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32v-.68c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68c-2.87.68-4.5 3.24-4.5 6.32v5l-2 2v1h16v-1l-2-2z"></path>
                                    </g>
                                </svg>
                            `);
                        });
                    }
                });
                // On active le lien pour afficher le spoiler
                const $btnSpoiler = $contentReact.find('.view-spoiler');
                if ($btnSpoiler.length > 0) {
                    $btnSpoiler.click((e:JQuery.ClickEvent) => {
                        e.stopPropagation();
                        e.preventDefault();
                        $(e.currentTarget).prev('span.comment-text').fadeIn();
                        $(e.currentTarget).fadeOut();
                    });
                }
                /**
                 * Ajoutons les events pour:
                 *  - btnUpVote: Voter pour ce commentaire
                 *  - btnDownVote: Voter contre ce commentaire
                 */
                $contentReact.find('.comments .comment .btnThumb').click((e: JQuery.ClickEvent) => {
                    e.stopPropagation();
                    e.preventDefault();
                    const $btn = jQuery(e.currentTarget);
                    const $comment = $btn.parents('.comment');
                    const commentId: number = parseInt($comment.data('commentId'), 10);
                    let comment: CommentBS;
                    // Si il s'agit d'une réponse, il nous faut le commentaire parent
                    if ($comment.hasClass('iv_i5') || $comment.hasClass('it_i3')) {
                        const $parent = $comment.siblings('.comment:not(.iv_i5)').first();
                        const parentId: number = parseInt($parent.data('commentId'), 10);
                        if (commentId == parentId) {
                            comment = this.getComment(commentId);
                        } else {
                            const cmtParent = this.getComment(parentId);
                            comment = cmtParent.getReply(commentId);
                        }
                    } else {
                        comment = this.getComment(commentId);
                    }
                    let verb = HTTP_VERBS.POST;
                    const vote: number = $btn.hasClass('btnUpVote') ? 1 : -1;
                    let params: Obj = {id: commentId, type: vote, switch: false};
                    // On a déjà voté
                    if (comment.thumbed == vote) {
                        verb = HTTP_VERBS.DELETE;
                        params = {id: commentId};
                    }
                    else if (comment.thumbed != 0) {
                        console.warn("Le vote est impossible. Annuler votre vote et recommencer");
                        return;
                    }
                    Base.callApi(verb, 'comments', 'thumb', params)
                    .then((data: Obj) => {
                        comment.thumbs = parseInt(data.comment.thumbs, 10);
                        comment.thumbed = data.comment.thumbed ? parseInt(data.comment.thumbed, 10) : 0;
                        comment.updateRenderThumbs(vote);
                    })
                    .catch(err => {
                        const msg = err.text !== undefined ? err.text : err;
                        Base.notification('Thumb commentaire', "Une erreur est apparue durant le vote: " + msg);
                    });
                });
                /**
                 * On affiche/masque les options du commentaire
                 */
                $contentReact.find('.btnToggleOptions').click((e: JQuery.ClickEvent) => {
                    e.stopPropagation();
                    e.preventDefault();
                    jQuery(e.currentTarget).parents('.iv_i3').first()
                        .find('.options-comment').each((_index: number, elt: HTMLElement) => {
                            const $elt = jQuery(elt);
                            if ($elt.is(':visible')) {
                                $elt.hide();
                            } else {
                                $elt.show();
                            }
                        }
                    );
                });
                /**
                 * On envoie la réponse à ce commentaire à l'API
                 */
                $contentReact.find('.sendComment').click((e: JQuery.ClickEvent) => {
                    e.stopPropagation();
                    e.preventDefault();
                    const $textarea = $(e.currentTarget).siblings('textarea');
                    if (($textarea.val() as string).length > 0) {
                        let comment: CommentBS;
                        if ($textarea.data('replyTo')) {
                            comment = _this.getComment(parseInt($textarea.data('replyTo'), 10));
                            comment.reply($textarea.val() as string);
                        } else {
                            CommentBS.sendComment(_this, $textarea.val() as string)
                            .then((comment: CommentBS) => {
                                if (comment) {
                                    $textarea.val('');
                                    $textarea.parents('.writing').siblings('.comments').append(comment.getTemplateComment(comment));
                                }
                            });
                        }
                    }
                });
                /**
                 * On active / desactive le bouton d'envoi du commentaire
                 * en fonction du contenu du textarea
                 */
                $contentReact.find('textarea').keypress((e: JQuery.KeyPressEvent) => {
                    const $textarea = $(e.currentTarget);
                    if (($textarea.val() as string).length > 0) {
                        $textarea.siblings('button').removeAttr('disabled');
                    } else {
                        $textarea.siblings('button').attr('disabled', 'true');
                    }
                });
                /**
                 * On ajoute les balises SPOILER au message dans le textarea
                 */
                $contentReact.find('.baliseSpoiler').click((e: JQuery.ClickEvent) => {
                    const $textarea = $popup.find('textarea');
                    if (/\[spoiler\]/.test($textarea.val() as string)) {
                        return;
                    }
                    const text = '[spoiler]' + $textarea.val() + '[/spoiler]';
                    $textarea.val(text);
                });
                $contentReact.find('.comments .toggleReplies').click((e: JQuery.ClickEvent) => {
                    e.stopPropagation();
                    e.preventDefault();
                    const $btn: JQuery<HTMLElement> = $(e.currentTarget);
                    const state = $btn.data('toggle'); // 0: Etat masqué, 1: Etat affiché
                    const $comment: JQuery<HTMLElement> = $btn.parents('.comment');
                    const inner: string = $comment.data('commentInner');
                    const $replies = $comment.parents('.comments').find(`.comment[data-comment-reply="${inner}"]`);
                    if (state == '0') {
                        // On affiche
                        $replies.fadeIn('fast');
                        $btn.find('.btnText').text(Base.trans("comment.hide_answers"));
                        $btn.find('svg').attr('style', 'transition: transform 200ms ease 0s; transform: rotate(180deg);');
                        $btn.data('toggle', '1');
                    } else {
                        // On masque
                        $replies.fadeOut('fast');
                        $btn.find('.btnText').text(Base.trans("comment.button.reply", {"%count%": $replies.length.toString()}));
                        $btn.find('svg').attr('style', 'transition: transform 200ms ease 0s;');
                        $btn.data('toggle', '0');
                    }
                });
                $contentReact.find('.btnResponse').click((e: JQuery.ClickEvent) => {
                    e.stopPropagation();
                    e.preventDefault();
                    const $btn: JQuery<HTMLElement> = $(e.currentTarget);
                    const $comment: JQuery<HTMLElement> = $btn.parents('.comment');
                    const commentId: number = parseInt($comment.data('commentId'), 10);
                    let comment: CommentBS;
                    // Si il s'agit d'une réponse, il nous faut le commentaire parent
                    if ($comment.hasClass('iv_i5') || $comment.hasClass('it_i3')) {
                        const $parent = $comment.siblings('.comment:not(.iv_i5)').first();
                        const parentId: number = parseInt($parent.data('commentId'), 10);
                        if (commentId == parentId) {
                            comment = this.getComment(commentId);
                        } else {
                            const cmtParent = this.getComment(parentId);
                            comment = cmtParent.getReply(commentId);
                        }
                    } else {
                        comment = this.getComment(commentId);
                    }
                    $contentReact.find('textarea')
                        .val('@' + comment.login)
                        .attr('data-reply-to', comment.id);
                });
            }
        });
    }
}