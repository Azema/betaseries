/// <reference types="node" />
import { CacheUS } from "./Cache";
import { Character } from "./Character";
import { CommentsBS } from "./Comments";
import { implAddNote, Note } from "./Note";
import { User } from "./User";
export declare function ExceptionIdentification(message: string): void;
declare type Class<T> = new (...args: any[]) => T;
export declare enum NetworkState {
    'offline' = 0,
    'online' = 1
}
export declare enum MediaType {
    show = "show",
    movie = "movie",
    episode = "episode"
}
export declare type MediaTypes = {
    singular: MediaType;
    plural: string;
    className: Class<Base>;
};
export declare enum EventTypes {
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
export declare enum HTTP_VERBS {
    GET = "GET",
    POST = "POST",
    PUT = "PUT",
    DELETE = "DELETE",
    OPTIONS = "OPTIONS",
    HEAD = "HEAD"
}
export declare type Rating = {
    img: string;
    title: string;
};
export declare type Ratings = {
    [key: string]: Rating;
};
export declare type Obj = {
    [key: string]: any;
};
export declare type Callback = () => void;
export declare type Changes = {
    oldValue: any;
    newValue: any;
};
export declare type RelatedProp = {
    key: string;
    type: any;
    default?: any;
    transform?: (obj: object, data: Obj) => any;
};
export declare function objToArr(obj: Base, data: Obj): Array<any>;
export declare function isNull(val: any): boolean;
/**
 * FakePromise - Classe servant à simuler une promesse
 * d'appel à l'API lorsque le réseau est offline et
 * de réaliser le souhait lorsque le réseau est online
 * @class
 */
export declare class FakePromise {
    /**
     * Permet de vérifier si la fonction se trouve déjà dans le
     * tableau des fonctions callback
     * @param   {any} fn - Fonction callback de référence
     * @param   {any[]} funcs - Tableau des fonctions
     * @returns {boolean}
     */
    static fnAlreadyInclude(fn: any, funcs: Array<any>): boolean;
    /**
     * Tableau des fonctions callback de type **then**
     * @type {Array<(data: Obj) => void>}
     */
    thenQueue: Array<(data: Obj) => void>;
    /**
     * Tableau des fonctions callback de type **catch**
     * @type {Array<(reason: any) => void>}
     */
    catchQueue: Array<(reason: any) => void>;
    /**
     * Tableau des fonctions callback de type **finally**
     * @type {Array<() => void>}
     */
    finallyQueue: Array<() => void>;
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
    constructor(func?: (reason?: string) => Promise<Obj>);
    /**
     * Permet de définir la fonction qui retourne la vraie promesse
     * @param   {() => Promise<Obj>} func Fonction promise qui sera executée plus tard
     * @returns {FakePromise}
     */
    setFunction(func: (reason?: string) => Promise<Obj>): FakePromise;
    /**
     * Simule un objet promise et stocke les fonctions pour plus tard
     * @param   {(data: Obj) => void} onfulfilled - Fonction appelée lorsque la promesse est tenue
     * @param   {(reason: any) => PromiseLike<never>} [onrejected] - Fonction appelée lorsque la promesse est rejetée
     * @returns {FakePromise}
     */
    then(onfulfilled?: (data: Obj) => void, onrejected?: (reason: any) => void | PromiseLike<never>): FakePromise;
    /**
     * Simule un objet promise et stocke les fonctions pour plus tard
     * @param   {(reason: any) => void | PromiseLike<void>} [onrejected] - Fonction appelée lorsque la promesse est rejetée
     * @returns {FakePromise}
     */
    catch(onrejected?: (reason: any) => void | PromiseLike<never>): FakePromise;
    /**
     * Simule un objet promise et stocke les fonctions pour plus tard
     * @param   {() => void} [onfinally] - Fonction appelée lorsque la promesse est terminée
     * @returns {FakePromise}
     */
    finally(onfinally?: () => void): FakePromise;
    /**
     * Rejet de la promise
     * @param reason - Le raison du rejet de la promise
     * @returns {Promise<void | Obj>}
     */
    reject(reason: string): Promise<void | Obj>;
    /**
     * Permet de lancer la fonction qui retourne la vraie promesse
     * ainsi que d'appliquer les fonctions (then, catch et finally) précédemment stockées
     * @returns {Promise<any>}
     */
    launch(): Promise<any>;
}
export declare abstract class Base implements implAddNote {
    /**
     * Flag de debug pour le dev
     * @static
     * @type {boolean}
     */
    static debug: boolean;
    /**
     * L'objet cache du script pour stocker les données
     * @static
     * @type {CacheUS}
     */
    static cache: CacheUS;
    /**
     * Objet contenant les informations de l'API
     * @static
     * @type {Obj}
     */
    static api: Obj;
    /**
     * Le token d'authentification de l'API BetaSeries
     * @static
     * @type {String}
     */
    static token: string;
    /**
     * La clé d'utilisation de l'API BetaSeries
     * @static
     * @type {String}
     */
    static userKey: string;
    /**
     * L'identifiant du membre connecté
     * @static
     * @type {Number}
     */
    static userId: number;
    /**
     * Clé d'authentification pour l'API TheMovieDB
     * @static
     * @type {string}
     */
    static themoviedb_api_user_key: string;
    /**
     * Compteur d'appels à l'API
     * @static
     * @type {Number}
     */
    static counter: number;
    /**
     * L'URL de base du serveur contenant les ressources statiques
     * et les proxy
     * @static
     * @type {String}
     */
    static serverBaseUrl: string;
    /**
     * L'URL de base du serveur pour l'authentification
     * @static
     * @see Base.authenticate
     * @type {String}
     */
    static serverOauthUrl: string;
    /**
     * Indique le theme d'affichage du site Web (light or dark)
     * @static
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
    /**
     * Méthode servant à afficher le loader sur la page Web
     * @static
     */
    static showLoader(): void;
    /**
     * Méthode servant à masque le loader sur la page Web
     * @static
     */
    static hideLoader(): void;
    /**
     * Fonction d'authentification à l'API BetaSeries
     * @static
     * @return {Promise}
     */
    static authenticate(): Promise<string>;
    /**
     * @type {boolean} Flag indiquant qu'une demande d'authentification est en cours
     */
    static __checkAuthenticate: boolean;
    /**
     * Nombre de timeout consécutifs lors des appels à l'API
     * @type {number}
     * @private
     * @static
     */
    private static __nbNetTimeout;
    private static __maxTimeout;
    /**
     * Durée du timeout des requêtes à l'API exprimé en secondes
     * @type {number}
     */
    static timeoutRequests: number;
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
    static callApi(type: string, resource: string, action: string, args: Obj, force?: boolean): Promise<Obj>;
    /**
     * *setPropValue* - Permet de modifier la valeur d'une propriété dans un objet,
     * ou dans un sous objet de manière dynamique
     * @param obj - Objet à modifier
     * @param key - chemin d'accès à la propriété à modifier
     * @param val - Nouvelle valeur de la propriété
     */
    static setPropValue(obj: object, key: string, val: string): void;
    /**
     * *replaceParams* - Permet de remplacer des paramètres par des valeurs dans une chaîne de caractères
     * @param   {string} path -   Chaine à modifier avec les valeurs
     * @param   {object} params - Objet contenant les paramètres autorisés et leur type
     * @param   {object} data -   Objet contenant les valeurs des paramètres
     * @returns {string}
     */
    static replaceParams(path: string, params: object, data: object): string;
    static relatedProps: Record<string, RelatedProp>;
    static selectorsCSS: Record<string, string>;
    /**
     * Etat du réseau
     * @type {NetworkState}
     */
    static networkState: NetworkState;
    static networkTimeout: NodeJS.Timer;
    /**
     * Stockage des appels à l'API lorsque le réseau est offline
     * @type {Record<string, FakePromise>}
     */
    static __networkQueue: Record<string, FakePromise>;
    /**
     * Modifie la variable de l'état du réseau
     * Et gère les promesses d'appels à l'API lorsque le réseau est online
     * @param {NetworkState} state - Etat du réseau
     * @param {boolean} testNetwork - Flag demandant de vérifier l'état du réseau régulièrement
     */
    static changeNetworkState(state: NetworkState, testNetwork?: boolean): void;
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
    private __elt;
    /**
     * @type {object} Contient les écouteurs d'évènements de l'objet
     */
    private __listeners;
    constructor(data: Obj);
    /**
     * Symbol.Iterator - Methode Iterator pour les boucles for..of
     * @returns {object}
     */
    [Symbol.iterator](): object;
    /**
     * Retourne l'objet sous forme d'objet simple, sans référence circulaire,
     * pour la méthode JSON.stringify
     * @returns {object}
     */
    toJSON(): object;
    /**
     * Remplit l'objet avec les données fournit en paramètre
     * @param  {Obj} data - Les données provenant de l'API
     * @returns {Base}
     * @virtual
     */
    fill(data: Obj): this;
    /**
     * Initialisation du rendu HTML
     * @returns {void}
     */
    _initRender(): void;
    /**
     * Met à jour le rendu HTML des propriétés de l'objet,
     * si un sélecteur CSS exite pour la propriété fournit en paramètre\
     * **Méthode appelée automatiquement par le setter de la propriété**
     * @see Show.selectorsCSS
     * @param   {string} propKey - La propriété de l'objet à mettre à jour
     * @returns {void}
     */
    updatePropRender(propKey: string): void;
    /**
     * Met à jour les informations de la note du média sur la page Web
     */
    updatePropRenderObjNote(): void;
    /**
     * Met à jour le titre du média sur la page Web
     */
    updatePropRenderTitle(): void;
    /**
     * Indique si cet objet a été modifié
     * @returns {boolean}
     */
    isModified(): boolean;
    /**
     * Retourne les changements apportés à cet objet
     * @returns {Record<string, Changes>}
     */
    getChanges(): Record<string, Changes>;
    /**
     * Indique si la propriété passée en paramètre a été modifiée
     * @param   {string} propKey - La propriété ayant potentiellement été modifiée
     * @returns {boolean}
     */
    hasChange(propKey: string): boolean;
    /**
     * Retourne l'objet Changes correspondant aux changements apportés à la propriété passée en paramètre
     * @param   {string} propKey - La propriété ayant été modifiée
     * @returns {Changes} L'objet Changes correspondant aux changement
     */
    getChange(propKey: string): Changes;
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
     * Permet d'ajouter un listener sur plusieurs types d'évenements
     * @param  {EventTypes[]} names -   Le type d'évenement
     * @param  {Function} fn -          La fonction à appeler
     * @param  {any[]} [args] -         Paramètres optionnels
     * @return {Base} L'instance du média
     * @sealed
     */
    addListeners(names: EventTypes[], fn: Callback, ...args: any[]): this;
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
    /**
     * Méthode d'initialisation de l'objet
     * @returns {Promise<Base>}
     */
    init(): Promise<this>;
    /**
     * Sauvegarde l'objet en cache
     * @return {Base} L'instance du média
     */
    save(): this;
    /**
     * Retourne le DOMElement de référence du média
     * @returns {JQuery<HTMLElement>} Le DOMElement jQuery
     */
    get elt(): JQuery<HTMLElement>;
    /**
     * Définit le DOMElement de référence du média\
     * Nécessaire **uniquement** pour le média principal de la page Web\
     * Il sert à mettre à jour les données du média sur la page Web
     * @param  {JQuery<HTMLElement>} elt - DOMElement auquel est rattaché le média
     */
    set elt(elt: JQuery<HTMLElement>);
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
     * Ajoute le nombre de votes, à la note, dans l'attribut title de la balise
     * contenant la représentation de la note du média
     *
     * @param  {boolean} [change=true] - Indique si on doit changer l'attribut title du HTMLElement
     * @return {string} Le titre modifié de la note
     */
    changeTitleNote(change?: boolean): string;
    /**
     * Ajoute le vote du membre connecté pour le média
     * @param   {number} note - Note du membre connecté pour le média
     * @returns {Promise<boolean>}
     */
    addVote(note: number): Promise<boolean>;
    /**
     * *fetchCharacters* - Récupère les acteurs du média
     * @abstract
     * @returns {Promise<this>}
     */
    fetchCharacters(): Promise<this>;
    /**
     * *getCharacter* - Retourne un personnage à partir de son identifiant
     * @param   {number} id - Identifiant du personnage
     * @returns {Character | null}
     */
    getCharacter(id: number): Character | null;
}
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
export {};
