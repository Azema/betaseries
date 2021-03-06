import { Obj } from "./Base";
import { Episode } from "./Episode";
import { RelatedProp, RenderHtml } from "./RenderHtml";
import { Show } from "./Show";
export declare class Season extends RenderHtml {
    static logger: import("./Debug").Debug;
    static debug: any;
    /**
     * Les différents sélecteurs CSS des propriétés de l'objet
     * @static
     * @type {Record<string, string>}
     */
    static selectorsCSS: Record<string, string>;
    /**
     * Objet contenant les informations de relations entre les propriétés des objets de l'API
     * et les proriétés de cette classe.
     * Sert à la construction de l'objet
     * @static
     * @type {Record<string, RelatedProp>}
     */
    static relatedProps: Record<string, RelatedProp>;
    /**
     * Numéro de la saison dans la série
     * @type {number}
     */
    number: number;
    /**
     * Tableau des épisodes de la saison
     * @type {Array<Episode>}
     */
    episodes: Array<Episode>;
    /**
     * Nombre d'épisodes dans la saison
     * @type {number}
     */
    nbEpisodes: number;
    /**
     * Possède des sous-titres
     * @type {boolean}
     */
    has_subtitles: boolean;
    /**
     * Indique si la saison est indiquée comme ignorée par le membre
     * @type {boolean}
     */
    hidden: boolean;
    /**
     * URL de l'image
     * @type {string}
     */
    image: string;
    /**
     * Indique si le membre a vu la saison complète
     * @type {boolean}
     */
    seen: boolean;
    /**
     * L'objet Show auquel est rattaché la saison
     * @type {Show}
     */
    private _show;
    /**
     * Objet contenant les promesses en attente des méthodes fetchXXX
     * @type {Object.<string, Promise<Season>>}
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
    _initRender(): this;
    /**
     * Mise à jour du nombre d'épisodes de la saison sur la page Web
     * @returns {void}
     */
    updatePropRenderNbepisodes(): void;
    /**
     * Mise à jour de l'image de la saison sur la page Web
     * @returns {void}
     */
    updatePropRenderImage(): void;
    /**
     * Retourne le nombre d'épisodes dans la saison
     * @returns {number}
     */
    get length(): number;
    /**
     * Récupère les épisodes de la saison sur l'API
     * @returns {Promise<Season>}
     */
    fetchEpisodes(): Promise<Season>;
    /**
     * Vérifie et met à jour les épisodes de la saison
     * @returns {Promise<Season>}
     */
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
     * @returns {Episode | null}
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
