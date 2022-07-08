import { Base, Obj } from "./Base";
import { Character } from "./Character";
import { CommentsBS } from "./Comments";
import { implAddNote, Note } from "./Note";
import { RenderHtml } from "./RenderHtml";
import { Similar } from "./Similar";
import { User } from "./User";
declare type Class<T> = new (...args: any[]) => T;
export declare enum MediaType {
    show = "show",
    movie = "movie",
    episode = "episode"
}
export declare type MediaTypes = {
    singular: MediaType;
    plural: string;
    className: Class<Base>;
};
export declare abstract class MediaBase extends RenderHtml implements implAddNote {
    /** @type {string} */
    description: string;
    /** @type {number} */
    nbComments: number;
    /** @type {number} */
    id: number;
    /** @type {Note} */
    objNote: Note;
    /** @type {string} */
    resource_url: string;
    /** @type {string} */
    title: string;
    /** @type {User} */
    user: User;
    /** @type {Array<Character>} */
    characters: Array<Character>;
    /** @type {CommentsBS} */
    comments: CommentsBS;
    /** @type {MediaTypes} */
    mediaType: MediaTypes;
    constructor(data: Obj, elt?: JQuery<HTMLElement>);
    /**
     * Initialisation du rendu HTML
     * @returns {MediaBase}
     */
    _initRender(): this;
    /**
     * Met à jour les informations de la note du média sur la page Web
     */
    updatePropRenderObjNote(): void;
    /**
     * Met à jour le titre du média sur la page Web
     */
    updatePropRenderTitle(): void;
    /**
     * Méthode d'initialisation de l'objet
     * @returns {Promise<MediaBase>}
     */
    init(): Promise<this>;
    /**
     * Sauvegarde l'objet en cache
     * @return {MediaBase} L'instance du média
     */
    save(): this;
    /**
     * Retourne le nombre d'acteurs référencés dans ce média
     * @returns {number}
     */
    get nbCharacters(): number;
    /**
     * Décode le titre de la page
     * @return {Base} L'instance du média
     */
    decodeTitle(): MediaBase;
    /**
     * Ajoute le nombre de votes, à la note du média, dans l'attribut title de la balise
     * contenant la représentation de la note du média
     *
     * @return {void}
     */
    changeTitleNote(): void;
    /**
     * Ajoute le vote du membre connecté pour le média
     * @param   {number} note - Note du membre connecté pour le média
     * @returns {Promise<boolean>}
     */
    addVote(note: number): Promise<boolean>;
    /**
     * *fetchCharacters* - Récupère les acteurs du média
     * @abstract
     * @returns {Promise<MediaBase>}
     */
    fetchCharacters(): Promise<this>;
    /**
     * *getCharacter* - Retourne un personnage à partir de son identifiant
     * @param   {number} id - Identifiant de l'actor
     * @returns {Character | null}
     */
    getCharacter(id: number): Character | null;
}
export declare abstract class Media extends MediaBase {
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
     * Nombre de membres ayant ce média sur leur compte
     * @type {number}
     */
    followers: number;
    /**
     * Les genres attribués à ce média
     * @type {string[]}
     */
    genres: Array<string>;
    /**
     * Identifiant IMDB
     * @type {string}
     */
    imdb_id: string;
    /**
     * Langue originale du média
     * @type {string}
     */
    language: string;
    /**
     * Durée du média en minutes
     * @type {number}
     */
    duration: number;
    /**
     * Titre original du média
     * @type {string}
     */
    original_title: string;
    /**
     * Tableau des médias similaires
     * @type {Similar[]}
     */
    similars: Array<Similar>;
    /**
     * Nombre de médias similaires
     * @type {number}
     */
    nbSimilars: number;
    /**
     * Indique si le média se trouve sur le compte du membre connecté
     * @type {boolean}
     */
    in_account: boolean;
    /**
     * Identifiant du média servant pour l'URL
     * @type {string}
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
export {};
