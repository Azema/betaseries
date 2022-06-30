declare type ObjHome = {
    [key in DataTypesCache]: any;
};
export declare enum DataTypesCache {
    shows = "shows",
    episodes = "episodes",
    movies = "movies",
    members = "members",
    updates = "updateAuto",
    db = "db"
}
/**
 * @class Gestion du Cache pour le script
 */
export declare class CacheUS {
    protected _data: ObjHome;
    constructor();
    /**
     * Initialize le cache pour chaque type
     * @returns {CacheUS}
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
     * @returns {CacheUS}
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
     * @returns {CacheUS}
     */
    set(type: DataTypesCache, key: string | number, value: any): this;
    /**
     * Removes the cache entry for the given key.
     * @param {DataTypesCache}  type  Le type de ressource
     * @param {String|number}   key the key to remove
     * @returns {CacheUS}
     */
    remove(type: DataTypesCache, key: string | number): this;
}
export {};
