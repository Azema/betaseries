import { Obj } from "./Base";
import { WatchedBy } from "./Episode";
import { RelatedProp, RenderHtml } from "./RenderHtml";

export class Next {
    id: number;
    code: string;
    date: Date;
    title: string;
    image: string;

    constructor(data: Obj) {
        this.id = (data.id != undefined) ? parseInt(data.id, 10) : NaN;
        this.code = data.code;
        this.date = new Date(data.date) || null;
        this.title = data.title;
        this.image = data.image;
    }
}
export class User extends RenderHtml {
    static relatedProps: Record<string, RelatedProp> = {
        archived: {key: "archived", type: 'boolean', default: false},
        downloaded: {key: "downloaded", type: 'boolean', default: false},
        favorited: {key: "favorited", type: 'boolean', default: false},
        friends_want_to_watch: {key: "friends_want_to_watch", type: 'array', default: []},
        friends_watching: {key: "friends_watched", type: 'array', default: []},
        hidden: {key: "hidden", type: 'boolean', default: false},
        last: {key: 'last', type: 'string', default: ''},
        mail: {key: "mail", type: 'boolean', default: false},
        next: {key: "next", type: Next},
        profile: {key: 'profile', type: 'string', default: ''},
        remaining: {key: "remaining", type: 'number', default: 0},
        seen: {key: "seen", type: 'boolean', default: false},
        status: {key: "status", type: 'number', default: 0},
        tags: {key: 'tags', type: 'string', default: ''},
        twitter: {key: "twitter", type: 'boolean', default: false}
    };
    static selectorsCSS: Record<string, string> = {};

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
    constructor(data: Obj) {
        super(data, null);
        return this.fill(data)._initRender();
    }

    /**
     * Initialise le rendu HTML de la saison
     * @returns {RenderHtml}
     */
    _initRender(): this {
        return this;
    }
}