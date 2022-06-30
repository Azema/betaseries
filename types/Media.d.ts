/// <reference types="jquery" />
/// <reference types="jquery" />
/// <reference types="bootstrap" />
import { Base, Obj } from "./Base";
import { Similar } from "./Similar";
export declare abstract class Media extends Base {
    /***************************************************/
    /***************************************************/
    static propsAllowedOverride: object;
    static overrideType: string;
    static selectorsCSS: Record<string, string>;
    /**
     * Méthode static servant à récupérer un média sur l'API BS
     * @param  {Obj} params - Critères de recherche du média
     * @param  {boolean} [force=false] - Indique si on utilise le cache ou non
     * @return {Promise<Show>}
     * @protected
     * @abstract
     */
    protected static _fetch(params: Obj, force: boolean): Promise<Media>;
    /**
     * Methode static servant à récupérer un média par son identifiant IMDB
     * @param  {number} id - L'identifiant IMDB du média
     * @param  {boolean} [force=false] - Indique si on utilise le cache ou non
     * @return {Promise<Media>}
     */
    static fetchByImdb(id: number, force?: boolean): Promise<Media>;
    /***************************************************/
    /***************************************************/
    /**
     * @type {number} Nombre de membres ayant ce média sur leur compte
     */
    followers: number;
    /**
     * @type {Array<string>} Les genres attribués à ce média
     */
    genres: Array<string>;
    /**
     * @type {string} Identifiant IMDB
     */
    imdb_id: string;
    /**
     * @type {string} Langue originale du média
     */
    language: string;
    /**
     * @type {number} Durée du média en minutes
     */
    duration: number;
    /**
     * @type {string} Titre original du média
     */
    original_title: string;
    /**
     * @type {Array<Similar>} Tableau des médias similaires
     */
    similars: Array<Similar>;
    /**
     * @type {number} Nombre de médias similaires
     */
    nbSimilars: number;
    /**
     * @type {boolean} Indique si le média se trouve sur le compte du membre connecté
     */
    in_account: boolean;
    /**
     * @type {string} slug - Identifiant du média servant pour l'URL
     */
    slug: string;
    protected __fetches: Record<string, Promise<any>>;
    /**
     * Constructeur de la classe Media
     * Le DOMElement est nécessaire que pour le média principal sur la page Web
     * @param   {Obj} data - Les données du média
     * @param   {JQuery<HTMLElement>} [element] - Le DOMElement de référence du média
     * @returns {Media}
     */
    constructor(data: Obj, element?: JQuery<HTMLElement>);
    /**
     * Initialise l'objet lors de sa construction et après son remplissage
     * @returns {Promise<Media>}
     */
    init(): Promise<this>;
    updatePropRenderGenres(): void;
    /**
     * Retourne les similars associés au media
     * @return {Promise<Media>}
     */
    fetchSimilars(): Promise<Media>;
    /**
     * Retourne le similar correspondant à l'identifiant
     * @abstract
     * @param  {number} id      L'identifiant du similar
     * @return {Similar|void}   Le similar ou null
     */
    getSimilar(id: number): Similar;
    /**
     * override - Permet de surcharger des propriétés de l'objet, parmis celles autorisées,
     * et de stocker les nouvelles valeurs
     * @see Show.propsAllowedOverride
     * @param   {string} prop - Nom de la propriété à modifier
     * @param   {string} value - Nouvelle valeur de la propriété
     * @param   {object} [params] - Optional: paramètres à fournir pour modifier le path de la propriété
     * @returns {Promise<boolean>}
     */
    override(prop: string, value: string, params?: object): Promise<boolean>;
    /**
     * _overrideProps - Permet de restaurer les valeurs personalisées dans l'objet
     * @see Show.propsAllowedOverride
     * @private
     * @returns {Promise<Media>}
     */
    _overrideProps(): Promise<Media>;
    /**
     * Retourne l'URL de la page de la série à partir de son identifiant tvdb
     * @param   {number} tvdb_id - Identifiant TheTvDB
     * @returns {Promise<string>}
     */
    _getTvdbUrl(tvdb_id: number): Promise<string>;
}
