import { isNull, Obj } from "./Base";
import { WatchedBy } from "./Episode";

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

    constructor(data: Obj) {
        this.archived = (data.archived !== undefined) ? !!data.archived : false;
        this.downloaded = (data.downloaded !== undefined) ? !!data.downloaded : false;
        this.favorited = (data.favorited !== undefined) ? !!data.favorited : false;
        this.friends_want_to_watch = data.friends_want_to_watch || [];
        this.friends_watched = data.friends_watched || [];
        this.hidden = (data.hidden !== undefined) ? !!data.hidden : false;
        this.last = data.last || '';
        this.mail = (data.mail !== undefined) ? !!data.mail : false;
        this.next = null;
        if (!isNull(data.next)) {
            this.next = new Next(data.next);
        }
        this.profile = data.profile || '';
        this.remaining = data.remaining || 0;
        this.seen = !!data.seen || false;
        this.status = (data.status !== undefined) ? parseInt(data.status, 10) : 0;
        this.tags = data.tags || '';
        this.twitter = !!data.twitter || false;
    }
    compare(data: Obj): boolean {
        const props = Object.getOwnPropertyNames(this);
        for (const prop of props) {
            if (typeof this[prop] !== 'object' && Object.hasOwn(data, prop) && this[prop] != data[prop]) {
                return true;
            }
        }
        return false;
    }
}