import { Obj } from "./Base";
import { WatchedBy } from "./Episode";
export declare class Next {
    id: number;
    code: string;
    date: Date;
    title: string;
    image: string;
    constructor(data: Obj);
}
export declare class User {
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
    constructor(data: Obj);
    compare(data: Obj): boolean;
}
