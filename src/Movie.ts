/* eslint-disable @typescript-eslint/no-explicit-any */
import {Base, Obj, MediaType, HTTP_VERBS, RelatedProp} from "./Base";
import { implAddNote, Note } from "./Note";
import {Platform_link} from "./Episode";
import {Media} from "./Media";
import { Character } from "./Character";
import { User } from "./User";

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
    static selectorsCSS: Record<string, string> = {
        title: '.blockInformations h1.blockInformations__title',
        description: '.blockInformations p.blockInformations__description',
        tagline: '.blockInformations p.blockInformations__tagline',
        release_date: '.blockInformations .blockInformations__metadatas time',
        followers: '.blockInformations .blockInformations__metadatas span.u-colorWhiteOpacity05',
        director: '.blockInformations .blockInformations__details li:nth-child(#n#) sapn',
        duration: '.blockInformations .blockInformations__details li:nth-child(#n#) span',
        genres: '.blockInformations .blockInformations__details li:nth-child(#n#) span',
        language: '.blockInformations .blockInformations__details li:nth-child(#n#) span',
        /*comments: '#comments',
        characters: '#actors',
        similars: '#similars'*/
    };
    static relatedProps: Record<string, RelatedProp> = {
        // data: Obj => object: Show
        backdrop: {key: "backdrop", type: 'string', default: ''},
        comments: {key: "nbComments", type: 'number', default: 0},
        director: {key: "director", type: 'string', default: ''},
        followers: {key: "followers", type: 'number', default: 0},
        genres: {key: "genres", type: 'array', default: []},
        id: {key: "id", type: 'number'},
        imdb_id: {key: "imdb_id", type: 'string', default: ''},
        in_account: {key: "in_account", type: 'boolean', default: false},
        language: {key: "language", type: 'string', default: ''},
        length: {key: "duration", type: 'number', default: 0},
        notes: {key: "objNote", type: Note},
        original_release_date: {key: "original_release_date", type: 'date'},
        original_title: {key: "original_title", type: 'string', default: ''},
        other_title: {key: "other_title", type: 'object', default: {}},
        platform_links: {key: "platforms", type: 'array', default: []},
        poster: {key: "poster", type: 'string', default: ''},
        production_year: {key: "production_year", type: 'number', default: 0},
        release_date: {key: "release_date", type: 'date'},
        resource_url: {key: "resource_url", type: 'string', default: ''},
        sale_date: {key: "sale_date", type: 'date'},
        similars: {key: "nbSimilars", type: 'number', default: 0},
        synopsis: {key: "description", type: 'string', default: ''},
        tagline: {key: "tagline", type: 'string', default: ''},
        title: {key: "title", type: 'string', default: ''},
        tmdb_id: {key: "tmdb_id", type: 'number', default: 0},
        trailer: {key: "trailer", type: 'string', default: ''},
        url: {key: 'slug', type: 'string', default: ''},
        user: {key: "user", type: User}
    };

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
        data.in_account = data.user?.in_account;
        super(data, element);
        this._local = {poster: null};
        this.platform_links = [];
        this.mediaType = {singular: MediaType.movie, plural: 'movies', className: Movie};
        return this.fill(data)._initRender();
    }
    _initRender(): this {
        if (!this.elt) {
            return;
        }
        super._initRender();
        // title
        const $title = jQuery(Movie.selectorsCSS.title);
        if ($title.length > 0) {
            const title = $title.text();
            $title.empty().append(`<span class="title">${title}</span>`);
            Movie.selectorsCSS.title += ' span.title';
        }
        const $synopsis = jQuery('.blockInformations .blockInformations__synopsis');
        if ($synopsis.length === 2) {
            $synopsis.first().addClass('blockInformations__tagline');
            $synopsis.last().addClass('blockInformations__description');
        } else {
            $synopsis.first().addClass('blockInformations__description');
        }
        const $details = jQuery('.blockInformations__details li', this.elt);
        for (let d = 0, _len = $details.length; d < _len; d++) {
            const $li = jQuery($details.get(d));
            if ($li.get(0).classList.length <= 0) {
                const title = $li.find('strong').text().trim().toLowerCase();
                switch (title) {
                    case 'réalisateur':
                        Movie.selectorsCSS.director = Movie.selectorsCSS.director.replace('#n#', (d+1).toString());
                        break;
                    case 'genres':
                        Media.selectorsCSS.genres = Media.selectorsCSS.genres.replace('#n#', (d+1).toString());
                        Movie.selectorsCSS.genres = Movie.selectorsCSS.genres.replace('#n#', (d+1).toString());
                        break;
                    case 'durée': {
                        Media.selectorsCSS.duration = Media.selectorsCSS.duration.replace('#n#', (d+1).toString());
                        Movie.selectorsCSS.duration = Movie.selectorsCSS.duration.replace('#n#', (d+1).toString());
                        break;
                    }
                    case 'langue':
                        Movie.selectorsCSS.language = Movie.selectorsCSS.language.replace('#n#', (d+1).toString());
                        break;
                    default:
                        break;
                }
            }
        }
        return this;
    }
    updatePropRenderFollowers(): void {
        const $followers = jQuery(Movie.selectorsCSS.followers);
        if ($followers.length > 0) {
            let text = `${this.followers.toString()} membre${this.followers > 1 ? 's' : ''}`;
            $followers.attr('title', text);
            if (this.followers >= 1000) {
                const thousand = Math.round(this.followers / 1000);
                text = `${thousand.toString()}K membres`;
            }
            $followers.text(text);
        }
        delete this.__changes.followers;
    }
    // release_date
    updatePropRenderReleaseDate(): void {
        const $releaseDate = jQuery(Movie.selectorsCSS.release_date);
        if ($releaseDate.length > 0) {
            $releaseDate.text(this.release_date.format('dd mmmm yyyy'));
        }
        delete this.__changes.release_date;
    }
    updatePropRenderDuration(): void {
        const $duration = jQuery(Movie.selectorsCSS.duration);
        if ($duration.length > 0) {
            let minutes = this.duration / 60;
            let hours = minutes / 60;
            let text = '';
            if (hours >= 1) {
                hours = Math.floor(hours);
                minutes = ((minutes / 60) - hours) * 60;
                text += `${hours.toString()} heure${hours > 1 ? 's':''} `;
            }
            text += `${minutes.toFixed().padStart(2, '0')} minutes`;
            $duration.text(text);
        }
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
        if (this.__fetches.characters) return this.__fetches.characters;
        this.__fetches.characters = Base.callApi(HTTP_VERBS.GET, 'movies', 'characters', {id: this.id}, true)
        .then((data: Obj) => {
            self.characters = [];
            if (data?.characters?.length <= 0) {
                return self;
            }
            for (let c = 0; c < data.characters.length; c++) {
                self.characters.push(new Character(data.characters[c]));
            }
            return self;
        }).finally(() => delete this.__fetches.characters);
        return this.__fetches.characters;
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