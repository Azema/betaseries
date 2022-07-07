import { Obj } from "./Base";
import { WatchedBy } from "./Episode";
import { RelatedProp, RenderHtml } from "./RenderHtml";
export declare class Next {
    id: number;
    code: string;
    date: Date;
    title: string;
    image: string;
    constructor(data: Obj);
}
export declare class User extends RenderHtml {
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
     * @returns {RenderHtml}
     */
    _initRender(): this;
}
