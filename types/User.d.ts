import { Obj } from "./Base";
import { WatchedBy } from "./Episode";
import { RelatedProp, RenderHtml } from "./RenderHtml";
/**
 * Next
 * @class
 * @memberof User
 */
export declare class Next {
    id: number;
    code: string;
    date: Date;
    title: string;
    image: string;
    constructor(data: Obj);
}
/**
 * User
 * @class
 * @extends RenderHtml
 */
export declare class User extends RenderHtml {
    static logger: import("./Debug").Debug;
    static debug: any;
    /**
     * Objet contenant les relations entre les données de l'API BS et la classe User
     * @type {Record<string, RelatedProp>}
     * @static
     */
    static relatedProps: Record<string, RelatedProp>;
    static selectorsCSS: Record<string, string>;
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
    screeners: Array<any>;
    seen: boolean;
    status: number;
    tags: string;
    twitter: boolean;
    /**
     * Constructeur de la classe User
     * @param   {Obj} data - Les données de l'objet
     * @returns {User}
     */
    constructor(data: Obj);
    /**
     * Initialise le rendu HTML de la saison
     * @returns {User}
     */
    _initRender(): this;
}
