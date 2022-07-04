import { Obj } from "./Base";
import { Episode } from "./Episode";
import { Show } from "./Show";
export declare class Season {
    /**
     * @type {number} Numéro de la saison dans la série
     */
    number: number;
    /**
     * @type {Array<Episode>} Tableau des épisodes de la saison
     */
    episodes: Array<Episode>;
    /**
     * Nombre d'épisodes dans la saison
     * @type {number}
     */
    nbEpisodes: number;
    /**
     * @type {boolean} Possède des sous-titres
     */
    has_subtitles: boolean;
    /**
     * @type {boolean} Saison pas vu
     */
    hidden: boolean;
    /**
     * @type {string} URL de l'image
     */
    _image: string;
    /**
     * @type {boolean} Saison vu
     */
    seen: boolean;
    /**
     * @type {Show} L'objet Show auquel est rattaché la saison
     */
    private _show;
    /**
     * @type {JQuery<HTMLElement>} Le DOMElement jQuery correspondant à la saison
     */
    private __elt;
    /**
     * Objet contenant les promesses en attente des méthodes fetchXXX
     * @type {Record<string, Promise<Season>>}
     */
    private __fetches;
    /**
     * Constructeur de la classe Season
     * @param   {Obj}   data    Les données provenant de l'API
     * @param   {Show}  show    L'objet Show contenant la saison
     * @returns {Season}
     */
    constructor(data: Obj, show: Show);
    /**
     * Initialise le rendu HTML de la saison
     * @returns {Seasons}
     */
    _initRender(): Season;
    /**
     * Retourne le nombre d'épisodes dans la saison
     * @returns {number}
     */
    get length(): number;
    /**
     * Setter pour l'attribut image
     * @param {string} src - L'URL d'accès à l'image
     */
    set image(src: string);
    /**
     * Getter pour l'attribut image
     * @returns {string}
     */
    get image(): string;
    /**
     * Récupère les épisodes de la saison sur l'API
     * @returns {Promise<Season>}
     */
    fetchEpisodes(): Promise<Season>;
    checkEpisodes(): Promise<Season>;
    /**
     * Cette méthode permet de passer tous les épisodes de la saison en statut **seen**
     * @returns {Promise<Season>}
     */
    watched(): Promise<Season>;
    /**
     * Cette méthode permet de passer tous les épisodes de la saison en statut **hidden**
     * @returns {Promise<Season>}
     */
    hide(): Promise<Season>;
    /**
     * Retourne l'épisode correspondant à l'identifiant fournit
     * @param  {number} id
     * @returns {Episode}
     */
    getEpisode(id: number): Episode;
    /**
     * Retourne le nombre d'épisodes vus
     * @returns {number} Le nombre d'épisodes vus dans la saison
     */
    getNbEpisodesSeen(): number;
    /**
     * Retourne le nombre d'épisodes non vus
     * @returns {number} Le nombre d'épisodes non vus dans la saison
     */
    getNbEpisodesUnwatched(): number;
    /**
     * Retourne le nombre d'épisodes spéciaux
     * @returns {number} Le nombre d'épisodes spéciaux
     */
    getNbEpisodesSpecial(): number;
    /**
     * Met à jour l'objet Show
     * @returns {Promise<Show>}
     */
    updateShow(): Promise<Show>;
    /**
     * Vérifie la modification des épisodes et met à jour le rendu HTML, ainsi que la série
     * @returns {Promise<Season>}
     */
    update(): Promise<Season>;
    /**
     * Change le statut visuel de la saison sur le site
     * @return {Season}
     */
    updateRender(): Season;
    /**
     * Modifie la saison courante de l'objet Show
     * @param   {number} seasonNumber Le numéro de la saison
     * @returns {Season}
     */
    changeCurrentSeason(seasonNumber: number): Season;
    /**
     * Indique si la série est sur le compte du membre connecté
     * @returns {boolean}
     */
    showInAccount(): boolean;
    /**
     * Définit la série comme étant sur le compte du membre connecté
     * @returns {Season}
     */
    addShowToAccount(): Season;
    /**
     * Retourne le prochain épisode non vu
     * @return {Episode} Le prochain épisode non vu
     */
    getNextEpisodeUnwatched(): Episode;
}
