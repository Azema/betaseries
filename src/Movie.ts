import {Base, Obj, MediaType, HTTP_VERBS} from "./Base";
import { implAddNote } from "./Note";
import {Platform_link} from "./Episode";
import {Media} from "./Media";

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

    /**
     * Methode static servant à retourner un objet show
     * à partir de son ID
     * @param  {number} id             L'identifiant de la série
     * @param  {boolean} [force=false] Indique si on utilise le cache ou non
     * @return {Promise<Movie>}
     */
    public static fetch(id: number, force: boolean = false): Promise<Movie> {
        return new Promise((resolve: Function, reject: Function) => {
            Base.callApi('GET', 'movies', 'movie', {id: id}, force)
            .then(data => resolve(new Movie(data.movie, jQuery('.blockInformations'))) )
            .catch(err => reject(err) );
        });
    }

    public static search(title: string, force: boolean = false): Promise<Movie> {
        return new Promise((resolve: Function, reject: Function) => {
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

    /***************************************************/
    /*                      METHODS                    */
    /***************************************************/

    /**
     * Constructeur de la classe Movie
     * @param   {Obj} data - Les données du média
     * @param   {JQuery<HTMLElement>} element - Le DOMElement associé au média
     * @returns {Media}
     */
    constructor(data: any, element?: JQuery<HTMLElement>) {
        super(data, element);
        return this.fill(data);
    }
    /**
     * Remplit l'objet avec les données fournit en paramètre
     * @param  {any} data Les données provenant de l'API
     * @returns {Movie}
     * @override
     */
    fill(data: any): this {
        if (data.user.in_account !== undefined) {
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
        const _this = this;
        if (!Base.userIdentified() || this.user.status === state) {
            if (Base.debug) console.info('User not identified or state is equal with user status');
            return Promise.resolve(this);
        }
        return Base.callApi(HTTP_VERBS.POST, this.mediaType.plural, 'movie', {id: this.id, state: state})
        .then((data: Obj) => {
            _this.fill(data.movie);
            return this;
        })
        .catch(err => {
            console.warn("Erreur ajout film sur compte", err);
            Base.notification('Ajout du film', "Erreur lors de l'ajout du film sur votre compte");
            return this;
        });
    }
}