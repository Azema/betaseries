/* eslint-disable @typescript-eslint/no-explicit-any */
import { Base, HTTP_VERBS, Obj } from "./Base";

export interface ShowSearch {
    id: number;
    following: number;
    release_date: Date;
    poster: string;
    svods: Array<Record<string, string|number>>;
    slug: string;
    title: string;
}
export interface MovieSearch {
    id: number;
    slug: string;
    release_date: Date;
    poster: string;
    svods: Array<Record<string, string|number>>;
    title: string;
}
export type ResultSearch = {
    shows?: Array<ShowSearch>;
    movies?: Array<MovieSearch>;
    total: number;
    locale: string;
    limit: number;
    page: number;
}
export abstract class ParamsSearchAbstract {
    static valuesAllowed: Record<string, Array<string>> = {};
    static valuesDefault: {
        limit: 20,
        offset: 0,
        tri: 'popularite'
    };
    static separator = ',';

    text: string;
    _limit: number;
    _offset: number;
    genres: Array<string>;
    _diffusions: Array<string>;
    svods: Array<number>;
    _tri: string;
    _autres: string;
    _fields: Array<string>;

    constructor() {
        this._diffusions = [];
        this._fields = [];
        this._limit = ParamsSearchAbstract.valuesDefault.limit;
        this._offset = ParamsSearchAbstract.valuesDefault.offset;
        this._tri = ParamsSearchAbstract.valuesDefault.tri;
        this.genres = [];
        this.svods = [];
    }
    get limit(): number {
        return this._limit;
    }
    set limit(limit: number) {
        if (limit <= 0 || limit > 100) {
            throw new Error("Value of parameter 'limit' is out of range (1-100)");
        }
        this._limit = limit;
    }
    get offset(): number {
        return this._offset;
    }
    set offset(offset: number) {
        if (offset <= 0 || offset > 100) {
            throw new Error("Value of parameter 'offset' is out of range (1-100)");
        }
        this._offset = offset;
    }
    get diffusions(): Array<string> {
        return this._diffusions;
    }
    set diffusions(diff: Array<string>) {
        const allowed = (this.constructor as typeof ParamsSearchAbstract).valuesAllowed.diffusions;
        this._diffusions = diff.filter(val => {
            if (!allowed.includes(val)) {
                throw new Error(`Value(${val}) of parameter 'diffusions' is not allowed`);
            }
            return true;
        });
    }
    get tri(): string {
        return this._tri;
    }
    set tri(val: string) {
        const allowed = (this.constructor as typeof ParamsSearchAbstract).valuesAllowed.tri;
        let key: string = val;
        let sort: string = null;
        if (val.indexOf('-') > 0) {
            key = val.split('-')[0];
            sort = val.split('-')[1];
        }
        if (!allowed.includes(key)) {
            throw new Error("Value of parameter 'tri' is not allowed");
        }
        if (sort && !['asc', 'desc'].includes(sort)) {
            throw new Error("Value of parameter 'sort' is not allowed");
        }
        this._tri = (sort) ? key + '-' + sort : key;
    }
    get fields(): Array<string> {
        return this._fields;
    }
    set fields(values: Array<string>) {
        const allowed = (this.constructor as typeof ParamsSearchAbstract).valuesAllowed.fields;
        this._fields = values.filter(val => {
            if (!allowed.includes(val)) {
                throw new Error(`Value(${val}) of parameter 'fields' is not allowed`);
            }
            return true;
        });
    }
    get autres(): string {
        return this._autres;
    }
    set autres(value: string) {
        const allowed = (this.constructor as typeof ParamsSearchAbstract).valuesAllowed.autres;
        if (!allowed.includes(value)) {
            throw new Error("Value of parameter 'autres' is not allowed");
        }
        this._autres = value;
    }
    abstract toRequest(): Record<string, any>;
}
export class ParamsSearchShows extends ParamsSearchAbstract {
    static valuesAllowed: Record<string, Array<string>> = {
        diffusions: ['semaine', 'fini', 'encours'],
        duration: ['1-19', '20-30', '31-40', '41-50', '51-60', '61'],
        tri: ['nom', 'suivis', 'id', 'note', 'popularite', 'release'],
        autres: ['new', 'mine'],
        fields: ['id', 'following', 'release_date', 'poster', 'svods', 'slug', 'title']
    };
    _duration: string;
    _creations: Array<number>;
    _pays: Array<string>;
    chaines: Array<string>;

    constructor() {
        super();
        this._creations = [];
        this._pays = [];
    }
    get duration(): string {
        return this._duration;
    }
    set duration(val: string) {
        if (!ParamsSearchShows.valuesAllowed.duration.includes(val)) {
            throw new Error("Value of parameter 'duration' is not allowed");
        }
        this._duration = val;
    }
    get creations(): Array<number> {
        return this._creations;
    }
    set creations(values: Array<number>) {
        this._creations = values.filter(val => {
            if (val <= 1900 || val > 2100) {
                throw new Error(`Value(${val.toString()}) of parameter 'creations' is out of range`);
            }
            return true;
        });
    }
    get pays(): Array<string> {
        return this._pays;
    }
    set pays(values: Array<string>) {
        const reg = /^\w{2}$/;
        this._pays = values
            .map(val => val.toLowerCase())
            .filter(val => {
                if (!reg.test(val)) {
                    throw new Error(`Value(${val}) of parameter 'pays' is not allowed`);
                }
                return true;
            });
    }
    toRequest(): Record<string, string|number> {
        const params: Record<string, string|number> = {};
        if (this.text && this.text.length > 0) {
            params.text = this.text;
        }
        params.limit = this._limit;
        params.offset = this._offset;
        if (this.genres && this.genres.length > 0) {
            params.genres = this.genres.join(ParamsSearchAbstract.separator);
        }
        if (this._diffusions && this._diffusions.length > 0) {
            params.diffusions = this._diffusions.join(ParamsSearchAbstract.separator);
        }
        if (this._duration && this._duration.length > 0) {
            params.duration = this._duration;
        }
        if (this.svods && this.svods.length > 0) {
            params.svods = this.svods.join(ParamsSearchAbstract.separator);
        }
        if (this._creations && this._creations.length > 0) {
            params.creations = this._creations.join(ParamsSearchAbstract.separator);
        }
        if (this._pays && this._pays.length > 0) {
            params.pays = this._pays.join(ParamsSearchAbstract.separator);
        }
        if (this.chaines && this.chaines.length > 0) {
            params.chaines = this.chaines.join(ParamsSearchAbstract.separator);
        }
        if (this._tri && this._tri.length > 0) {
            params.tri = this._tri;
        }
        if (this._autres && this._autres.length > 0) {
            params.autres = this._autres;
        }
        if (this._fields && this._fields.length > 0) {
            params.fields = this._fields.join(ParamsSearchAbstract.separator);
        }
        return params;
    }
}
export class ParamsSearchMovies extends ParamsSearchAbstract {
    static valuesAllowed: Record<string, Array<string>> = {
        diffusions: ['none', 'salles', 'vente'],
        tri: ['nom', 'ajout', 'id', 'note', 'popularite', 'release'],
        autres: ['new', 'seen', 'unseen', 'wishlist'],
        fields: ['id', 'release_date', 'poster', 'svods', 'slug', 'title']
    };
    _releases: Array<number>;
    casting: string;

    constructor() {
        super();
        this._releases = [];
    }
    get releases(): Array<number> {
        return this._releases;
    }
    set releases(values: Array<number>) {
        this._releases = values.filter(val => {
            if (val <= 1900 || val > 2100) {
                throw new Error(`Value(${val.toString()}) of parameter 'releases' is out of range`);
            }
            return true;
        });
    }
    toRequest(): Record<string, string|number> {
        const params: Record<string, string|number> = {};
        if (this.text && this.text.length > 0) {
            params.text = this.text;
        }
        params.limit = this._limit;
        params.offset = this._offset;
        if (this.genres && this.genres.length > 0) {
            params.genres = this.genres.join(ParamsSearchAbstract.separator);
        }
        if (this._diffusions && this._diffusions.length > 0) {
            params.diffusions = this._diffusions.join(ParamsSearchAbstract.separator);
        }
        if (this.casting && this.casting.length > 0) {
            params.casting = this.casting;
        }
        if (this.svods && this.svods.length > 0) {
            params.svods = this.svods.join(ParamsSearchAbstract.separator);
        }
        if (this._releases && this._releases.length > 0) {
            params.releases = this._releases.join(ParamsSearchAbstract.separator);
        }
        if (this._tri && this._tri.length > 0) {
            params.tri = this._tri;
        }
        if (this._autres && this._autres.length > 0) {
            params.autres = this._autres;
        }
        if (this._fields && this._fields.length > 0) {
            params.fields = this._fields.join(ParamsSearchAbstract.separator);
        }
        return params;
    }
}
export class Search {
    static searchShows(params: ParamsSearchShows): Promise<ResultSearch> {
        const result: ResultSearch = {
            shows: [],
            total: 0,
            locale: 'fr',
            limit: params.limit,
            page: params.offset
        };
        return Base.callApi(HTTP_VERBS.GET, 'search', 'shows', params.toRequest())
        .then((data: Obj) => {
            const keys = Object.keys(result);
            for (const key in data) {
                if (keys.indexOf(key) >= 0) result[key] = data[key];
            }
            return result;
        });
    }
    static getShowIds(params: ParamsSearchShows): Promise<Array<number>> {
        params.fields = ['id'];
        return this.searchShows(params).then((result: ResultSearch) => {
            const ids = [];
            for (const show in result.shows) {
                ids.push(result.shows[show].id);
            }
            return ids;
        })
    }
    static searchMovies(params: ParamsSearchMovies): Promise<ResultSearch> {
        const result: ResultSearch = {
            movies: [],
            total: 0,
            locale: 'fr',
            limit: params.limit,
            page: params.offset
        };
        return Base.callApi(HTTP_VERBS.GET, 'search', 'movies', params.toRequest())
        .then((data: Obj) => {
            const keys = Object.keys(result);
            for (const key in data) {
                if (keys.indexOf(key) >= 0) result[key] = data[key];
            }
            return result;
        });
    }
}