import {Base, Obj, MediaType, HTTP_VERBS} from "./Base";
import { implAddNote } from "./Note";
import {Platform_link} from "./Episode";
import {Media} from "./Media";
import { Character } from "./Character";

export type OtherTitle = {
    language: string;
    title: string;
};
export interface implMovie {
    backdrop: string;
    director: string;
    original_release_date: Date;
    other_title: OtherTitle;
    platform_links: Array<Platform_link>;
    poster: string;
    production_year: number;
    release_date: Date;
    sale_date: Date;
    tagline: string;
    tmdb_id: number;
    trailer: string;
    url: string;
}
export enum MovieStatus {
    TOSEE = 0,
    SEEN = 1,
    DONTWANTTOSEE = 2
}
// eslint-disable-next-line no-unused-vars
export class Movie extends Media implements implAddNote {
    /***************************************************/
    /*                      STATIC                     */
    /***************************************************/

    static propsAllowedOverride: object = {
        poster: { path: 'poster' }
    };
    static overrideType = 'movies';

    /**
     * Méthode static servant à récupérer un film sur l'API BS
     * @param  {Obj} params - Critères de recherche du film
     * @param  {boolean} [force=false] - Indique si on utilise le cache ou non
     * @return {Promise<Show>}
     * @private
     */
    protected static _fetch(params: Obj, force = false): Promise<Movie> {
        return new Promise((resolve, reject) => {
            Base.callApi('GET', 'movies', 'movie', params, force)
            .then(data => resolve(new Movie(data.movie, jQuery('.blockInformations'))) )
            .catch(err => reject(err) );
        });
    }

    /**
     * Methode static servant à retourner un objet show
     * à partir de son ID
     * @param  {number} id             L'identifiant de la série
     * @param  {boolean} [force=false] Indique si on utilise le cache ou non
     * @return {Promise<Movie>}
     */
    public static fetch(id: number, force = false): Promise<Movie> {
        return Movie._fetch({id}, force);
    }

    /**
     * Méthode static servant à récupérer un film sur l'API BS à partir
     * de son identifiant TheMovieDB
     * @param id - Identifiant du film sur TheMovieDB
     * @param force - Indique si on utilise le cache ou non
     * @returns {Promise<Movie>}
     */
    public static fetchByTmdb(id: number, force = false): Promise<Movie> {
        return this._fetch({tmdb_id: id}, force);
    }

    public static search(title: string, force = false): Promise<Movie> {
        return new Promise((resolve, reject) => {
            Base.callApi(HTTP_VERBS.GET, 'movies', 'search', {title}, force)
            .then(data => {resolve(new Movie(data.movies[0]))})
            .catch(err => reject(err));
        });
    }

    /***************************************************/
    /*                  PROPERTIES                     */
    /***************************************************/

    backdrop: string;
    director: string;
    original_release_date: Date;
    other_title: OtherTitle;
    platform_links: Array<Platform_link>;
    poster: string;
    production_year: number;
    release_date: Date;
    sale_date: Date;
    tagline: string;
    tmdb_id: number;
    trailer: string;
    _posters: object;
    _local: {poster: string};

    /***************************************************/
    /*                      METHODS                    */
    /***************************************************/

    /**
     * Constructeur de la classe Movie
     * @param   {Obj} data - Les données du média
     * @param   {JQuery<HTMLElement>} element - Le DOMElement associé au média
     * @returns {Media}
     */
    constructor(data: Obj, element?: JQuery<HTMLElement>) {
        super(data, element);
        this._local = {poster: null};
        return this.fill(data);
    }
    /**
     * Remplit l'objet avec les données fournit en paramètre
     * @param  {any} data Les données provenant de l'API
     * @returns {Movie}
     * @override
     */
    fill(data: Obj): this {
        if (data.user?.in_account !== undefined) {
            data.in_account = data.user.in_account;
            delete data.user.in_account;
        }
        data.description = data.synopsis;
        delete data.synopsis;
        data.slug = data.url;
        delete data.url;

        this.backdrop = data.backdrop;
        this.director = data.director;
        this.original_release_date = new Date(data.original_release_date);
        this.other_title = data.other_title;
        this.platform_links = data.platform_links;
        this.poster = data.poster;
        this._local = {poster: this.poster};
        this.production_year = parseInt(data.production_year);
        this.release_date = new Date(data.release_date);
        this.sale_date = new Date(data.sale_date);
        this.tagline = data.tagline;
        this.tmdb_id = parseInt(data.tmdb_id);
        this.trailer = data.trailer;
        this.mediaType = {singular: MediaType.movie, plural: 'movies', className: Movie};
        super.fill(data);
        return this.save();
    }
    /**
     * Définit le film, sur le compte du membre connecté, comme "vu"
     * @returns {Promise<Movie>}
     */
    public markAsView(): Promise<this> {
        return this.changeStatus(MovieStatus.SEEN);
    }
    /**
     * Définit le film, sur le compte du membre connecté, comme "à voir"
     * @returns {Promise<Movie>}
     */
    public markToSee(): Promise<this> {
        return this.changeStatus(MovieStatus.TOSEE);
    }
    /**
     * Définit le film, sur le compte du membre connecté, comme "ne pas voir"
     * @returns {Promise<Movie>}
     */
    public markDontWantToSee(): Promise<this> {
        return this.changeStatus(MovieStatus.DONTWANTTOSEE);
    }
    /**
     * Modifie le statut du film sur le compte du membre connecté
     * @param   {number} state     Le nouveau statut du film
     * @returns {Promise<Movie>}    L'instance du film
     */
    public changeStatus(state: MovieStatus): Promise<this> {
        const self = this;
        if (!Base.userIdentified() || this.user.status === state) {
            if (Base.debug) console.info('User not identified or state is equal with user status');
            return Promise.resolve(this);
        }
        return Base.callApi(HTTP_VERBS.POST, this.mediaType.plural, 'movie', {id: this.id, state: state})
        .then((data: Obj) => {
            self.fill(data.movie);
            return this;
        })
        .catch(err => {
            console.warn("Erreur ajout film sur compte", err);
            Base.notification('Ajout du film', "Erreur lors de l'ajout du film sur votre compte");
            return this;
        });
    }
    /**
     * Retourne une image, si disponible, en fonction du format désiré
     * @param  {string = Images.formats.poster} format   Le format de l'image désiré
     * @return {Promise<string>}                         L'URL de l'image
     */
    getDefaultImage(format = 'poster'): Promise<string> {
        const initFetch: RequestInit = { // objet qui contient les paramètres de la requête
            method: 'GET',
            mode: 'cors',
            cache: 'no-cache'
        };
        return new Promise((res, rej) => {
            if (format === 'poster') {
                if (this.poster) res(this.poster);
                else {
                    const baseImgTmdb = 'https://image.tmdb.org/t/p/w500';
                    const api_key = Base.themoviedb_api_user_key;
                    const uri = `https://api.themoviedb.org/3/movie/${this.tmdb_id}?api_key=${api_key}&language=fr`;
                    // https://api.themoviedb.org/3/movie/961330?api_key=e506df46268747316e82bbd38c1a1439&language=fr
                    fetch(uri, initFetch)
                    .then((resp: Response) => {
                        if (resp.ok) {
                            return resp.json();
                        }
                        return null;
                    }).then(data => {
                        if (data == null) {
                            return rej('Response JSON error');
                        } else if (data.poster)
                            res(baseImgTmdb + data.poster);
                        else
                            rej('no data poster');
                    }).catch(err => rej(err));
                }
            }
        });
    }
    /**
     * Récupère les personnages du film
     * @returns {Promise<this>}
     */
    fetchCharacters(): Promise<this> {
        const self = this;
        return Base.callApi(HTTP_VERBS.GET, 'movies', 'characters', {id: this.id}, true)
        .then((data: Obj) => {
            self.characters = [];
            if (data?.characters?.length <= 0) {
                return self;
            }
            for (let c = 0; c < data.characters.length; c++) {
                self.characters.push(new Character(data.characters[c]));
            }
            return self;
        });
    }
    getAllPosters(): Promise<object> {
        if (this._posters) {
            return new Promise(res => res(this._posters));
        }
        const initFetch: RequestInit = { // objet qui contient les paramètres de la requête
            method: 'GET',
            mode: 'cors',
            cache: 'no-cache'
        };
        return new Promise((res, rej) => {
            const posters = {};
            if (this.poster) posters['local'] = [this._local.poster];
            const baseImgTmdb = 'https://image.tmdb.org/t/p/w500';
            const api_key = Base.themoviedb_api_user_key;
            const uri = `https://api.themoviedb.org/3/movie/${this.tmdb_id}/images?api_key=${api_key}`;
            // https://api.themoviedb.org/3/movie/961330?api_key=e506df46268747316e82bbd38c1a1439&language=fr
            fetch(uri, initFetch)
            .then((resp: Response) => {
                if (resp.ok) {
                    return resp.json();
                }
                return null;
            }).then(data => {
                if (data == null) {
                    return rej('Response JSON error');
                } else if (data.posters && data.posters.length > 0) {
                    posters['TheMovieDB'] = [];
                    for (let p = 0; p < data.posters.length; p++) {
                        posters['TheMovieDB'].push(baseImgTmdb + data.posters[p].file_path);
                    }
                }
                this._posters = posters;
                res(posters);
            }).catch(err => rej(err));
        });
    }
}