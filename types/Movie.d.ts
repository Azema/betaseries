/// <reference types="jquery" />
/// <reference types="jquery" />
/// <reference types="bootstrap" />
import { Obj, RelatedProp } from "./Base";
import { implAddNote } from "./Note";
import { Platform_link } from "./Episode";
import { Media } from "./Media";
export declare type OtherTitle = {
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
export declare enum MovieStatus {
    TOSEE = 0,
    SEEN = 1,
    DONTWANTTOSEE = 2
}
export declare class Movie extends Media implements implAddNote {
    /***************************************************/
    /***************************************************/
    static propsAllowedOverride: object;
    static overrideType: string;
    static selectorsCSS: Record<string, string>;
    static relatedProps: Record<string, RelatedProp>;
    /**
     * Méthode static servant à récupérer un film sur l'API BS
     * @param  {Obj} params - Critères de recherche du film
     * @param  {boolean} [force=false] - Indique si on utilise le cache ou non
     * @return {Promise<Show>}
     * @private
     */
    protected static _fetch(params: Obj, force?: boolean): Promise<Movie>;
    /**
     * Methode static servant à retourner un objet show
     * à partir de son ID
     * @param  {number} id             L'identifiant de la série
     * @param  {boolean} [force=false] Indique si on utilise le cache ou non
     * @return {Promise<Movie>}
     */
    static fetch(id: number, force?: boolean): Promise<Movie>;
    /**
     * Méthode static servant à récupérer un film sur l'API BS à partir
     * de son identifiant TheMovieDB
     * @param id - Identifiant du film sur TheMovieDB
     * @param force - Indique si on utilise le cache ou non
     * @returns {Promise<Movie>}
     */
    static fetchByTmdb(id: number, force?: boolean): Promise<Movie>;
    static search(title: string, force?: boolean): Promise<Movie>;
    /***************************************************/
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
    _local: {
        poster: string;
    };
    /***************************************************/
    /***************************************************/
    /**
     * Constructeur de la classe Movie
     * @param   {Obj} data - Les données du média
     * @param   {JQuery<HTMLElement>} element - Le DOMElement associé au média
     * @returns {Media}
     */
    constructor(data: Obj, element?: JQuery<HTMLElement>);
    _initRender(): this;
    updatePropRenderFollowers(): void;
    updatePropRenderReleaseDate(): void;
    updatePropRenderDuration(): void;
    /**
     * Définit le film, sur le compte du membre connecté, comme "vu"
     * @returns {Promise<Movie>}
     */
    markAsView(): Promise<this>;
    /**
     * Définit le film, sur le compte du membre connecté, comme "à voir"
     * @returns {Promise<Movie>}
     */
    markToSee(): Promise<this>;
    /**
     * Définit le film, sur le compte du membre connecté, comme "ne pas voir"
     * @returns {Promise<Movie>}
     */
    markDontWantToSee(): Promise<this>;
    /**
     * Modifie le statut du film sur le compte du membre connecté
     * @param   {number} state     Le nouveau statut du film
     * @returns {Promise<Movie>}    L'instance du film
     */
    changeStatus(state: MovieStatus): Promise<this>;
    /**
     * Retourne une image, si disponible, en fonction du format désiré
     * @param  {string = Images.formats.poster} format   Le format de l'image désiré
     * @return {Promise<string>}                         L'URL de l'image
     */
    getDefaultImage(format?: string): Promise<string>;
    /**
     * Récupère les personnages du film
     * @returns {Promise<this>}
     */
    fetchCharacters(): Promise<this>;
    getAllPosters(): Promise<object>;
}
