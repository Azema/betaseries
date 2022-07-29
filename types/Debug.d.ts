/**
 * Code source original @link https://github.com/debug-js/debug
 */
/**
 * Classe de log pour l'affichage dans le browser
 * @class
 */
export declare class Debug {
    /**
     * Tableau des codes couleurs pour le Web
     * @type {string[]}
     */
    static colors: string[];
    /************************************/
    /************************************/
    /**
     * Tableau des namespaces qui seront affichés
     * @type {RegExp[]}
     */
    static names: RegExp[];
    /**
     * Tableau des namespaces qui ne seront pas affichés
     * @type {RegExp[]}
     */
    static skips: RegExp[];
    /**
     * @type {Storage}
     */
    static storage: Storage;
    /**
     * Chaine contenant les namespaces à afficher ou pas
     * @type {string}
     */
    static namespaces: string;
    /**
     * Delimiter des sous namespaces
     * @type {string}
     */
    static delimiter: string;
    /**
     * Flag qui indique si on doit afficher ou non la durée entre 2 logs
     * @type {boolean}
     */
    static displayTime: boolean;
    /**
     * Invokes `console.debug()` when available.
     * No-op when `console.debug` is not a "function".
     * If `console.debug` is not available, falls back
     * to `console.log`.
     *
     * @api public
     * @type {Function}
     */
    static _debug: (...args: any[]) => void;
    static _log: (...args: any[]) => void;
    static _info: (...args: any[]) => void;
    /**
     * Save `namespaces`.
     *
     * @param {String} namespaces
     * @returns {void}
     * @api private
     * @static
     */
    static save(namespaces: string): void;
    /**
     * Load `namespaces`.
     *
     * @return {String} returns the previously persisted debug modes
     * @api private
     * @static
     */
    static load(): string;
    /**
     * Enables a debug mode by namespaces. This can include modes
     * separated by a colon and wildcards.
     *
     * @param {String} namespaces
     * @returns {void}
     * @api public
     */
    static enable(namespaces: string): void;
    /**
     * Disable debug output.
     *
     * @return {String} namespaces
     * @api public
     */
    static disable(): string;
    /**
     * Convert regexp to namespace
     *
     * @param {RegExp} regxep
     * @return {String} namespace
     * @api private
     */
    static toNamespace(regexp: RegExp): string;
    /**
     * Returns true if the given mode name is enabled, false otherwise.
     *
     * @param {String} name
     * @return {Boolean}
     * @api public
     * @static
     */
    static ns_enabled(name: string): boolean;
    /**
     * Coerce `val`.
     *
     * @param {Mixed} val
     * @return {Mixed}
     * @api private
     */
    static coerce(val: any): any;
    /**
     * Map of special "%n" handling functions, for the debug "format" argument.
     *
     * Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
     * @type {Object.<string, Function>}
     */
    static formatters: Record<string, ((v: any) => string)>;
    /**
     * Selects a color for a debug namespace
     * @param {String} namespace The namespace string for the debug instance to be colored
     * @return {String} An ANSI color code for the given namespace
     * @api private
     */
    static selectColor(namespace: string): string;
    /**
     * Ajoute un formatter dans le tableau des formatters
     * @param   {string} letter - La lettre servant de flag dans le message (sans le percent) (ex: %d)
     * @param   {Function} fn - La fonction appliquée à la valeur correspondante
     * @returns {void}
     * @throws  {Error}
     */
    static addFormatter(letter: string, fn: (v: any) => string): void;
    /************************************/
    /************************************/
    /**
     * Namespace de l'instance
     * @type {string}
     */
    namespace: string;
    /**
     * Nombre de milliseconds depuis le précédent log
     * @type {number}
     */
    prevTime: number;
    /**
     * Durée entre 2 logs en milliseconds
     * @type {number}
     */
    diff: number;
    /**
     * Surcharge de l'affichage du namespace au niveau de l'instance
     * @type {boolean}
     */
    enableOverride: boolean;
    /**
     * Surcharge de l'affichage du temps entre 2 logs au niveau de l'instance
     * @type {boolean}
     */
    timeOverride: boolean;
    /**
     * Stockage de la règle d'affichage des namespaces
     * @type {string}
     */
    namespacesCache: string;
    /**
     * Stockage de l'autorisation ou non d'afficher les logs du namespace
     * @type {boolean}
     */
    enabledCache: boolean;
    /**
     * Flag indiquant si l'instance peut utiliser des couleurs
     * @type {boolean}
     */
    useColors: boolean;
    /**
     * Stockage de la couleur du namespace
     * @type {string}
     */
    color: string;
    constructor(namespace: string);
    get enabled(): boolean;
    set enabled(v: boolean);
    get time(): boolean;
    set time(v: boolean);
    _prepareLog(args: any[]): any[];
    get fnDebug(): (...args: any[]) => void;
    debug(...args: any[]): void;
    get fnLog(): (...args: any[]) => void;
    log(...args: any[]): void;
    get fnInfo(): (...args: any[]) => void;
    info(...args: any[]): void;
    /**
     * Retourne un nouveau `Debug` avec un namespace étendu
     * @param   {string} namespace
     * @param   {string} [delimiter]
     * @returns {Debug}
     */
    extend(namespace: string, delimiter?: string): Debug;
}
