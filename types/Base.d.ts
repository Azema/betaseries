/// <reference types="node" />
/**
 * @module BetaSeries
 */
import { CacheUS } from "./Cache";
import { Member } from "./Member";
/**
 * Un objet Error, type ExceptionIdentification
 * @param {string} message - Le message d'erreur
 */
export declare function ExceptionIdentification(message: string): void;
/**
 * NetworkState
 * @enum
 * @alias NetworkState
 */
export declare enum NetworkState {
    'offline' = 0,
    'online' = 1
}
/**
 * NetworkStateEvents
 * @alias NetworkStateEvents
 */
export declare type NetworkStateEvents = {
    offline: () => void;
    online: () => void;
};
/**
 * EventTypes
 * @enum
 * @alias EventTypes
 */
export declare enum EventTypes {
    UPDATE = "update",
    SAVE = "save",
    ADD = "add",
    DELETE = "delete",
    ADDED = "added",
    REMOVE = "remove",
    NOTE = "note",
    ARCHIVE = "archive",
    UNARCHIVE = "unarchive",
    SHOW = "show",
    HIDE = "hide"
}
/**
 * HTTP_VERBS
 * @enum
 * @alias HTTP_VERBS
 */
export declare enum HTTP_VERBS {
    GET = "GET",
    POST = "POST",
    PUT = "PUT",
    DELETE = "DELETE",
    OPTIONS = "OPTIONS",
    HEAD = "HEAD"
}
/**
 * Rating
 * @memberof Ratings
 * @alias Rating
 */
export declare type Rating = {
    img: string;
    title: string;
};
/**
 * Ratings
 * @alias Ratings
 */
export declare type Ratings = {
    [key: string]: Rating;
};
/**
 * Obj
 * @alias Obj
 */
export declare type Obj = {
    [key: string]: any;
};
/**
 * Callback
 * @alias Callback
 */
export declare type Callback = () => void;
export declare function objToArr(obj: Base, data: Obj): Array<any>;
/**
 * Fonction servant à vérifier si une variable existe et si elle est nulle
 * @param val - Valeur à vérifier
 * @returns {boolean}
 */
export declare function isNull(val: any): boolean;
/**
 * Interface FetchTimeout
 * @alias FetchTimeout
 * @see fetchTimeout
 */
export declare type FetchTimeout = {
    abort: () => void;
    ready: () => Promise<Response>;
};
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
     * @static
     * @param   {Function} fn - Fonction callback de référence
     * @param   {Function[]} funcs - Tableau des fonctions
     * @returns {boolean}
     */
    static fnAlreadyInclude(fn: any, funcs: Array<any>): boolean;
    /**
     * @callback thenCallback
     * @param   {Obj} data - Les données
     * @returns {void}
     */
    /**
     * @callback catchCallback
     * @param   {?(string | Error)} reason - La raison de l'échec
     * @returns {(void | PromiseLike<never>)}
     */
    /**
     * @callback finallyCallback
     * @returns {void}
     */
    /**
     * Tableau des fonctions callback de type **then**
     * @type {thenCallback[]}
     */
    thenQueue: Array<(data: Obj) => void>;
    /**
     * Tableau des fonctions callback de type **catch**
     * @type {catchCallback[]}
     */
    catchQueue: Array<(reason: any) => void>;
    /**
     * Tableau des fonctions callback de type **finally**
     * @type {finallyCallback[]}
     */
    finallyQueue: Array<() => void>;
    /**
     * @callback apiCallback
     * @param   {?string} reason - Une raison d'échec
     * @returns {Promise<Obj>}
     */
    /**
     * Fonction qui sera executée lors de l'appel à la méthode **launch**
     * @see FakePromise.launch
     * @type {apiCallback}
     */
    promiseFunc: (reason?: string) => Promise<Obj>;
    /**
     * Constructor
     * @param   {apiCallback} [func] - Fonction promise qui sera executée plus tard
     * @returns {FakePromise}
     */
    constructor(func?: (reason?: string) => Promise<Obj>);
    /**
     * Permet de définir la fonction qui retourne la vraie promesse
     * @param   {apiCallback} func - Fonction promise qui sera executée plus tard
     * @returns {FakePromise}
     */
    setFunction(func: (reason?: string) => Promise<Obj>): FakePromise;
    /**
     * Simule un objet promise et stocke les fonctions pour plus tard
     * @param   {thenCallback} onfulfilled - Fonction appelée lorsque la promesse est tenue
     * @param   {?catchCallback} onrejected - Fonction appelée lorsque la promesse est rejetée
     * @returns {FakePromise}
     */
    then(onfulfilled?: (data: Obj) => void, onrejected?: (reason: any) => void | PromiseLike<never>): FakePromise;
    /**
     * Simule un objet promise et stocke les fonctions pour plus tard
     * @param   {catchCallback} onrejected - Fonction appelée lorsque la promesse est rejetée
     * @returns {FakePromise}
     */
    catch(onrejected?: (reason: any) => void | PromiseLike<never>): FakePromise;
    /**
     * Simule un objet promise et stocke les fonctions pour plus tard
     * @param   {finallyCallback} onfinally - Fonction appelée lorsque la promesse est terminée
     * @returns {FakePromise}
     */
    finally(onfinally?: () => void): FakePromise;
    /**
     * Rejet de la promise
     * @param reason - Le raison du rejet de la promise
     * @returns {Promise<void>}
     */
    reject(reason: string): Promise<void | Obj>;
    /**
     * Permet de lancer la fonction qui retourne la vraie promesse
     * ainsi que d'appliquer les fonctions (then, catch et finally) précédemment stockées
     * @returns {Promise<any>}
     */
    launch(): Promise<any>;
}
/**
 * Classe de base contenant essentiellement des propriétés et des méthodes statiques
 * @class
 * @abstract
 */
export declare abstract class Base {
    /**
     * Types d'évenements gérés par cette classe
     * @type {Array}
     */
    static EventTypes: Array<EventTypes>;
    /**
     * Contient les écouteurs d'évènements de l'objet
     * @type {object}
     */
    private __listeners;
    /**
     * Constructor
     * @param data - Les données provenant de l'API
     * @returns {Base}
     */
    constructor(data: Obj);
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
}
/**
 * Classe principale du projet, contenant toutes les propriétés et méthodes statiques
 * @class
 */
export declare class UsBetaSeries {
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
     * Infos du membre, si il est connecté
     * @static
     * @type {Member}
     */
    static member: Member;
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
     * @see UsBetaSeries.authenticate
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
     * @param   {Obj}     [params] - Variables utilisées dans la traduction \{"%key%"": value\}
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
     * bsModule contient la correspondance entre les noms de classe et l'objet Function\
     * Cela sert aux méthodes getInstance et checkClassname
     * @static
     * @type {Record<string, any>}
     */
    static bsModule: Record<string, any>;
    /**
     * getInstance - fonction servant à instancier un objet à partir de son nom de classe
     * et de paramètres
     * @static
     * @param   {string} className - Le nom de la classe à instancier
     * @param   {Array} [args = []] - Les paramètres à fournir au constructeur
     * @returns {any} L'objet instancié
     * @throws Error
     */
    static getInstance: (className: string, ...args: any[]) => any;
    /**
     * checkClassname - Fonction servant à vérifier si la classe est connue
     * et peut être instanciée
     * @static
     * @param   {string} className - Le nom de classe à vérifier
     * @returns {boolean}
     */
    static checkClassname: (className: string) => boolean;
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
     * Flag indiquant qu'une demande d'authentification est en cours
     * @type {boolean}
     * @private
     */
    private static __checkAuthenticate;
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
    /**
     * Etat du réseau
     * @type {NetworkState}
     */
    static __networkState: NetworkState;
    /**
     * Contient l'identifiant du timer de vérification du réseau
     * @type {number}
     */
    static networkTimeout: NodeJS.Timer;
    /**
     * Stockage des appels à l'API lorsque le réseau est offline
     * @type {Object.<string, FakePromise>}
     */
    static __networkQueue: Record<string, FakePromise>;
    /**
     * Objet contenant les fonctions à exécuter lors des changements de d'état du réseau
     * @type {NetworkStateEvents}
     */
    static networkStateEventsFn: NetworkStateEvents;
    /**
     * Modifie la variable de l'état du réseau
     * Et gère les promesses d'appels à l'API lorsque le réseau est online
     * @param {NetworkState} state - Etat du réseau
     * @param {boolean} [testNetwork = false] - Flag demandant de vérifier l'état du réseau régulièrement
     */
    static changeNetworkState(state: NetworkState, testNetwork?: boolean): void;
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
