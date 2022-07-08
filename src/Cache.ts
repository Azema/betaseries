export type ObjHome = {
    [key in DataTypesCache]: any;
};
export enum DataTypesCache {
    shows = 'shows',
    episodes = 'episodes',
    movies = 'movies',
    members = 'members',
    updates = 'updateAuto',
    db = 'db'
}
/**
 * @class Gestion du Cache pour le script
 */
export class CacheUS {
    protected _data: ObjHome;

    constructor() {
        return this._init();
    }

    /**
     * Initialize le cache pour chaque type
     * @returns {CacheUS}
     */
    private _init(): this {
        this._data = {} as ObjHome;
        this._data[DataTypesCache.shows] = {};
        this._data[DataTypesCache.episodes] = {};
        this._data[DataTypesCache.movies] = {};
        this._data[DataTypesCache.members] = {};
        this._data[DataTypesCache.db] = {};
        return this;
    }

    /**
     * Returns an Array of all currently set keys.
     * @returns {Array} cache keys
     */
    keys(type = null): Array<any> {
        if (! type) return Object.keys(this._data);
        return Object.keys(this._data[type]);
    }

    /**
     * Checks if a key is currently set in the cache.
     * @param {DataTypesCache}  type Le type de ressource
     * @param {String|number}   key  the key to look for
     * @returns {boolean} true if set, false otherwise
     */
    has(type: DataTypesCache, key: string|number): boolean {
        return (this._data[type] !== undefined && this._data[type][key] !== undefined);
    }

    /**
     * Clears all cache entries.
     * @param   {DataTypesCache} [type=null] Le type de ressource à nettoyer
     * @returns {CacheUS}
     */
    clear(type: DataTypesCache = null): this {
        // On nettoie juste un type de ressource
        if (type && this._data[type] !== undefined) {
            for (const key in this._data[type]) {
                delete this._data[type][key];
            }
        }
        // On nettoie l'ensemble du cache
        else {
            this._init();
        }
        return this;
    }

    /**
     * Gets the cache entry for the given key.
     * @param {DataTypesCache}  type Le type de ressource
     * @param {String|number}   key  the cache key
     * @returns {*} the cache entry if set, or undefined otherwise
     */
    get(type: DataTypesCache, key: string|number): any {
        if (this.has(type, key)) {
            return this._data[type][key];
        }
        return null;
    }

    /**
     * Returns the cache entry if set, or a default value otherwise.
     * @param {DataTypesCache}  type Le type de ressource
     * @param {String|number}   key  the key to retrieve
     * @param {*}               def  the default value to return if unset
     * @returns {*} the cache entry if set, or the default value provided.
     */
    getOrDefault(type: DataTypesCache, key: string|number, def: any): any {
        return this.has(type, key) ? this.get(type, key) : def;
    }

    /**
     * Sets a cache entry with the provided key and value.
     * @param {DataTypesCache}  type  Le type de ressource
     * @param {String|number}   key   the key to set
     * @param {*}               value the value to set
     * @returns {CacheUS}
     */
    set(type: DataTypesCache, key: string|number, value: any): this {
        if (this._data[type] !== undefined) {
            this._data[type][key] = value;
        }
        return this;
    }

    /**
     * Removes the cache entry for the given key.
     * @param {DataTypesCache}  type  Le type de ressource
     * @param {String|number}   key the key to remove
     * @returns {CacheUS}
     */
    remove(type: DataTypesCache, key: string|number): this {
        if (this.has(type, key)) {
            delete this._data[type][key];
        }
        return this;
    }
}