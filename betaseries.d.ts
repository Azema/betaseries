/// <reference types="jquery" />
declare module 'Cache' {
	 type ObjHome = {
	    [key in DataTypesCache]: any;
	};
	export enum DataTypesCache {
	    shows = "shows",
	    episodes = "episodes",
	    movies = "movies",
	    members = "members",
	    updates = "updateAuto"
	}
	/**
	 * @class Gestion du Cache pour le script
	 */
	export class CacheUS {
	    protected _data: ObjHome;
	    constructor();
	    /**
	     * Initialize le cache pour chaque type
	     * @returns this
	     */
	    private _init;
	    /**
	     * Returns an Array of all currently set keys.
	     * @returns {Array} cache keys
	     */
	    keys(type?: any): Array<any>;
	    /**
	     * Checks if a key is currently set in the cache.
	     * @param {DataTypesCache}  type Le type de ressource
	     * @param {String|number}   key  the key to look for
	     * @returns {boolean} true if set, false otherwise
	     */
	    has(type: DataTypesCache, key: string | number): boolean;
	    /**
	     * Clears all cache entries.
	     * @param   {DataTypesCache} [type=null] Le type de ressource à nettoyer
	     * @returns this
	     */
	    clear(type?: DataTypesCache): this;
	    /**
	     * Gets the cache entry for the given key.
	     * @param {DataTypesCache}  type Le type de ressource
	     * @param {String|number}   key  the cache key
	     * @returns {*} the cache entry if set, or undefined otherwise
	     */
	    get(type: DataTypesCache, key: string | number): any;
	    /**
	     * Returns the cache entry if set, or a default value otherwise.
	     * @param {DataTypesCache}  type Le type de ressource
	     * @param {String|number}   key  the key to retrieve
	     * @param {*}               def  the default value to return if unset
	     * @returns {*} the cache entry if set, or the default value provided.
	     */
	    getOrDefault(type: DataTypesCache, key: string | number, def: any): any;
	    /**
	     * Sets a cache entry with the provided key and value.
	     * @param {DataTypesCache}  type  Le type de ressource
	     * @param {String|number}   key   the key to set
	     * @param {*}               value the value to set
	     * @returns this
	     */
	    set(type: string, key: string | number, value: any): this;
	    /**
	     * Removes the cache entry for the given key.
	     * @param {DataTypesCache}  type  Le type de ressource
	     * @param {String|number}   key the key to remove
	     * @returns this
	     */
	    remove(type: DataTypesCache, key: string | number): this;
	}
	export {};

}
declare module 'Character' {
	import { Obj } from 'Base';
	export class Character {
	    /**
	     * @type {string} Nom de l'acteur/actrice
	     */
	    actor: string;
	    /**
	     * @type {string} Description du rôle
	     */
	    description: string;
	    /**
	     * @type {boolean} Invité ?
	     */
	    guest: boolean;
	    /**
	     * @type {number} Identifiant de l'acteur
	     */
	    id: number;
	    /**
	     * @type {string} Nom du personnage
	     */
	    name: string;
	    /**
	     * @type {string} URL de l'image du personnage
	     */
	    picture: string;
	    /**
	     * @type {string} Type de rôle du personnage dans le média
	     */
	    role: string;
	    /**
	     * @type {number} Identifiant de la série
	     */
	    show_id: number;
	    /**
	     * @type {number} Identifiant du film
	     */
	    movie_id: number;
	    constructor(data: Obj);
	}

}
declare module 'Note' {
	/// <reference types="jquery" />
	import { Base, Obj, Callback } from 'Base';
	export interface implAddNote {
	    addVote(note: number): Promise<boolean>;
	}
	export class Note {
	    /**
	     * Nombre de votes
	     * @type {number}
	     */
	    total: number;
	    /**
	     * Note moyenne du média
	     * @type {number}
	     */
	    mean: number;
	    /**
	     * Note du membre connecté
	     * @type {number}
	     */
	    user: number;
	    /**
	     * Media de référence
	     * @type {Base}
	     */
	    _parent: Base;
	    constructor(data: Obj, parent: Base);
	    /**
	     * Retourne la note moyenne sous forme de pourcentage
	     * @returns {number} La note sous forme de pourcentage
	     */
	    getPercentage(): number;
	    /**
	     * Retourne l'objet Note sous forme de chaine
	     * @returns {string}
	     */
	    toString(): string;
	    /**
	     * Crée une popup avec 5 étoiles pour noter le média
	     */
	    createPopupForVote(cb?: Callback): void;
	    /**
	     * Retourne le type d'étoile en fonction de la note et de l'indice
	     * de comparaison
	     * @param  {number} note   La note du media
	     * @param  {number} indice L'indice de comparaison
	     * @return {string}        Le type d'étoile
	     */
	    static getTypeSvg(note: number, indice: number): string;
	    /**
	     * Met à jour l'affichage de la note
	     */
	    updateStars(elt?: JQuery<HTMLElement>): void;
	    /**
	     * Retourne la template pour l'affichage d'une note sous forme d'étoiles
	     * @param   {number} [note=0] - La note à afficher
	     * @param   {string} [color] - La couleur des étoiles
	     * @returns {string}
	     */
	    static renderStars(note?: number, color?: string): string;
	}

}
declare module 'Comment' {
	/// <reference types="jquery" />
	import { Obj, EventTypes } from 'Base';
	import { CommentsBS, OrderComments } from 'Comments';
	export interface implRepliesComment {
	    fetchReplies(commentId: number): Promise<Array<CommentBS>>;
	    changeThumbs(commentId: number, thumbs: number, thumbed: number): boolean;
	}
	export type implReplyUser = {
	    id: number;
	    login: string;
	};
	export class CommentBS {
	    /*************************************************/
	    /*************************************************/
	    /**
	     * Types d'évenements gérés par cette classe
	     * @type {Array}
	     */
	    static EventTypes: Array<string>;
	    /**
	     * Contient le nom des classes CSS utilisées pour le rendu du commentaire
	     * @type Obj
	     */
	    static classNamesCSS: Obj;
	    /*************************************************/
	    /*************************************************/
	    id: number;
	    /**
	     * Référence du média, pour créer l'URL (type.titleUrl)
	     */
	    reference: string;
	    /**
	     * Type de média
	     */
	    type: string;
	    /**
	     * Identifiant du média
	     */
	    ref_id: number;
	    /**
	     * Identifiant du membre du commentaire
	     */
	    user_id: number;
	    /**
	     * Login du membre du commentaire
	     */
	    login: string;
	    /**
	     * URL de l'avatar du membre du commentaire
	     */
	    avatar: string;
	    /**
	     * Date de création du commentaire
	     */
	    date: Date;
	    /**
	     * Contenu du commentaire
	     */
	    text: string;
	    /**
	     * Index du commentaire dans la liste des commentaires du média
	     */
	    inner_id: number;
	    /**
	     * Index du commentaire dont celui-ci est une réponse
	     */
	    in_reply_to: number;
	    /**
	     * Identifiant du commentaire dont celui-ci est une réponse
	     */
	    in_reply_id: number;
	    /**
	     * Informations sur le membre du commentaire original
	     */
	    in_reply_user: implReplyUser;
	    /**
	     * Note du membre pour le média
	     */
	    user_note: number;
	    /**
	     * Votes pour ce commentaire
	     */
	    thumbs: number;
	    /**
	     * Vote du membre connecté
	     */
	    thumbed: number;
	    /**
	     * Nombre de réponse à ce commentaires
	     */
	    nbReplies: number;
	    /**
	     * Les réponses au commentaire
	     * @type {Array<CommentBS>}
	     */
	    replies: Array<CommentBS>;
	    /**
	     * Message de l'administration
	     */
	    from_admin: boolean;
	    /**
	     * ???
	     */
	    user_rank: string;
	    /**
	     * @type {CommentsBS} La collection de commentaires
	     */
	    private _parent;
	    /**
	     * @type {Array<CustomEvent>} Liste des events déclarés par la fonction loadEvents
	     */
	    private _events;
	    /**
	     * @type {object} Objet contenant les fonctions à l'écoute des changements
	     * @private
	     */
	    private _listeners;
	    constructor(data: any, parent: CommentsBS | CommentBS);
	    /**
	     * Remplit l'objet CommentBS avec les données provenant de l'API
	     * @param   {Obj} data - Les données provenant de l'API
	     * @returns {CommentBS}
	     */
	    fill(data: Obj): CommentBS;
	    /**
	     * Initialize le tableau des écouteurs d'évènements
	     * @returns {Base}
	     * @private
	     */
	    private _initListeners;
	    /**
	     * Permet d'ajouter un listener sur un type d'évenement
	     * @param  {EventTypes} name - Le type d'évenement
	     * @param  {Function}   fn   - La fonction à appeler
	     * @return {Base} L'instance du média
	     */
	    addListener(name: EventTypes, fn: Function, ...args: any[]): this;
	    /**
	     * Permet de supprimer un listener sur un type d'évenement
	     * @param  {string}   name - Le type d'évenement
	     * @param  {Function} fn   - La fonction qui était appelée
	     * @return {Base} L'instance du média
	     */
	    removeListener(name: EventTypes, fn: Function): this;
	    /**
	     * Appel les listeners pour un type d'évenement
	     * @param  {EventTypes} name - Le type d'évenement
	     * @return {Base} L'instance du média
	     */
	    protected _callListeners(name: EventTypes): this;
	    /**
	     * Récupère les réponses du commentaire
	     * @param   {OrderComments} order - Ordre de tri des réponses
	     * @returns {Promise<CommentBS>}
	     */
	    fetchReplies(order?: OrderComments): Promise<CommentBS>;
	    /**
	     * Modifie le texte du commentaire
	     * @param   {string} msg - Le nouveau message du commentaire
	     * @returns {CommentBS}
	     */
	    edit(msg: string): Promise<CommentBS>;
	    /**
	     * Supprime le commentaire sur l'API
	     * @returns
	     */
	    delete(): void;
	    /**
	     * Indique si le commentaire est le premier de la liste
	     * @returns {boolean}
	     */
	    isFirst(): boolean;
	    /**
	     * Indique si le commentaire est le dernier de la liste
	     * @returns {boolean}
	     */
	    isLast(): boolean;
	    /**
	     * Renvoie la template HTML pour l'affichage d'un commentaire
	     * @param   {CommentBS} comment Le commentaire à afficher
	     * @returns {string}
	     */
	    static getTemplateComment(comment: CommentBS): string;
	    /**
	     * Renvoie la template HTML pour l'écriture d'un commentaire
	     * @param   {CommentBS} [comment?] - L'objet commentaire sur lequel envoyé les réponses
	     * @returns {string}
	     */
	    static getTemplateWriting(comment?: CommentBS): string;
	    /**
	     * Renvoie la template HTML pour l'écriture d'un signalement de commentaire
	     * @param   {CommentBS} [comment] - L'objet commentaire à signaler
	     * @returns {string}
	     */
	    static getTemplateReport(comment: CommentBS): string;
	    getLogins(): Array<string>;
	    /**
	     * Met à jour le rendu des votes de ce commentaire
	     * @param   {number} vote Le vote
	     * @returns {void}
	     */
	    updateRenderThumbs(vote?: number): void;
	    /**
	     * Indique si le comment fournit en paramètre fait parti des réponses
	     * @param   {number} commentId L'identifiant de la réponse
	     * @returns {boolean}
	     */
	    isReply(commentId: number): Promise<boolean>;
	    /**
	     * Retourne la réponse correspondant à l'identifiant fournit
	     * @param   {number} commentId L'identifiant de la réponse
	     * @returns {CommentBS | void} La réponse
	     */
	    getReply(commentId: number): Promise<CommentBS>;
	    /**
	     * Supprime une réponse
	     * @param   {number} cmtId - L'identifiant de la réponse
	     * @returns {boolean}
	     */
	    removeReply(cmtId: number): boolean;
	    /**
	     * Retourne l'objet CommentsBS
	     * @returns {CommentsBS}
	     */
	    getCollectionComments(): CommentsBS;
	    /**
	     * Ajoute les évènements sur les commentaires lors du rendu
	     * @param   {JQuery<HTMLElement>} $container - Le conteneur des éléments d'affichage
	     * @param   {Obj} funcPopup - Objet des fonctions d'affichage/ de masquage de la popup
	     * @returns {void}
	     */
	    protected loadEvents($container: JQuery<HTMLElement>, funcPopup: Obj): void;
	    /**
	     * Nettoie les events créer par la fonction loadEvents
	     * @param   {Function} onComplete - Fonction de callback
	     * @returns {void}
	     */
	    protected cleanEvents(onComplete?: Function): void;
	    /**
	     * Affiche le commentaire dans une dialogbox
	     */
	    render(): Promise<void>;
	    /**
	     * Envoie une réponse de ce commentaire à l'API
	     * @param   {string} text        Le texte de la réponse
	     * @returns {Promise<void | CommentBS>}
	     */
	    sendReply(text: string): Promise<void | CommentBS>;
	}

}
declare module 'Comments' {
	/// <reference types="jquery" />
	import { Base, Obj, EventTypes, Callback } from 'Base';
	import { CommentBS, implRepliesComment } from 'Comment';
	export enum OrderComments {
	    DESC = "desc",
	    ASC = "asc"
	}
	export enum MediaStatusComments {
	    OPEN = "open",
	    CLOSED = "close"
	}
	export type CustomEvent = {
	    elt: JQuery<HTMLElement>;
	    event: string;
	};
	export class CommentsBS implements implRepliesComment {
	    /*************************************************/
	    /*************************************************/
	    /**
	     * Types d'évenements gérés par cette classe
	     * @type {Array}
	     */
	    static EventTypes: Array<string>;
	    /**
	     * Envoie une réponse de ce commentaire à l'API
	     * @param   {Base} media - Le média correspondant à la collection
	     * @param   {string} text - Le texte de la réponse
	     * @returns {Promise<void | CommentBS>}
	     */
	    static sendComment(media: Base, text: string): Promise<void | CommentBS>;
	    /*************************************************/
	    /*************************************************/
	    /**
	     * @type {Array<CommentBS>} Tableau des commentaires
	     */
	    comments: Array<CommentBS>;
	    /**
	     * @type {number} Nombre total de commentaires du média
	     */
	    nbComments: number;
	    /**
	     * @type {boolean} Indique si le membre à souscrit aux alertes commentaires du média
	     */
	    is_subscribed: boolean;
	    /**
	     * @type {string} Indique si les commentaires sont ouverts ou fermés
	     */
	    status: string;
	    /**
	     * @type {Base} Le média auquel sont associés les commentaires
	     * @private
	     */
	    private _parent;
	    /**
	     * @type {Array<CustomEvent>} Tableau des events déclarés par la fonction loadEvents
	     * @private
	     */
	    private _events;
	    /**
	     * @type {object} Objet contenant les fonctions à l'écoute des changements
	     * @private
	     */
	    private _listeners;
	    /**
	     * @type {OrderComments} Ordre de tri des commentaires et des réponses
	     */
	    private _order;
	    /*************************************************/
	    /*************************************************/
	    constructor(nbComments: number, media: Base);
	    /**
	     * Initialise la collection de commentaires
	     */
	    init(): void;
	    /**
	     * Initialize le tableau des écouteurs d'évènements
	     * @returns {Base}
	     * @private
	     */
	    private _initListeners;
	    /**
	     * Permet d'ajouter un listener sur un type d'évenement
	     * @param  {EventTypes} name - Le type d'évenement
	     * @param  {Function}   fn   - La fonction à appeler
	     * @return {Base} L'instance du média
	     */
	    addListener(name: EventTypes, fn: Callback, ...args: any[]): this;
	    /**
	     * Permet de supprimer un listener sur un type d'évenement
	     * @param  {string}   name - Le type d'évenement
	     * @param  {Function} fn   - La fonction qui était appelée
	     * @return {Base} L'instance du média
	     */
	    removeListener(name: EventTypes, fn: Callback): this;
	    /**
	     * Appel les listeners pour un type d'évenement
	     * @param  {EventTypes} name - Le type d'évenement
	     * @return {Base} L'instance du média
	     */
	    protected _callListeners(name: EventTypes): this;
	    /**
	     * Retourne la taille de la collection
	     * @readonly
	     */
	    get length(): number;
	    /**
	     * Retourne le média auxquels sont associés les commentaires
	     * @readonly
	     */
	    get media(): Base;
	    /**
	     * Retourne l'ordre de tri des commentaires
	     * @returns {OrderComments}
	     */
	    get order(): OrderComments;
	    /**
	     * Définit l'ordre de tri des commentaires
	     * @param {OrderComments} o - Ordre de tri
	     */
	    set order(o: OrderComments);
	    /**
	     * Récupère les commentaires du média sur l'API
	     * @param   {number} [nbpp=50] - Le nombre de commentaires à récupérer
	     * @param   {number} [since=0] - L'identifiant du dernier commentaire reçu
	     * @param   {OrderComments} [order='desc'] - Ordre de tri des commentaires
	     * @returns {Promise<CommentsBS>}
	     */
	    fetchComments(nbpp?: number, since?: number, order?: OrderComments): Promise<CommentsBS>;
	    /**
	     * Ajoute un commentaire à la collection
	     * /!\ (Ne l'ajoute pas sur l'API) /!\
	     * @param   {Obj} data - Les données du commentaire provenant de l'API
	     * @returns {CommentsBS}
	     */
	    addComment(data: Obj | CommentBS): this;
	    /**
	     * Retire un commentaire de la collection
	     * /!\ (Ne le supprime pas sur l'API) /!\
	     * @param   {number} cmtId - L'identifiant du commentaire à retirer
	     * @returns {CommentsBS}
	     */
	    removeComment(cmtId: number): this;
	    /**
	     * Indique si il s'agit du premier commentaire
	     * @param cmtId - L'identifiant du commentaire
	     * @returns {boolean}
	     */
	    isFirst(cmtId: number): boolean;
	    /**
	     * Indique si il s'agit du dernier commentaire
	     * @param cmtId - L'identifiant du commentaire
	     * @returns {boolean}
	     */
	    isLast(cmtId: number): boolean;
	    /**
	     * Indique si on peut écrire des commentaires sur ce média
	     * @returns {boolean}
	     */
	    isOpen(): boolean;
	    /**
	     * Retourne le commentaire correspondant à l'ID fournit en paramètre
	     * @param   {number} cId - L'identifiant du commentaire
	     * @returns {CommentBS|void}
	     */
	    getComment(cId: number): CommentBS;
	    /**
	     * Retourne le commentaire précédent celui fournit en paramètre
	     * @param   {number} cId - L'identifiant du commentaire
	     * @returns {CommentBS|null}
	     */
	    getPrevComment(cId: number): CommentBS;
	    /**
	     * Retourne le commentaire suivant celui fournit en paramètre
	     * @param   {number} cId - L'identifiant du commentaire
	     * @returns {CommentBS|null}
	     */
	    getNextComment(cId: number): CommentBS | null;
	    /**
	     * Retourne les réponses d'un commentaire
	     * @param   {number} commentId - Identifiant du commentaire original
	     * @param   {OrderComments} [order='desc'] - Ordre de tri des réponses
	     * @returns {Promise<Array<CommentBS>>} Tableau des réponses
	     */
	    fetchReplies(commentId: number, order?: OrderComments): Promise<Array<CommentBS>>;
	    /**
	     * Modifie le nombre de votes et le vote du membre pour un commentaire
	     * @param   {number} commentId - Identifiant du commentaire
	     * @param   {number} thumbs - Nombre de votes
	     * @param   {number} thumbed - Le vote du membre connecté
	     * @returns {boolean}
	     */
	    changeThumbs(commentId: number, thumbs: number, thumbed: number): boolean;
	    /**
	     * Retourne la template pour l'affichage de l'ensemble des commentaires
	     * @param   {number} nbpp - Le nombre de commentaires à récupérer
	     * @returns {Promise<string>} La template
	     */
	    getTemplate(nbpp: number): Promise<string>;
	    /**
	     * Retourne un tableau contenant les logins des commentaires
	     * @returns {Array<string>}
	     */
	    protected getLogins(): Array<string>;
	    /**
	     * Met à jour le nombre de commentaires sur la page
	     */
	    updateCounter(): void;
	    /**
	     * Ajoute les évènements sur les commentaires lors du rendu
	     * @param   {JQuery<HTMLElement>} $container - Le conteneur des éléments d'affichage
	     * @param   {number} nbpp - Le nombre de commentaires à récupérer sur l'API
	     * @param   {Obj} funcPopup - Objet des fonctions d'affichage/ de masquage de la popup
	     * @returns {void}
	     */
	    protected loadEvents($container: JQuery<HTMLElement>, nbpp: number, funcPopup: Obj): void;
	    /**
	     * Nettoie les events créer par la fonction loadEvents
	     * @param   {Function} onComplete - Fonction de callback
	     * @returns {void}
	     */
	    protected cleanEvents(onComplete?: Callback): void;
	    /**
	     * Gère l'affichage de l'ensemble des commentaires
	     * @returns {void}
	     */
	    render(): void;
	    /**
	     * Ajoute un commentaire dans la liste des commentaires de la page
	     * @param {number} cmtId - L'identifiant du commentaire
	     */
	    addToPage(cmtId: number): void;
	    /**
	     * Supprime un commentaire dans la liste des commentaires de la page
	     * @param {number} cmtId - L'identifiant du commentaire
	     */
	    removeFromPage(cmtId: number): void;
	    /**
	     * Retourne la template affichant les notes associés aux commentaires
	     * @returns {string} La template affichant les évaluations des commentaires
	     */
	    showEvaluations(): Promise<string>;
	}

}
declare module 'Movie' {
	/// <reference types="jquery" />
	import { Obj } from 'Base';
	import { implAddNote } from 'Note';
	import { Platform_link } from 'Episode';
	import { Media } from 'Media';
	export type OtherTitle = {
	    language: string;
	    title: string;
	};
	export interface implMovie {
	    backdrop: string;
	    director: string;
	    original_release_date: Date;
	    other_title: OtherTitle;
	    platform_links: Array<Platform_link>;
	    poster: string;
	    production_year: number;
	    release_date: Date;
	    sale_date: Date;
	    tagline: string;
	    tmdb_id: number;
	    trailer: string;
	    url: string;
	}
	export enum MovieStatus {
	    TOSEE = 0,
	    SEEN = 1,
	    DONTWANTTOSEE = 2
	}
	export class Movie extends Media implements implAddNote {
	    /***************************************************/
	    /***************************************************/
	    /**
	     * Methode static servant à retourner un objet show
	     * à partir de son ID
	     * @param  {number} id             L'identifiant de la série
	     * @param  {boolean} [force=false] Indique si on utilise le cache ou non
	     * @return {Promise<Movie>}
	     */
	    static fetch(id: number, force?: boolean): Promise<Movie>;
	    static search(title: string, force?: boolean): Promise<Movie>;
	    /***************************************************/
	    /***************************************************/
	    backdrop: string;
	    director: string;
	    original_release_date: Date;
	    other_title: OtherTitle;
	    platform_links: Array<Platform_link>;
	    poster: string;
	    production_year: number;
	    release_date: Date;
	    sale_date: Date;
	    tagline: string;
	    tmdb_id: number;
	    trailer: string;
	    /***************************************************/
	    /***************************************************/
	    /**
	     * Constructeur de la classe Movie
	     * @param   {Obj} data - Les données du média
	     * @param   {JQuery<HTMLElement>} element - Le DOMElement associé au média
	     * @returns {Media}
	     */
	    constructor(data: Obj, element?: JQuery<HTMLElement>);
	    /**
	     * Remplit l'objet avec les données fournit en paramètre
	     * @param  {any} data Les données provenant de l'API
	     * @returns {Movie}
	     * @override
	     */
	    fill(data: Obj): this;
	    /**
	     * Définit le film, sur le compte du membre connecté, comme "vu"
	     * @returns {Promise<Movie>}
	     */
	    markAsView(): Promise<this>;
	    /**
	     * Définit le film, sur le compte du membre connecté, comme "à voir"
	     * @returns {Promise<Movie>}
	     */
	    markToSee(): Promise<this>;
	    /**
	     * Définit le film, sur le compte du membre connecté, comme "ne pas voir"
	     * @returns {Promise<Movie>}
	     */
	    markDontWantToSee(): Promise<this>;
	    /**
	     * Modifie le statut du film sur le compte du membre connecté
	     * @param   {number} state     Le nouveau statut du film
	     * @returns {Promise<Movie>}    L'instance du film
	     */
	    changeStatus(state: MovieStatus): Promise<this>;
	    /**
	     * Retourne une image, si disponible, en fonction du format désiré
	     * @param  {string = Images.formats.poster} format   Le format de l'image désiré
	     * @return {Promise<string>}                         L'URL de l'image
	     */
	    getDefaultImage(format?: string): Promise<string>;
	}

}
declare module 'Similar' {
	import { Obj, MediaTypes } from 'Base';
	import { Media } from 'Media';
	import { Season } from 'Season';
	import { implShow, Showrunner, Platforms, Images, Picture } from 'Show';
	import { implMovie, OtherTitle } from 'Movie';
	import { Platform_link } from 'Episode';
	interface implDialog {
	    show: () => void;
	    close: () => void;
	    setContent: (text: string) => void;
	    setCounter: (text: string) => void;
	    setTitle: (title: string) => void;
	    init: () => void;
	}
	export class Similar extends Media implements implShow, implMovie {
	    backdrop: string;
	    director: string;
	    original_release_date: Date;
	    other_title: OtherTitle;
	    platform_links: Platform_link[];
	    poster: string;
	    production_year: number;
	    release_date: Date;
	    sale_date: Date;
	    tagline: string;
	    tmdb_id: number;
	    trailer: string;
	    url: string;
	    aliases: object;
	    creation: string;
	    country: string;
	    images: Images;
	    nbEpisodes: number;
	    network: string;
	    next_trailer: string;
	    next_trailer_host: string;
	    rating: string;
	    pictures: Picture[];
	    platforms: Platforms;
	    seasons: Season[];
	    nbSeasons: number;
	    showrunner: Showrunner;
	    social_links: string[];
	    status: string;
	    thetvdb_id: number;
	    constructor(data: Obj, type: MediaTypes);
	    /**
	     * Remplit l'objet avec les données fournit en paramètre
	     * @param  {Obj} data Les données provenant de l'API
	     * @returns {Similar}
	     * @override
	     */
	    fill(data: Obj): this;
	    /**
	     * Récupère les données de la série sur l'API
	     * @param  {boolean} [force=true]   Indique si on utilise les données en cache
	     * @return {Promise<*>}             Les données de la série
	     */
	    fetch(force?: boolean): Promise<Obj>;
	    /**
	     * Ajoute le bandeau Viewed sur le poster du similar
	     * @return {Similar}
	     */
	    addViewed(): Similar;
	    /**
	     * Ajoute l'icône wrench à côté du titre du similar
	     * pour permettre de visualiser les données du similar
	     * @param   {implDialog} dialog L'objet Dialog pour afficher les données
	     * @returns {Similar}
	     */
	    wrench(dialog: implDialog): Similar;
	    /**
	     * Retourne le contenu HTML pour la popup
	     * de présentation du similar
	     * @return {string}
	     */
	    getContentPopup(): string;
	    /**
	     * Retourne le contenu HTML du titre de la popup
	     * @return {string}
	     */
	    getTitlePopup(): string;
	    /**
	     * Met à jour l'attribut title de la note du similar
	     * @param  {Boolean} change Indique si il faut modifier l'attribut
	     * @return {string}         La valeur modifiée de l'attribut title
	     */
	    updateTitleNote(change?: boolean): string;
	    /**
	     * Ajoute la note, sous forme d'étoiles, du similar sous son titre
	     * @return {Similar}
	     */
	    renderStars(): Similar;
	    /**
	     * Vérifie la présence de l'image du similar
	     * et tente d'en trouver une si celle-ci n'est pas présente
	     * @return {Similar}
	     */
	    checkImg(): Similar;
	    /**
	     * Add Show to account member
	     * @return {Promise<Similar>} Promise of show
	     */
	    addToAccount(state?: number): Promise<Similar>;
	    /**
	     * Modifie le statut du similar
	     * @param   {number} state Le nouveau statut du similar
	     * @returns {Promise<Similar>}
	     */
	    changeState(state: number): Promise<Similar>;
	    /**
	     * Ajoute une note au média
	     * @param   {number} note Note du membre connecté pour le média
	     * @returns {Promise<boolean>}
	     */
	    addVote(note: number): Promise<boolean>;
	}
	export {};

}
declare module 'Media' {
	/// <reference types="jquery" />
	import { Base, Obj } from 'Base';
	import { Similar } from 'Similar';
	export abstract class Media extends Base {
	    /**
	     * @type {number} Nombre de membres ayant ce média sur leur compte
	     */
	    followers: number;
	    /**
	     * @type {Array<string>} Les genres attribués à ce média
	     */
	    genres: Array<string>;
	    /**
	     * @type {string} Identifiant IMDB
	     */
	    imdb_id: string;
	    /**
	     * @type {string} Langue originale du média
	     */
	    language: string;
	    /**
	     * @type {number} Durée du média en minutes
	     */
	    length: number;
	    /**
	     * @type {string} Titre original du média
	     */
	    original_title: string;
	    /**
	     * @type {Array<Similar>} Tableau des médias similaires
	     */
	    similars: Array<Similar>;
	    /**
	     * @type {number} Nombre de médias similaires
	     */
	    nbSimilars: number;
	    /**
	     * @type {boolean} Indique si le média se trouve sur le compte du membre connecté
	     */
	    _in_account: boolean;
	    /**
	     * @type {string} slug - Identifiant du média servant pour l'URL
	     */
	    slug: string;
	    /**
	     * Constructeur de la classe Media
	     * @param   {Obj} data - Les données du média
	     * @param   {JQuery<HTMLElement>} [element] - Le DOMElement associé au média
	     * @returns {Media}
	     */
	    constructor(data: Obj, element?: JQuery<HTMLElement>);
	    /**
	     * Remplit l'objet avec les données fournit en paramètre
	     * @param  {Obj} data Les données provenant de l'API
	     * @returns {Media}
	     * @override
	     */
	    fill(data: Obj): this;
	    /**
	     * Indique si le média est enregistré sur le compte du membre
	     * @returns {boolean}
	     */
	    get in_account(): boolean;
	    /**
	     * Définit si le média est enregistré sur le compte du membre
	     * @param {boolean} i Flag
	     */
	    set in_account(i: boolean);
	    /**
	     * Retourne les similars associés au media
	     * @return {Promise<Media>}
	     */
	    fetchSimilars(): Promise<Media>;
	    /**
	     * Retourne le similar correspondant à l'identifiant
	     * @abstract
	     * @param  {number} id      L'identifiant du similar
	     * @return {Similar|void}   Le similar ou null
	     */
	    getSimilar(id: number): Similar;
	}

}
declare module 'Show' {
	/// <reference types="jquery" />
	import { Obj, EventTypes, Callback } from 'Base';
	import { implAddNote } from 'Note';
	import { Media } from 'Media';
	import { Season } from 'Season';
	export class Images {
	    static formats: {
	        poster: string;
	        wide: string;
	    };
	    constructor(data: Obj);
	    show: string;
	    banner: string;
	    box: string;
	    poster: string;
	}
	export enum Picked {
	    none = 0,
	    banner = 1,
	    show = 2
	}
	export class Picture {
	    constructor(data: Obj);
	    id: number;
	    show_id: number;
	    login_id: number;
	    url: string;
	    width: number;
	    height: number;
	    date: Date;
	    picked: Picked;
	}
	export class Platform {
	    constructor(data: Obj);
	    id: number;
	    name: string;
	    tag: string;
	    link_url: string;
	    available: object;
	    logo: string;
	    partner: boolean;
	}
	export class PlatformList {
	    svod: Array<Platform>;
	    vod: Array<Platform>;
	    country: string;
	    static types: Obj;
	    /**
	     * fetchPlatforms - Récupère la liste des plateformes sur l'API
	     * @param  {string}                [country = 'us'] Le pays concerné par les plateformes
	     * @return {Promise<PlatformList>}                  L'objet contenant les différentes plateformes
	     */
	    static fetchPlatforms(country?: string): Promise<PlatformList>;
	    constructor(data: Obj, country?: string);
	    /**
	     * Retourne les plateformes sous forme d'éléments HTML Option
	     * @param  {string}           [type = 'svod']  Le type de plateformes souhaité
	     * @param  {Array<number>}    [exclude = null] Les identifiants des plateformes à exclure
	     * @return {string}                            Les options sous forme de chaîne
	     */
	    renderHtmlOptions(type?: string, exclude?: Array<number>): string;
	}
	export class Platforms {
	    constructor(data: Obj);
	    svods: Array<Platform>;
	    svod: Platform;
	    vod: Array<Platform>;
	}
	export class Showrunner {
	    constructor(data: Obj);
	    id: number;
	    name: string;
	    picture: string;
	}
	export interface implShow {
	    aliases: object;
	    creation: string;
	    country: string;
	    images: Images;
	    nbEpisodes: number;
	    network: string;
	    next_trailer: string;
	    next_trailer_host: string;
	    rating: string;
	    pictures: Array<Picture>;
	    platforms: Platforms;
	    seasons: Array<Season>;
	    showrunner: Showrunner;
	    social_links: Array<string>;
	    status: string;
	    thetvdb_id: number;
	}
	export class Show extends Media implements implShow, implAddNote {
	    /***************************************************/
	    /***************************************************/
	    /**
	     * Types d'évenements gérés par cette classe
	     * @type {Array}
	     */
	    static EventTypes: Array<EventTypes>;
	    /**
	     * Méthode static servant à récupérer une série sur l'API BS
	     * @param  {Obj} params - Critères de recherche de la série
	     * @param  {boolean} [force=false] - Indique si on utilise le cache ou non
	     * @return {Promise<Show>}
	     * @private
	     */
	    private static _fetch;
	    /**
	     * fetchLastSeen - Méthode static retournant les 10 dernières séries vues par le membre
	     * @param  {number}  [limit = 10]  Le nombre limite de séries retournées
	     * @return {Promise<Show>}         Une promesse avec les séries
	     */
	    static fetchLastSeen(limit?: number): Promise<Array<Show>>;
	    /**
	     * Méthode static servant à récupérer plusieurs séries sur l'API BS
	     * @param  {Array<number>} ids - Les identifiants des séries recherchées
	     * @return {Promise<Array<Show>>}
	     */
	    static fetchMulti(ids: Array<number>): Promise<Array<Show>>;
	    /**
	     * Methode static servant à récupérer une série par son identifiant BS
	     * @param  {number} id - L'identifiant de la série
	     * @param  {boolean} [force=false] - Indique si on utilise le cache ou non
	     * @return {Promise<Show>}
	     */
	    static fetch(id: number, force?: boolean): Promise<Show>;
	    /**
	     * Methode static servant à récupérer une série par son identifiant TheTVDB
	     * @param  {number} id - L'identifiant TheTVDB de la série
	     * @param  {boolean} [force=false] - Indique si on utilise le cache ou non
	     * @return {Promise<Show>}
	     */
	    static fetchByTvdb(id: number, force?: boolean): Promise<Show>;
	    /**
	     * Méthode static servant à récupérer une série par son identifiant URL
	     * @param   {string} url - Identifiant URL (slug) de la série recherchée
	     * @param   {boolean} force - Indique si on doit ignorer les données dans le cache
	     * @returns {Promise<Show>}
	     */
	    static fetchByUrl(url: string, force?: boolean): Promise<Show>;
	    /***************************************************/
	    /***************************************************/
	    /**
	     * @type {object} Contient les alias de la série
	     */
	    aliases: object;
	    /**
	     * @type {string} Année de création de la série
	     */
	    creation: string;
	    /**
	     * @type {string} Pays d'origine de la série
	     */
	    country: string;
	    /**
	     * @type {number} Pointeur vers la saison courante
	     */
	    _currentSeason: number;
	    /**
	     * @type {Images} Contient les URLs d'accès aux images de la série
	     */
	    images: Images;
	    /**
	     * @type {number} Nombre total d'épisodes dans la série
	     */
	    nbEpisodes: number;
	    /**
	     * @type {string} Chaîne TV ayant produit la série
	     */
	    network: string;
	    /**
	     * @type {string}
	     */
	    next_trailer: string;
	    /**
	     * @type {string}
	     */
	    next_trailer_host: string;
	    /**
	     * @type {string} Code de classification TV parental
	     */
	    rating: string;
	    /**
	     * @type {Array<Picture>} Tableau des images uploadées par les membres
	     */
	    pictures: Array<Picture>;
	    /**
	     * @type {Platforms} Plateformes de diffusion
	     */
	    platforms: Platforms;
	    /**
	     * @type {Array<Season>} Tableau des saisons de la série
	     */
	    seasons: Array<Season>;
	    /**
	     * @type {Showrunner}
	     */
	    showrunner: Showrunner;
	    /**
	     * @type {Array<string>} Tableau des liens sociaux de la série
	     */
	    social_links: Array<string>;
	    /**
	     * @type {string} Status de la série sur le compte du membre
	     */
	    status: string;
	    /**
	     * @type {number} Identifiant TheTVDB de la série
	     */
	    thetvdb_id: number;
	    /**
	     * @type {boolean} Indique si la série se trouve dans les séries à voir
	     */
	    markToSee: boolean;
	    /***************************************************/
	    /***************************************************/
	    /**
	     * Constructeur de la classe Show
	     * @param   {Obj} data - Les données du média
	     * @param   {JQuery<HTMLElement>} element - Le DOMElement associé au média
	     * @returns {Media}
	     */
	    constructor(data: Obj, element: JQuery<HTMLElement>);
	    /**
	     * Initialise l'objet lors de sa construction et après son remplissage
	     * @returns {Promise<Show>}
	     */
	    init(): Promise<this>;
	    /**
	     * Récupère les données de la série sur l'API
	     * @param  {boolean} [force=true]   Indique si on utilise les données en cache
	     * @return {Promise<*>}             Les données de la série
	     */
	    fetch(force?: boolean): Promise<Obj>;
	    /**
	     * Récupère les saisons de la série
	     * @returns {Promise<Show>}
	     */
	    fetchSeasons(): Promise<Show>;
	    /**
	     * Récupère les personnages de la série
	     * @returns {Promise<Show>}
	     */
	    fetchCharacters(): Promise<Show>;
	    /**
	     * isEnded - Indique si la série est terminée
	     *
	     * @return {boolean}  Terminée ou non
	     */
	    isEnded(): boolean;
	    /**
	     * isArchived - Indique si la série est archivée
	     *
	     * @return {boolean}  Archivée ou non
	     */
	    isArchived(): boolean;
	    /**
	     * isFavorite - Indique si la série est dans les favoris
	     *
	     * @returns {boolean}
	     */
	    isFavorite(): boolean;
	    /**
	     * isMarkToSee - Indique si la série se trouve dans les séries à voir
	     * @returns {boolean}
	     */
	    isMarkedToSee(): boolean;
	    /**
	     * addToAccount - Ajout la série sur le compte du membre connecté
	     * @return {Promise<Show>} Promise of show
	     */
	    addToAccount(): Promise<Show>;
	    /**
	     * Remove Show from account member
	     * @return {Promise<Show>} Promise of show
	     */
	    removeFromAccount(): Promise<Show>;
	    /**
	     * Archive la série
	     * @return {Promise<Show>} Promise of show
	     */
	    archive(): Promise<Show>;
	    /**
	     * Désarchive la série
	     * @return {Promise<Show>} Promise of show
	     */
	    unarchive(): Promise<Show>;
	    /**
	     * Ajoute la série aux favoris
	     * @return {Promise<Show>} Promise of show
	     */
	    favorite(): Promise<Show>;
	    /**
	     * Supprime la série des favoris
	     * @return {Promise<Show>} Promise of show
	     */
	    unfavorite(): Promise<Show>;
	    /**
	     * Met à jour les données de la série
	     * @param  {Boolean}  [force=false]     Forcer la récupération des données sur l'API
	     * @param  {Callback} [cb = Base.noop]  Fonction de callback
	     * @return {Promise<Show>}              Promesse (Show)
	     */
	    update(force?: boolean, cb?: Callback): Promise<Show>;
	    /**
	     * Met à jour le rendu de la barre de progression
	     * et du prochain épisode
	     * @param  {Callback} [cb=Base.noop] Fonction de callback
	     * @return {void}
	     */
	    updateRender(cb?: Callback): void;
	    /**
	     * Met à jour la barre de progression de visionnage de la série
	     * @return {void}
	     */
	    updateProgressBar(): void;
	    /**
	     * Met à jour le bloc du prochain épisode à voir
	     * @param   {Callback} [cb=noop] Fonction de callback
	     * @returns {void}
	     */
	    updateNextEpisode(cb?: Callback): void;
	    /**
	     * On gère l'ajout de la série dans le compte utilisateur
	     *
	     * @param   {boolean} trigEpisode Flag indiquant si l'appel vient d'un episode vu ou du bouton
	     * @returns {void}
	     */
	    addShowClick(trigEpisode?: boolean): void;
	    /**
	     * Gère la suppression de la série du compte utilisateur
	     * @returns {void}
	     */
	    deleteShowClick(): void;
	    /**
	     * Ajoute le bouton toSee dans les actions de la série
	     */
	    addBtnToSee(): void;
	    /**
	     * Ajoute un eventHandler sur les boutons Archiver et Favoris
	     * @returns {void}
	     */
	    addEventBtnsArchiveAndFavoris(): void;
	    /**
	     * Ajoute la classification dans les détails de la ressource
	     */
	    addRating(): void;
	    /**
	     * Définit la saison courante
	     * @param   {number} seasonNumber Le numéro de la saison courante (commence à 1)
	     * @returns {Show}  L'instance de la série
	     * @throws  {Error} if seasonNumber is out of range of seasons
	     */
	    setCurrentSeason(seasonNumber: number): Show;
	    /**
	     * Retourne la saison courante
	     * @return {Season}
	     */
	    get currentSeason(): Season;
	    /**
	     * Retourne l'objet Season correspondant au numéro de saison fournit en paramètre
	     * @param   {number} seasonNumber - Numéro de saison (base: 1)
	     * @returns {Season}
	     */
	    getSeason(seasonNumber: number): Season;
	    /**
	     * Retourne une image, si disponible, en fonction du format désiré
	     * @param  {string = Images.formats.poster} format   Le format de l'image désiré
	     * @return {Promise<string>}                         L'URL de l'image
	     */
	    getDefaultImage(format?: string): Promise<string>;
	}

}
declare module 'Season' {
	import { Callback, Obj } from 'Base';
	import { Episode } from 'Episode';
	import { Show } from 'Show';
	export class Season {
	    /**
	     * @type {number} Numéro de la saison dans la série
	     */
	    number: number;
	    /**
	     * @type {Array<Episode>} Tableau des épisodes de la saison
	     */
	    episodes: Array<Episode>;
	    /**
	     * Nombre d'épisodes dans la saison
	     * @type {number}
	     */
	    nbEpisodes: number;
	    /**
	     * @type {boolean} Possède des sous-titres
	     */
	    has_subtitles: boolean;
	    /**
	     * @type {boolean} Saison pas vu
	     */
	    hidden: boolean;
	    /**
	     * @type {string} URL de l'image
	     */
	    image: string;
	    /**
	     * @type {boolean} Saison vu
	     */
	    seen: boolean;
	    /**
	     * @type {Show} L'objet Show auquel est rattaché la saison
	     */
	    private _show;
	    /**
	     * @type {JQuery<HTMLElement>} Le DOMElement jQuery correspondant à la saison
	     */
	    private _elt;
	    /**
	     * Constructeur de la classe Season
	     * @param   {Obj}   data    Les données provenant de l'API
	     * @param   {Show}  show    L'objet Show contenant la saison
	     * @returns {Season}
	     */
	    constructor(data: Obj, show: Show);
	    get length(): number;
	    /**
	     * Récupère les épisodes de la saison sur l'API
	     * @returns {Promise<Season>}
	     */
	    fetchEpisodes(): Promise<Season>;
	    watched(): Promise<Season>;
	    hide(): Promise<Season>;
	    /**
	     * Retourne l'épisode correspondant à l'identifiant fournit
	     * @param  {number} id
	     * @returns {Episode}
	     */
	    getEpisode(id: number): Episode;
	    /**
	     * Retourne le nombre d'épisodes vus
	     * @returns {number} Le nombre d'épisodes vus dans la saison
	     */
	    getNbEpisodesSeen(): number;
	    /**
	     * Retourne le nombre d'épisodes non vus
	     * @returns {number} Le nombre d'épisodes non vus dans la saison
	     */
	    getNbEpisodesUnwatched(): number;
	    /**
	     * Retourne le nombre d'épisodes spéciaux
	     * @returns {number} Le nombre d'épisodes spéciaux
	     */
	    getNbEpisodesSpecial(): number;
	    /**
	     * Met à jour l'objet Show
	     * @param {Function} cb Function de callback
	     * @returns {Season}
	     */
	    updateShow(cb?: Callback): Season;
	    /**
	     * Change le statut visuel de la saison sur le site
	     * @return {Season}
	     */
	    updateRender(): Season;
	    /**
	     * Modifie la saison courante de l'objet Show
	     * @param   {number} seasonNumber Le numéro de la saison
	     * @returns {Season}
	     */
	    changeCurrentSeason(seasonNumber: number): Season;
	    /**
	     * Indique si la série est sur le compte du membre connecté
	     * @returns {boolean}
	     */
	    showInAccount(): boolean;
	    /**
	     * Définit la série comme étant sur le compte du membre connecté
	     * @returns {Season}
	     */
	    addShowToAccount(): Season;
	    /**
	     * Retourne le prochain épisode non vu
	     * @return {Episode} Le prochain épisode non vu
	     */
	    getNextEpisodeUnwatched(): Episode;
	}

}
declare module 'Subtitle' {
	import { Obj } from 'Base';
	export class Subtitle {
	    /**
	     * @type {number} - L'identifiant du subtitle
	     */
	    id: number;
	    /**
	     * @type {string} - La langue du subtitle
	     */
	    language: string;
	    /**
	     * @type {string} - La source du subtitle
	     */
	    source: string;
	    /**
	     * @type {number} - La qualité du subtitle
	     */
	    quality: number;
	    /**
	     * @type {string} - Le nom du fichier du subtitle
	     */
	    file: string;
	    /**
	     * @type {string} - L'URL d'accès au subtitle
	     */
	    url: string;
	    /**
	     * @type {Date} - Date de mise en ligne
	     */
	    date: Date;
	    episode: number;
	    show: number;
	    season: number;
	    constructor(data: Obj);
	}
	export enum SortTypeSubtitles {
	    LANGUAGE = "language",
	    SOURCE = "source",
	    QUALITY = "quality",
	    DATE = "date"
	}
	export enum SubtitleTypes {
	    EPISODE = "episode",
	    SEASON = "season",
	    SHOW = "show"
	}
	export enum SubtitleLanguages {
	    ALL = "all",
	    VOVF = "vovf",
	    VO = "vo",
	    VF = "vf"
	}
	export type ParamsFetchSubtitles = {
	    id: number;
	    season?: number;
	};
	export class Subtitles {
	    /**
	     * @type {Array<Subtitle>} - Collection de subtitles
	     */
	    subtitles: Array<Subtitle>;
	    /**
	     * Récupère et retourne une collection de subtitles
	     * @param   {SubtitleTypes} type - Type de média
	     * @param   {ParamsFetchSubtitles} ids - Les identifiants de recherche
	     * @param   {SubtitleLanguages} language - La langue des subtitles recherchés
	     * @returns {Promise<Subtitles>}
	     */
	    static fetch(type: SubtitleTypes, ids: ParamsFetchSubtitles, language?: SubtitleLanguages): Promise<Subtitles>;
	    constructor(data: Array<Obj>);
	    /**
	     * Permet de trier les subtitles
	     * @param   {SortTypeSubtitles} by - Le type de tri
	     * @returns {Array<Subtitle>}
	     */
	    sortBy(by: SortTypeSubtitles): Array<Subtitle>;
	}

}
declare module 'Episode' {
	import { Base, Obj, HTTP_VERBS } from 'Base';
	import { implAddNote } from 'Note';
	import { Season } from 'Season';
	import { Subtitles } from 'Subtitle';
	export type Platform_link = {
	    /**
	     * @type {number} Identifiant de l'épisode sur la plateforme
	     */
	    id: number;
	    /**
	     * @type {string} Lien vers l'épisode sur la plateforme
	     */
	    link: string;
	    /**
	     * @type {string} Le nom de la plateforme
	     */
	    platform: string;
	};
	export type ReleasesSvod = {
	    displayOriginal: boolean;
	    releases: Array<string>;
	};
	export type WatchedBy = {
	    /**
	     * @type {number} Identifiant du membre
	     */
	    id: number;
	    /**
	     * @type {string} Login du membre
	     */
	    login: string;
	    /**
	     * @type {number} La note du membre
	     */
	    note: number;
	};
	export class Episode extends Base implements implAddNote {
	    static fetch(epId: number): Promise<Episode>;
	    /**
	     * @type {Season} L'objet Season contenant l'épisode
	     */
	    _season: Season;
	    /**
	     * @type {string} Le code de l'épisode SXXEXX
	     */
	    code: string;
	    /**
	     * @type {Date} La date de sortie de l'épisode
	     */
	    date: Date;
	    /**
	     * @type {string}
	     */
	    director: string;
	    /**
	     * @type {number} Le numéro de l'épisode dans la saison
	     */
	    episode: number;
	    /**
	     * @type {number} Le numéro de l'épisode dans la série
	     */
	    global: number;
	    /**
	     * @type {number} Le numéro de la saison
	     */
	    numSeason: number;
	    /**
	     * @type {Array<Platform_link>} Les plateformes de diffusion
	     */
	    platform_links: Array<Platform_link>;
	    /**
	     * @type {ReleasesSvod}
	     */
	    releasesSvod: ReleasesSvod;
	    /**
	     * @type {number} Nombre de membres de BS à avoir vu l'épisode
	     */
	    seen_total: number;
	    /**
	     * @type {boolean} Indique si il s'agit d'un épisode spécial
	     */
	    special: boolean;
	    /**
	     * @type {Array<Subtitle>} Tableau des sous-titres dispo sur BS
	     */
	    subtitles: Subtitles;
	    /**
	     * @type {number} Identifiant de l'épisode sur thetvdb.com
	     */
	    thetvdb_id: number;
	    /**
	     * @type {Array<WatchedBy>} Tableau des amis ayant vu l'épisode
	     */
	    watched_by: Array<WatchedBy>;
	    /**
	     * @type {Array<string>} Tableau des scénaristes de l'épisode
	     */
	    writers: Array<string>;
	    /**
	     * @type {string} Identifiant de la vidéo sur Youtube
	     */
	    youtube_id: string;
	    /**
	     * Constructeur de la classe Episode
	     * @param   {Obj}       data    Les données provenant de l'API
	     * @param   {Season}    season  L'objet Season contenant l'épisode
	     * @returns {Episode}
	     */
	    constructor(data: Obj, season?: Season);
	    /**
	     * Remplit l'objet avec les données fournit en paramètre
	     * @param  {Obj} data Les données provenant de l'API
	     * @returns {Episode}
	     * @override
	     */
	    fill(data: Obj): this;
	    /**
	     * Ajoute le titre de l'épisode à l'attribut Title
	     * du DOMElement correspondant au titre de l'épisode
	     * sur la page Web
	     *
	     * @return {Episode} L'épisode
	     */
	    addAttrTitle(): Episode;
	    /**
	     * Met à jour le DOMElement .checkSeen avec les
	     * données de l'épisode (id, pos, special)
	     * @param  {number} pos  La position de l'épisode dans la liste
	     * @return {Episode}
	     */
	    initCheckSeen(pos: number): Episode;
	    /**
	     * Met à jour les infos de la vignette et appelle la fonction d'update du rendu
	     * @param  {number} pos La position de l'épisode dans la liste
	     * @return {boolean}    Indique si il y a eu un changement
	     */
	    updateCheckSeen(pos: number): boolean;
	    /**
	     * Met à jour le titre de l'épisode sur la page de la série
	     * @returns {void}
	     */
	    updateTitle(): void;
	    /**
	     * Retourne le code HTML du titre de la popup
	     * pour l'affichage de la description
	     * @return {string}
	     */
	    getTitlePopup(): string;
	    /**
	     * Définit le film, sur le compte du membre connecté, comme "vu"
	     * @returns {void}
	     */
	    markAsView(): void;
	    /**
	     * Définit le film, sur le compte du membre connecté, comme "non vu"
	     * @returns {void}
	     */
	    markAsUnview(): void;
	    /**
	     * Modifie le statut d'un épisode sur l'API
	     * @param  {String} status    Le nouveau statut de l'épisode
	     * @param  {String} method    Verbe HTTP utilisé pour la requête à l'API
	     * @return {void}
	     */
	    updateStatus(status: string, method: HTTP_VERBS): void;
	    /**
	     * Change le statut visuel de la vignette sur le site
	     * @param  {String} newStatus     Le nouveau statut de l'épisode
	     * @param  {bool}   [update=true] Mise à jour de la ressource en cache et des éléments d'affichage
	     * @return {Episode}
	     */
	    updateRender(newStatus: string, update?: boolean): Episode;
	    /**
	     * Affiche/masque le spinner de modification de l'épisode
	     *
	     * @param  {boolean}  display  Le flag indiquant si afficher ou masquer
	     * @return {Episode}
	     */
	    toggleSpinner(display: boolean): Episode;
	}

}
declare module 'User' {
	import { Obj } from 'Base';
	import { WatchedBy } from 'Episode';
	export class Next {
	    id: number;
	    code: string;
	    date: Date;
	    title: string;
	    image: string;
	    constructor(data: Obj);
	}
	export class User {
	    archived: boolean;
	    downloaded: boolean;
	    favorited: boolean;
	    friends_want_to_watch: Array<string>;
	    friends_watched: Array<WatchedBy>;
	    hidden: boolean;
	    last: string;
	    mail: boolean;
	    next: Next;
	    profile: string;
	    remaining: number;
	    seen: boolean;
	    status: number;
	    tags: string;
	    twitter: boolean;
	    constructor(data: Obj);
	}

}
declare module 'Base' {
	/// <reference types="jquery" />
	import { CacheUS } from 'Cache';
	import { Character } from 'Character';
	import { CommentsBS } from 'Comments';
	import { implAddNote, Note } from 'Note';
	import { User } from 'User';
	export function ExceptionIdentification(message: string): void; type Class<T> = new (...args: any[]) => T;
	export enum MediaType {
	    show = "show",
	    movie = "movie",
	    episode = "episode"
	}
	export type MediaTypes = {
	    singular: MediaType;
	    plural: string;
	    className: Class<Base>;
	};
	export enum EventTypes {
	    UPDATE = "update",
	    SAVE = "save",
	    ADD = "add",
	    ADDED = "added",
	    REMOVE = "remove",
	    NOTE = "note",
	    ARCHIVE = "archive",
	    UNARCHIVE = "unarchive",
	    SHOW = "show",
	    HIDE = "hide"
	}
	export enum HTTP_VERBS {
	    GET = "GET",
	    POST = "POST",
	    PUT = "PUT",
	    DELETE = "DELETE",
	    OPTIONS = "OPTIONS"
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
	export abstract class Base implements implAddNote {
	    /**
	     * Flag de debug pour le dev
	     * @type {boolean}
	     */
	    static debug: boolean;
	    /**
	     * L'objet cache du script pour stocker les données
	     * @type {CacheUS}
	     */
	    static cache: CacheUS;
	    /**
	     * Objet contenant les informations de l'API
	     * @type {Obj}
	     */
	    static api: Obj;
	    /**
	     * Le token d'authentification de l'API
	     * @type {String}
	     */
	    static token: string;
	    /**
	     * La clé d'utilisation de l'API
	     * @type {String}
	     */
	    static userKey: string;
	    /**
	     * L'identifiant du membre connecté
	     * @type {Number}
	     */
	    static userId: number;
	    /**
	     * Clé pour l'API TheMovieDB
	     * @type {string}
	     */
	    static themoviedb_api_user_key: string;
	    /**
	     * Le nombre d'appels à l'API
	     * @type {Number}
	     */
	    static counter: number;
	    /**
	     * L'URL de base du serveur contenant les ressources statiques
	     * @type {String}
	     */
	    static serverBaseUrl: string;
	    /**
	     * L'URL de base du serveur servant pour l'authentification
	     * @type {String}
	     */
	    static serverOauthUrl: string;
	    /**
	     * Indique le theme d'affichage du site Web (light or dark)
	     * @type {string}
	     */
	    static theme: string;
	    /**
	     * Fonction de notification sur la page Web
	     * @type {Function}
	     */
	    static notification: (title: string, text: string) => void;
	    /**
	     * Fonction pour vérifier que le membre est connecté
	     * @type {Function}
	     */
	    static userIdentified: () => boolean;
	    /**
	     * Fonction vide
	     * @type {Function}
	     */
	    static noop: Callback;
	    /**
	     * Fonction de traduction de chaînes de caractères
	     * @param   {String}  msg  - Identifiant de la chaîne à traduire
	     * @param   {Obj}     [params] - Variables utilisées dans la traduction {"%key%"": value}
	     * @param   {number}  [count=1] - Nombre d'éléments pour la version plural
	     * @returns {string}
	     */
	    static trans: (msg: string, params?: Obj, count?: number) => string;
	    /**
	     * Contient les infos sur les différentes classification TV et cinéma
	     * @type {Ratings}
	     */
	    static ratings: Ratings;
	    static gm_funcs: {
	        getValue: (key: string, defaultValue: Obj | Array<Obj> | Array<string> | Array<number>) => any;
	        setValue: (key: string, val: Obj | Array<Obj> | Array<string> | Array<number>) => void;
	    };
	    /**
	     * Types d'évenements gérés par cette classe
	     * @type {Array}
	     */
	    static EventTypes: Array<EventTypes>;
	    static showLoader(): void;
	    static hideLoader(): void;
	    /**
	     * Fonction d'authentification sur l'API BetaSeries
	     *
	     * @return {Promise}
	     */
	    static authenticate(): Promise<string>;
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
	    static callApi(type: string, resource: string, action: string, args: Obj, force?: boolean): Promise<Obj>;
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
	    private _elt;
	    private _listeners;
	    constructor(data: Obj);
	    /**
	     * Remplit l'objet avec les données fournit en paramètre
	     * @param  {Obj} data - Les données provenant de l'API
	     * @returns {Base}
	     * @virtual
	     */
	    fill(data: Obj): this;
	    /**
	     * Initialize le tableau des écouteurs d'évènements
	     * @returns {Base}
	     * @sealed
	     */
	    private _initListeners;
	    /**
	     * Permet d'ajouter un listener sur un type d'évenement
	     * @param  {EventTypes} name - Le type d'évenement
	     * @param  {Function}   fn   - La fonction à appeler
	     * @return {Base} L'instance du média
	     * @sealed
	     */
	    addListener(name: EventTypes, fn: Callback, ...args: any[]): this;
	    /**
	     * Permet de supprimer un listener sur un type d'évenement
	     * @param  {string}   name - Le type d'évenement
	     * @param  {Function} fn   - La fonction qui était appelée
	     * @return {Base} L'instance du média
	     * @sealed
	     */
	    removeListener(name: EventTypes, fn: Callback): this;
	    /**
	     * Appel les listeners pour un type d'évenement
	     * @param  {EventTypes} name - Le type d'évenement
	     * @return {Base} L'instance du média
	     * @sealed
	     */
	    _callListeners(name: EventTypes): this;
	    init(): Promise<this>;
	    /**
	     * Sauvegarde l'objet en cache
	     * @return {Base} L'instance du média
	     */
	    save(): this;
	    /**
	     * Retourne le DOMElement correspondant au média
	     * @returns {JQuery} Le DOMElement jQuery
	     */
	    get elt(): JQuery;
	    /**
	     * Définit le DOMElement de référence pour ce média
	     * @param  {JQuery} elt - DOMElement auquel est rattaché le média
	     */
	    set elt(elt: JQuery);
	    /**
	     * Retourne le nombre d'acteurs référencés dans ce média
	     * @returns {number}
	     */
	    get nbCharacters(): number;
	    /**
	     * Décode le titre de la page
	     * @return {Base} L'instance du média
	     */
	    decodeTitle(): Base;
	    /**
	     * Ajoute le nombre de votes à la note dans l'attribut title de la balise
	     * contenant la représentation de la note de la ressource
	     *
	     * @param  {Boolean} [change=true] - Indique si on doit changer l'attribut title du DOMElement
	     * @return {String} Le titre modifié de la note
	     */
	    changeTitleNote(change?: boolean): string;
	    /**
	     * Ajoute le nombre de votes à la note de la ressource
	     * @return {Base} L'instance du média
	     */
	    addNumberVoters(): Base;
	    /**
	     * Ajoute une note au média
	     * @param   {number} note - Note du membre connecté pour le média
	     * @returns {Promise<boolean>}
	     */
	    addVote(note: number): Promise<boolean>;
	} global {
	    interface Date {
	        format: (mask: string, utc?: boolean) => string;
	    }
	}
	export {};

}
declare module 'Member' {
	import { Obj } from 'Base'; enum DaysOfWeek {
	    monday = "lundi",
	    tuesday = "mardi",
	    wednesday = "mercredi",
	    thursday = "jeudi",
	    friday = "vendredi",
	    saturday = "samedi",
	    sunday = "dimanche"
	} class Stats {
	    friends: number;
	    shows: number;
	    seasons: number;
	    episodes: number;
	    comments: number;
	    progress: number;
	    episodes_to_watch: number;
	    time_on_tv: number;
	    time_to_spend: number;
	    movies: number;
	    badges: number;
	    member_since_days: number;
	    friends_of_friends: number;
	    episodes_per_month: number;
	    favorite_day: DaysOfWeek;
	    five_stars_percent: number;
	    four_five_stars_total: number;
	    streak_days: number;
	    favorite_genre: string;
	    written_words: number;
	    without_days: number;
	    shows_finished: number;
	    shows_current: number;
	    shows_to_watch: number;
	    shows_abandoned: number;
	    movies_to_watch: number;
	    time_on_movies: number;
	    time_to_spend_movies: number;
	    constructor(data: Obj);
	} class Options {
	    downloaded: boolean;
	    notation: boolean;
	    timelag: boolean;
	    global: boolean;
	    specials: boolean;
	    episodes_tri: string;
	    friendship: string;
	    country: string;
	    language: string;
	    mail_mois: boolean;
	    mail_hebdo: boolean;
	    notification_news: boolean;
	    twitter_auto: boolean;
	    constructor(data: Obj);
	}
	export class Member {
	    /**
	     * @type {number} Identifiant du membre
	     */
	    id: number;
	    /**
	     * @type {number} Identifiant Facebook ?
	     */
	    fb_id: number;
	    /**
	     * @type {string} Login du membre
	     */
	    login: string;
	    /**
	     * @type {number} Points d'expérience
	     */
	    xp: number;
	    /**
	     * @type {string} Locale utiliser par le membre
	     */
	    locale: string;
	    /**
	     * @type {number} ?
	     */
	    cached: number;
	    /**
	     * @type {string} URL de l'avatar du membre
	     */
	    avatar: string;
	    /**
	     * @type {string} URL de la bannière du membre
	     */
	    profile_banner: string;
	    /**
	     * @type {boolean} ?
	     */
	    in_account: boolean;
	    /**
	     * @type {boolean} Membre Administrateur ?
	     */
	    is_admin: boolean;
	    /**
	     * @type {number} Année d'inscription
	     */
	    subscription: number;
	    /**
	     * @type {boolean} Indique si l'adresse mail a été validée
	     */
	    valid_email: boolean;
	    /**
	     * @type {Array<string>} ?
	     */
	    screeners: Array<string>;
	    /**
	     * @type {string} Login Twitter
	     */
	    twitterLogin: string;
	    /**
	     * @type {Stats} Les statistiques du membre
	     */
	    stats: Stats;
	    /**
	     * @type {Options} Les options de paramétrage du membre
	     */
	    options: Options;
	    /**
	     * Constructeur de la classe Membre
	     * @param data Les données provenant de l'API
	     * @returns {Member}
	     */
	    constructor(data: Obj);
	    /**
	     * Retourne les infos du membre connecté
	     * @returns {Promise<Member>} Une instance du membre connecté
	     */
	    static fetch(): Promise<Member>;
	}
	export {};

}
declare module 'UpdateAuto' {
	import { Obj } from 'Base';
	import { Show } from 'Show';
	export class UpdateAuto {
	    private static instance;
	    static intervals: Array<Obj>;
	    /**
	     * Objet Show contenant les infos de la série
	     * @type {Show}
	     */
	    private _show;
	    /**
	     * Identifiant de la série
	     * @type {number}
	     */
	    private _showId;
	    /**
	     * Flag indiquant si une config updateAuto existe déjà
	     * en mémoire
	     * @type {boolean}
	     */
	    private _exist;
	    /**
	     * Etat de la tâche de mise à jour
	     * @type {boolean}
	     */
	    private _status;
	    /**
	     * Flag indiquant si la mise à jour doit être lancée automatiquement
	     * @type {boolean}
	     */
	    private _auto;
	    /**
	     * Intervalle des mises à jour
	     * @type {number}
	     */
	    private _interval;
	    /**
	     * Timer des mises à jour
	     * @type {NodeJS.Timer}
	     */
	    private _timer;
	    /**
	     * DateTime de la dernière mise à jour
	     * @type {Date}
	     */
	    private _lastUpdate;
	    private constructor();
	    /**
	     * Retourne l'instance de l'objet de mise à jour auto des épisodes
	     * @param   {Show} s - L'objet de la série
	     * @returns {UpdateAuto}
	     */
	    static getInstance(s: Show): UpdateAuto;
	    /**
	     * _save - Sauvegarde les options de la tâche d'update
	     * auto dans l'espace de stockage de Tampermonkey
	     *
	     * @private
	     * @return {UpdateAuto} L'instance unique UpdateAuto
	     */
	    _save(): this;
	    /**
	     * Retourne l'objet Show associé
	     * @returns {Show}
	     */
	    get show(): Show;
	    /**
	     * get status - Retourne le statut de la tâche d'update auto
	     * des épisodes
	     *
	     * @return {boolean}  Le statut
	     */
	    get status(): boolean;
	    /**
	     * set status - Modifie le statut de la tâche d'update auto
	     * des épisodes
	     *
	     * @param  {boolean} status Le statut de la tâche
	     */
	    set status(status: boolean);
	    /**
	     * get auto - Flag indiquant l'autorisation de pouvoir lancer
	     * la tâche d'update auto
	     *
	     * @return {boolean}  Flag d'autorisation
	     */
	    get auto(): boolean;
	    /**
	     * set auto - Modifie l'autorisation de lancer la tâche
	     * d'update auto
	     *
	     * @param  {boolean} auto Le flag
	     */
	    set auto(auto: boolean);
	    /**
	     * get interval - Retourne l'intervalle de temps entre
	     * chaque update auto
	     *
	     * @return {number}  L'intervalle de temps en minutes
	     */
	    get interval(): number;
	    /**
	     * set interval - Définit l'intervalle de temps, en minutes,
	     * entre chaque update auto
	     *
	     * @param  {number} val L'intervalle de temps en minutes
	     */
	    set interval(val: number);
	    /**
	     * Retourne la date de la dernière mise à jour éffectuée
	     * @return {Date} La date de la dernière mise à jour
	     */
	    get lastUpdate(): Date;
	    /**
	     * changeColorBtn - Modifie la couleur du bouton d'update
	     * des épisodes sur la page Web
	     *
	     * @return {UpdateAuto} L'instance unique UpdateAuto
	     */
	    changeColorBtn(): UpdateAuto;
	    /**
	     * stop - Permet de stopper la tâche d'update auto et
	     * aussi de modifier le flag et l'intervalle en fonction
	     * de l'état de la série
	     *
	     * @return {UpdateAuto} L'instance unique UpdateAuto
	     */
	    stop(): UpdateAuto;
	    /**
	     * delete - Supprime les options d'update auto
	     * de la série de l'espace de stockage
	     *
	     * @return {UpdateAuto} L'instance unique UpdateAuto
	     */
	    delete(): UpdateAuto;
	    /**
	     * launch - Permet de lancer la tâche d'update auto
	     * des épisodes
	     *
	     * @return {UpdateAuto} L'instance unique UpdateAuto
	     */
	    launch(): UpdateAuto;
	    /**
	     * _tick: Fonction Tick pour la mise à jour des épisodes à intervalle régulère
	     * @private
	     * @returns {void}
	     */
	    private _tick;
	    /**
	     * Retourne le temps restant avant le prochain update
	     * sous forme mm:ss
	     * @returns {string}
	     */
	    remaining(): string;
	}

}
declare module 'index' {
	export {};

}
