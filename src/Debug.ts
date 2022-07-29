/**
 * Code source original @link https://github.com/debug-js/debug
 */

/**
 * Retourne le nombre de millisecondes sous forme de durée
 * @param   {number} ms
 * @returns {string}
 */
function humanize(ms: number): string {
    const s = 1000;
    const m = s * 60;
    const h = m * 60;
    const d = h * 24;

    const msAbs = Math.abs(ms);
    if (msAbs >= d) {
        return `${Math.round(ms / d)}d`;
    }
    if (msAbs >= h) {
        return `${Math.round(ms / h)}h`;
    }
    if (msAbs >= m) {
        return `${Math.round(ms / m)}m`;
    }
    if (msAbs >= s) {
        return `${Math.round(ms / s)}s`;
    }
    return `${ms}ms`;
}

/**
 * Colorize log arguments if enabled.
 *
 * @api public
 * @this {Debug}
 */
function formatArgs(args: any[]): void {
    /** @type {Debug} */
    const self: Debug = this;
    // console.log('formatArgs args[0]: ', args[0]);
    if (!self.useColors) {
        args[0] = `${self.namespace} ${args[0]}`;
        if (self.time)
            args[0] += ' +' + humanize(self.diff);
        return;
    }
    const c = 'color: ' + self.color,
          cInherit = 'color:inherit',
          indexesColor: number[] = []; // Stocke les index de position des flags de style du message original
    let flagColor = false;
    // On vérifie la présence de flag style dans le message original
    if (/%c/.test(args[0])) {
        flagColor = true;
        let index = 0;
        args[0].replace(/%[a-zA-Z%]/g, (match: string) => {
            if (match === '%%') {
                return;
            }
            index++;
            if (match === '%c') {
                indexesColor.push(index + 2); // On tient compte des ajouts
            }
        });
        if ((indexesColor.length % 2) !== 0) {
            // Il n'y a pas de flagColor de fermeture
            args[0] += '%c';
            indexesColor.push(++index + 2);
            args.splice(index, 0, cInherit);
        }
        // console.log('formatArgs: flagColor found', {indexesColor});
    }
    args[0] = `%c${self.namespace}%c ${args[0]}`;
    if (Debug.displayTime)
        args[0] += '%c +' + humanize(self.diff) + '%c';

    // On ajoute les styles dans les le tableaux des arguments
    let index = 0,
        indexColor = 0;
    args[0].replace(/%[a-zA-Z%]/g, (match: string) => {
        if (match === '%%') {
            return;
        }
        index++;
        if (match === '%c' && (!flagColor || (flagColor && !indexesColor.includes(index)))) {
            indexColor++;
            args.splice(index, 0, (indexColor % 2 === 1) ? c : cInherit);
        }
    });
}

/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */
const useColors = (): boolean => {
    // NB: In an Electron preload script, document will be defined but not fully
    // initialized. Since we know we're in Chrome, we'll just detect this case
    // explicitly
    if (typeof window !== 'undefined' && window.process &&
        (window.process['type'] === 'renderer' || window.process['__nwjs']))
    {
        return true;
    }
    const ua: string = navigator?.userAgent;
    // Internet Explorer and Edge do not support colors.
    if (typeof navigator !== 'undefined' && ua &&
        /(edge|trident)\/(\d+)/.test(ua.toLowerCase()))
    {
        return false;
    }

    // Is webkit? http://stackoverflow.com/a/16459606/376773
    // document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
    return ((typeof document !== 'undefined' && document.documentElement && document.documentElement.style &&
        document.documentElement.style['WebkitAppearance']) ||
        // Is firebug? http://stackoverflow.com/a/398120/376773
        (typeof window !== 'undefined' && window.console && (window.console['firebug'] ||
            (window.console['exception'] && window.console.table))) ||
        // Is firefox >= v31?
        // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
        (typeof navigator !== 'undefined' && ua &&
            /firefox\/(\d+)/.test(ua.toLowerCase()) && parseInt(RegExp.$1, 10) >= 31) ||
        // Double check webkit in userAgent just in case we are in a worker
        (typeof navigator !== 'undefined' && ua && /applewebkit\/(\d+)/.test(ua.toLowerCase()))
    );
};

/**
 * Classe de log pour l'affichage dans le browser
 * @class
 */
export class Debug {
    /**
     * Tableau des codes couleurs pour le Web
     * @type {string[]}
     */
    static colors: string[] = [
        '#0000CC',
        '#0000FF',
        '#0033CC',
        '#0033FF',
        '#0066CC',
        '#0066FF',
        '#0099CC',
        '#0099FF',
        '#00CC00',
        '#00CC33',
        '#00CC66',
        '#00CC99',
        '#00CCCC',
        '#00CCFF',
        '#3300CC',
        '#3300FF',
        '#3333CC',
        '#3333FF',
        '#3366CC',
        '#3366FF',
        '#3399CC',
        '#3399FF',
        '#33CC00',
        '#33CC33',
        '#33CC66',
        '#33CC99',
        '#33CCCC',
        '#33CCFF',
        '#6600CC',
        '#6600FF',
        '#6633CC',
        '#6633FF',
        '#66CC00',
        '#66CC33',
        '#9900CC',
        '#9900FF',
        '#9933CC',
        '#9933FF',
        '#99CC00',
        '#99CC33',
        '#CC0000',
        '#CC0033',
        '#CC0066',
        '#CC0099',
        '#CC00CC',
        '#CC00FF',
        '#CC3300',
        '#CC3333',
        '#CC3366',
        '#CC3399',
        '#CC33CC',
        '#CC33FF',
        '#CC6600',
        '#CC6633',
        '#CC9900',
        '#CC9933',
        '#CCCC00',
        '#CCCC33',
        '#FF0000',
        '#FF0033',
        '#FF0066',
        '#FF0099',
        '#FF00CC',
        '#FF00FF',
        '#FF3300',
        '#FF3333',
        '#FF3366',
        '#FF3399',
        '#FF33CC',
        '#FF33FF',
        '#FF6600',
        '#FF6633',
        '#FF9900',
        '#FF9933',
        '#FFCC00',
        '#FFCC33'
    ];

    /************************************/
    /*              Static              */
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
    static storage: Storage = localStorage;
    /**
     * Chaine contenant les namespaces à afficher ou pas
     * @type {string}
     */
    static namespaces: string;
    /**
     * Delimiter des sous namespaces
     * @type {string}
     */
    static delimiter = ':';
    /**
     * Flag qui indique si on doit afficher ou non la durée entre 2 logs
     * @type {boolean}
     */
    static displayTime = false;
    /**
     * Invokes `console.debug()` when available.
     * No-op when `console.debug` is not a "function".
     * If `console.debug` is not available, falls back
     * to `console.log`.
     *
     * @api public
     * @type {Function}
     */
    static _debug: (...args: any[]) => void = console.debug || console.log;
    static _log: (...args: any[]) => void = console.log;
    static _info: (...args: any[]) => void = console.info;
    /**
     * Save `namespaces`.
     *
     * @param {String} namespaces
     * @returns {void}
     * @api private
     * @static
     */
    static save(namespaces: string): void {
        try {
            if (namespaces) {
                Debug.storage.setItem('debug', namespaces);
            } else {
                Debug.storage.removeItem('debug');
            }
        } catch (error) {
            // Swallow
            // XXX (@Qix-) should we be logging these?
        }
    }
    /**
     * Load `namespaces`.
     *
     * @return {String} returns the previously persisted debug modes
     * @api private
     * @static
     */
    static load(): string {
        let r: string;
        try {
            r = Debug.storage.getItem('debug');
        } catch (error) {
            // Swallow
            // XXX (@Qix-) should we be logging these?
            r = '';
        }

        return r;
    }
    /**
     * Enables a debug mode by namespaces. This can include modes
     * separated by a colon and wildcards.
     *
     * @param {String} namespaces
     * @returns {void}
     * @api public
     */
    static enable(namespaces: string): void {
        Debug.save(namespaces);
        Debug.namespaces = namespaces;

        Debug.names = [];
        Debug.skips = [];

        const split = (typeof namespaces === 'string' ? namespaces : '').split(/[\s,]+/);
        const len = split.length;

        for (let i = 0; i < len; i++) {
            if (!split[i]) {
                // ignore empty strings
                continue;
            }

            namespaces = split[i].replace(/\*/g, '.*?');

            if (namespaces[0] === '-') {
                Debug.skips.push(new RegExp('^' + namespaces.slice(1) + '$'));
            } else {
                Debug.names.push(new RegExp('^' + namespaces + '$'));
            }
        }
    }
    /**
     * Disable debug output.
     *
     * @return {String} namespaces
     * @api public
     */
    static disable(): string {
        const namespaces = [
            ...Debug.names.map(Debug.toNamespace),
            ...Debug.skips.map(Debug.toNamespace).map(namespace => '-' + namespace)
        ].join(',');
        Debug.enable('');
        return namespaces;
    }
    /**
     * Convert regexp to namespace
     *
     * @param {RegExp} regxep
     * @return {String} namespace
     * @api private
     */
    static toNamespace(regexp: RegExp): string {
        return regexp.toString()
            .substring(2, regexp.toString().length - 2)
            .replace(/\.\*\?$/, '*');
    }
    /**
     * Returns true if the given mode name is enabled, false otherwise.
     *
     * @param {String} name
     * @return {Boolean}
     * @api public
     * @static
     */
    static ns_enabled(name: string): boolean {
        if (name[name.length - 1] === '*') {
            return true;
        }

        let i: number, len: number;

        for (i = 0, len = Debug.skips.length; i < len; i++) {
            if (Debug.skips[i].test(name)) {
                return false;
            }
        }

        for (i = 0, len = Debug.names.length; i < len; i++) {
            if (Debug.names[i].test(name)) {
                return true;
            }
        }

        return false;
    }
    /**
     * Coerce `val`.
     *
     * @param {Mixed} val
     * @return {Mixed}
     * @api private
     */
    static coerce(val: any): any {
        if (val instanceof Error) {
            return val.stack || val.message;
        }
        return val;
    }
    /**
     * Map of special "%n" handling functions, for the debug "format" argument.
     *
     * Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
     * @type {Object.<string, Function>}
     */
    static formatters: Record<string, ((v: any) => string)> = {
        /**
         * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
         */
        j: function (v: any) {
            try {
                return JSON.stringify(v);
            } catch (error) {
                return '[UnexpectedJSONParseError]: ' + error.message;
            }
        }
    };
    /**
     * Selects a color for a debug namespace
     * @param {String} namespace The namespace string for the debug instance to be colored
     * @return {String} An ANSI color code for the given namespace
     * @api private
     */
    static selectColor(namespace: string): string {
        let hash = 0;

        for (let i = 0; i < namespace.length; i++) {
            hash = ((hash << 5) - hash) + namespace.charCodeAt(i);
            hash |= 0; // Convert to 32bit integer
        }

        return Debug.colors[Math.abs(hash) % Debug.colors.length];
    }
    /**
     * Ajoute un formatter dans le tableau des formatters
     * @param   {string} letter - La lettre servant de flag dans le message (sans le percent) (ex: %d)
     * @param   {Function} fn - La fonction appliquée à la valeur correspondante
     * @returns {void}
     * @throws  {Error}
     */
    static addFormatter(letter: string, fn: (v: any) => string): void {
        // On supprime le prefix '%' si il y est
        if (/^%/.test(letter)) letter = letter.substring(1);
        const letterFormatters = Object.keys(Debug.formatters);
        if (letterFormatters.includes(letter)) {
            throw new Error(`this letter(${letter}) of formatter already exists`);
        }
        Debug.formatters[letter] = fn;
    }

    /************************************/
    /*          Properties              */
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
    enableOverride: boolean = undefined;
    /**
     * Surcharge de l'affichage du temps entre 2 logs au niveau de l'instance
     * @type {boolean}
     */
    timeOverride: boolean = undefined;
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

    constructor(namespace: string) {
        this.useColors = useColors();
        this.color = Debug.selectColor(namespace);
        this.namespace = namespace;
        return this;
    }

    get enabled(): boolean {
        if (this.enableOverride !== undefined) {
            return this.enableOverride;
        }
        if (this.namespacesCache !== Debug.namespaces) {
            this.namespacesCache = Debug.namespaces;
            this.enabledCache = Debug.ns_enabled(this.namespace);
        }

        return this.enabledCache;
    }
    set enabled(v: boolean) {
        this.enableOverride = !!v;
    }
    get time(): boolean {
        if (this.timeOverride !== undefined) {
            return this.timeOverride;
        }
        return Debug.displayTime;
    }
    set time(v: boolean) {
        this.timeOverride = !!v;
    }

    _prepareLog(args: any[]): any[] {
        const self = this;

        if (Debug.displayTime) {
            // Set `diff` timestamp
            const curr = Date.now();
            const ms = curr - (this.prevTime || curr);
            self.diff = ms;
            // self['prev'] = this.prevTime;
            // self['curr'] = curr;
            this.prevTime = curr;
        }

        args[0] = Debug.coerce(args[0]);

        if (typeof args[0] !== 'string') {
            // Anything else let's inspect with %O
            args.unshift('%O');
        }

        // Apply any `formatters` transformations
        let index = 0;
        args[0] = (args[0] as string).replace(/%([a-zA-Z%])/g, (match: string, format: string) => {
            // If we encounter an escaped % then don't increase the array index
            if (match === '%%') {
                return '%';
            }
            index++;
            const formatter = Debug.formatters[format];
            if (typeof formatter === 'function') {
                const val = args[index];
                match = formatter.call(self, val);

                // Now we need to remove `args[index]` since it's inlined in the `format`
                args.splice(index, 1);
                index--;
            }
            return match;
        });
        // Apply env-specific formatting (colors, etc.)
        formatArgs.call(self, args);
        return args;
    }

    get fnDebug(): (...args: any[]) => void {
        return this.debug.bind(this);
    }

    debug(...args: any[]): void {
        // Disabled?
        try {
            if (!this.enabled) {
                return;
            }
        } catch (err) {
            console.error('Error debug check enabled', this, err);
        }

        Debug._debug.apply(this, this._prepareLog(args));
    }

    get fnLog(): (...args: any[]) => void {
        return this.log.bind(this);
    }

    log(...args: any[]): void {
        // Disabled?
        try {
            if (!this.enabled) {
                return;
            }
        } catch (err) {
            console.log('Error log check enabled', this, err);
        }

        Debug._log.apply(this, this._prepareLog(args));
    }

    get fnInfo(): (...args: any[]) => void {
        return this.info.bind(this);
    }

    info(...args: any[]): void {
        // Disabled?
        try {
            if (!this.enabled) {
                return;
            }
        } catch (err) {
            console.log('Error log check enabled', this, err);
        }
        // On met le message en couleur jaune
        if (typeof args[0] === 'string') {
            args[0] = '%c' + args[0];
            args.splice(1, 0, 'color:#f2ab26');
        }
        Debug._info.apply(this, this._prepareLog(args));
    }

    /**
     * Retourne un nouveau `Debug` avec un namespace étendu
     * @param   {string} namespace
     * @param   {string} [delimiter]
     * @returns {Debug}
     */
    extend(namespace: string, delimiter: string = Debug.delimiter): Debug {
        if (typeof namespace !== 'string' || namespace.length <= 0) {
            throw new Error('namespace must be a string not empty');
        }
        return new Debug([this.namespace, namespace].join(delimiter));
    }
}
