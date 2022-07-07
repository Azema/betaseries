import { Obj, HTTP_VERBS } from "./Base";
import { implAddNote } from "./Note";
import { Season } from "./Season";
import { Subtitles } from "./Subtitle";
import { MediaBase } from "./Media";
import { RelatedProp } from "./RenderHtml";
export declare type Platform_link = {
    /**
     * @type {number} Identifiant de l'épisode sur la plateforme
     */
    id: number;
    platform_id?: number;
    /**
     * @type {string} Lien vers l'épisode sur la plateforme
     */
    link: string;
    /**
     * @type {string} Le nom de la plateforme
     */
    platform: string;
    color?: string;
    type?: string;
    logo?: string;
};
export declare type ReleasesSvod = {
    displayOriginal: boolean;
    releases: Array<string>;
};
export declare type WatchedBy = {
    /**
     * @type {number} Identifiant du membre
     */
    id: number;
    /**
     * @type {string} Login du membre
     */
    login: string;
    /**
     * @type {number} La note du membre
     */
    note: number;
    /**
     * @type {string} L'URL de l'avatar du membre
     */
    avatar?: string;
};
export declare class Episode extends MediaBase implements implAddNote {
    [x: string]: any;
    static selectorsCSS: Record<string, string>;
    static relatedProps: Record<string, RelatedProp>;
    static fetch(epId: number): Promise<Episode>;
    /**
     * @type {Season} L'objet Season contenant l'épisode
     */
    _season: Season;
    /**
     * @type {string} Le code de l'épisode SXXEXX
     */
    code: string;
    /**
     * @type {Date} La date de sortie de l'épisode
     */
    date: Date;
    /**
     * @type {string}
     */
    director: string;
    /**
     * @type {number} Le numéro de l'épisode dans la saison
     */
    number: number;
    /**
     * @type {number} Le numéro de l'épisode dans la série
     */
    global: number;
    /**
     * @type {number} Le numéro de la saison
     */
    numSeason: number;
    /**
     * @type {Array<Platform_link>} Les plateformes de diffusion
     */
    platform_links: Array<Platform_link>;
    /**
     * @type {ReleasesSvod}
     */
    releasesSvod: ReleasesSvod;
    /**
     * @type {number} Nombre de membres de BS à avoir vu l'épisode
     */
    seen_total: number;
    /**
     * @type {boolean} Indique si il s'agit d'un épisode spécial
     */
    special: boolean;
    /**
     * @type {Array<Subtitle>} Tableau des sous-titres dispo sur BS
     */
    subtitles: Subtitles;
    /**
     * @type {number} Identifiant de l'épisode sur thetvdb.com
     */
    thetvdb_id: number;
    /**
     * @type {Array<WatchedBy>} Tableau des amis ayant vu l'épisode
     */
    watched_by: Array<WatchedBy>;
    /**
     * @type {Array<string>} Tableau des scénaristes de l'épisode
     */
    writers: Array<string>;
    /**
     * @type {string} Identifiant de la vidéo sur Youtube
     */
    youtube_id: string;
    private __fetches;
    /**
     * Constructeur de la classe Episode
     * @param   {Obj}       data    Les données provenant de l'API
     * @param   {Season}    season  L'objet Season contenant l'épisode
     * @returns {Episode}
     */
    constructor(data: Obj, season?: Season, elt?: JQuery<HTMLElement>);
    _initRender(): this;
    /**
     * Mise à jour de l'information du statut de visionnage de l'épisode
     * @returns {void}
     */
    updatePropRenderUser(): void;
    updateBtnSeen(): void;
    /**
     * Retourne l'objet Season associé à l'épisode
     * @returns {Season | null}
     */
    get season(): Season;
    /**
     * Associe l'objet Season à l'épisode
     * @param {Season} saison - L'objet Season à associer à l'objet épisode
     */
    set season(saison: Season);
    /**
     * Ajoute le titre de l'épisode à l'attribut Title
     * du DOMElement correspondant au titre de l'épisode
     * sur la page Web
     *
     * @return {Episode} L'épisode
     */
    addAttrTitle(): Episode;
    /**
     * Ajoute la popup de description sur la vignette de l'épisode\
     * Ne fonctionne que si l'épisode fait partit d'une saison, sur la page d'une série
     * @returns {Episode}
     */
    addPopup(): Episode;
    /**
     * Met à jour le DOMElement .checkSeen avec les
     * données de l'épisode (id, pos, special)
     * @param  {number} pos  La position de l'épisode dans la liste
     * @return {Episode}
     */
    initCheckSeen(pos: number): Episode;
    /**
     * Met à jour les infos de la vignette et appelle la fonction d'update du rendu
     * @param  {number} pos La position de l'épisode dans la liste
     * @return {boolean}    Indique si il y a eu un changement
     */
    updateCheckSeen(pos: number): boolean;
    /**
     * Met à jour le titre de l'épisode sur la page de la série
     * @returns {void}
     */
    updateTitle(): void;
    /**
     * Définit le film, sur le compte du membre connecté, comme "vu"
     * @returns {void}
     */
    markAsView(): void;
    /**
     * Définit le film, sur le compte du membre connecté, comme "non vu"
     * @returns {void}
     */
    markAsUnview(): void;
    /**
     * Modifie le statut d'un épisode sur l'API
     * @param  {String} status    Le nouveau statut de l'épisode
     * @param  {String} method    Verbe HTTP utilisé pour la requête à l'API
     * @return {void}
     */
    updateStatus(status: string, method: HTTP_VERBS): void;
    /**
     * Change le statut visuel de la vignette sur le site
     * @param  {String} newStatus     Le nouveau statut de l'épisode (seen, notSeen, hidden)
     * @param  {bool}   [update=true] Mise à jour de la ressource en cache et des éléments d'affichage
     * @return {Episode}
     */
    updateRender(newStatus: string, update?: boolean): Episode;
    /**
     * Affiche/masque le spinner de modification de l'épisode
     *
     * @param  {boolean}  display  Le flag indiquant si afficher ou masquer
     * @return {Episode}
     */
    toggleSpinner(display: boolean): Episode;
    /**
     * Retourne une image, si disponible, en fonction du format désiré
     * @return {Promise<string>}                         L'URL de l'image
     */
    getDefaultImage(): Promise<string>;
    /**
     * Récupère les personnages de l'épisode
     * @returns {Promise<this>}
     */
    fetchCharacters(): Promise<this>;
}
