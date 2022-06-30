export interface ShowSearch {
    id: number;
    following: number;
    release_date: Date;
    poster: string;
    svods: Array<Record<string, string | number>>;
    slug: string;
    title: string;
}
export interface MovieSearch {
    id: number;
    slug: string;
    release_date: Date;
    poster: string;
    svods: Array<Record<string, string | number>>;
    title: string;
}
export declare type ResultSearch = {
    shows?: Array<ShowSearch>;
    movies?: Array<MovieSearch>;
    total: number;
    locale: string;
    limit: number;
    page: number;
};
export declare abstract class ParamsSearchAbstract {
    static valuesAllowed: Record<string, Array<string>>;
    static valuesDefault: {
        limit: 20;
        offset: 0;
        tri: 'popularite';
    };
    static separator: string;
    text: string;
    _limit: number;
    _offset: number;
    genres: Array<string>;
    _diffusions: Array<string>;
    svods: Array<number>;
    _tri: string;
    _autres: string;
    _fields: Array<string>;
    constructor();
    get limit(): number;
    set limit(limit: number);
    get offset(): number;
    set offset(offset: number);
    get diffusions(): Array<string>;
    set diffusions(diff: Array<string>);
    get tri(): string;
    set tri(val: string);
    get fields(): Array<string>;
    set fields(values: Array<string>);
    get autres(): string;
    set autres(value: string);
    abstract toRequest(): Record<string, any>;
}
export declare class ParamsSearchShows extends ParamsSearchAbstract {
    static valuesAllowed: Record<string, Array<string>>;
    _duration: string;
    _creations: Array<number>;
    _pays: Array<string>;
    chaines: Array<string>;
    constructor();
    get duration(): string;
    set duration(val: string);
    get creations(): Array<number>;
    set creations(values: Array<number>);
    get pays(): Array<string>;
    set pays(values: Array<string>);
    toRequest(): Record<string, string | number>;
}
export declare class ParamsSearchMovies extends ParamsSearchAbstract {
    static valuesAllowed: Record<string, Array<string>>;
    _releases: Array<number>;
    casting: string;
    constructor();
    get releases(): Array<number>;
    set releases(values: Array<number>);
    toRequest(): Record<string, string | number>;
}
export declare class Search {
    static searchShows(params: ParamsSearchShows): Promise<ResultSearch>;
    static getShowIds(params: ParamsSearchShows): Promise<Array<number>>;
    static searchMovies(params: ParamsSearchMovies): Promise<ResultSearch>;
}
