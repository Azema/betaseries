import { Obj, EventTypes, Callback } from "./Base";
import { implAddNote } from "./Note";
import { Media } from "./Media";
import { Season } from "./Season";
import { Character, Person } from "./Character";
import { RelatedProp } from "./RenderHtml";
/**
 * Classe représentant les différentes images d'une série
 * @class
 */
export declare class Images {
    /**
     * Les formats des images
     * @static
     * @type {object}
     */
    static formats: {
        poster: string;
        wide: string;
    };
    /**
     * Contructeur
     * @param {Obj} data - Les données de l'objet
     */
    constructor(data: Obj);
    /** @type {string} */
    show: string;
    /** @type {string} */
    banner: string;
    /** @type {string} */
    box: string;
    /** @type {string} */
    poster: string;
    /** @type {object} */
    _local: {
        show: string;
        banner: string;
        box: string;
        poster: string;
    };
}
/** @enum {number} */
export declare enum Picked {
    none = 0,
    banner = 1,
    show = 2
}
/**
 * Classe représentant une image
 * @class
 */
export declare class Picture {
    /**
     * Contructeur
     * @param {Obj} data - Les données de l'objet
     */
    constructor(data: Obj);
    /** @type {number} */
    id: number;
    /** @type {number} */
    show_id: number;
    /** @type {number} */
    login_id: number;
    /** @type {string} */
    url: string;
    /** @type {number} */
    width: number;
    /** @type {number} */
    height: number;
    /** @type {Date} */
    date: Date;
    /** @type {Picked} */
    picked: Picked;
}
/**
 * Classe représentant une plateforme de diffusion
 * @class
 */
export declare class Platform {
    /**
     * Contructeur
     * @param {Obj} data - Les données de l'objet
     */
    constructor(data: Obj);
    /**
     * Identifiant de la plateforme
     * @type {number}
     */
    id: number;
    /**
     * Nom de la plateforme
     * @type {string}
     */
    name: string;
    /** @type {string} */
    tag: string;
    /**
     * Lien URL d'accès au média sur la plateforme
     * @type {string}
     */
    link_url: string;
    /** @type {object} */
    available: object;
    /**
     * URL du logo de la plateforme
     * @type {string}
     */
    logo: string;
    /**
     * Flag de partenariat avec la plateforme
     * @type {boolean}
     */
    partner: boolean;
}
/**
 * Classe représentant les différentes plateformes de diffusion
 * sous deux types de plateformes
 * @class
 */
export declare class PlatformList {
    /** @type {Array<Platform>} */
    svod: Array<Platform>;
    /** @type {Array<Platform>} */
    vod: Array<Platform>;
    /** @type {string} */
    country: string;
    /**
     * Les types de plateformes
     * @type {Obj}
     * @static
     */
    static types: Obj;
    /**
     * fetchPlatforms - Récupère la liste des plateformes sur l'API
     * @static
     * @param  {string}                [country = 'us'] - Le pays concerné par les plateformes
     * @return {Promise<PlatformList>}                    L'objet contenant les différentes plateformes
     */
    static fetchPlatforms(country?: string): Promise<PlatformList>;
    /**
     * Contructeur
     * @param {Obj}     data -      Les données de l'objet
     * @param {string}  country -   Le pays correspondant aux plateformes
     */
    constructor(data: Obj, country?: string);
    /**
     * Retourne les plateformes sous forme d'éléments HTML Option
     * @param  {string}           [type = 'svod'] -     Le type de plateformes souhaité
     * @param  {Array<number>}    [exclude = null] -    Les identifiants des plateformes à exclure
     * @return {string}                                 Les options sous forme de chaîne
     */
    renderHtmlOptions(type?: string, exclude?: Array<number>): string;
}
/**
 * Classe représentant les différentes plateformes de diffusion d'un média
 * @class
 */
export declare class Platforms {
    /**
     * Contructeur
     * @param {Obj} data - Les données de l'objet
     */
    constructor(data: Obj);
    /** @type {Array<Platform>} */
    svods: Array<Platform>;
    /** @type {Platform} */
    svod: Platform;
    /** @type {Array<Platform>} */
    vod: Array<Platform>;
}
/**
 * Class représentant un ShowRunner
 * @class
 */
export declare class Showrunner {
    /**
     * Contructeur
     * @param {Obj} data - Les données de l'objet
     */
    constructor(data: Obj);
    /** @type {number} */
    id: number;
    /** @type {string} */
    name: string;
    /** @type {string} */
    picture: string;
}
/**
 * Interface de la classe Show
 * @interface
 */
export interface implShow {
    aliases: object;
    creation: string;
    country: string;
    images: Images;
    nbEpisodes: number;
    network: string;
    next_trailer: string;
    next_trailer_host: string;
    rating: string;
    pictures: Array<Picture>;
    platforms: Platforms;
    seasons: Array<Season>;
    showrunner: Showrunner;
    social_links: Array<string>;
    status: string;
    thetvdb_id: number;
    persons: Array<Person>;
}
/**
 * Class representing a Show
 * @class
 * @extends Media
 * @implements {implShow, implAddNote}
 */
export declare class Show extends Media implements implShow, implAddNote {
    /***************************************************/
    /***************************************************/
    /**
     * Types d'évenements gérés par cette classe
     * @type {Array}
     * @static
     */
    static EventTypes: Array<EventTypes>;
    /**
     * Propriétés pouvant être surchargées
     * @type {object}
     */
    static propsAllowedOverride: object;
    /**
     * Type de surcharge
     * Nécessaire pour la classe parente
     * @static
     * @type {string}
     */
    static overrideType: string;
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
     * Fonction statique servant à construire un tableau d'objets Season
     * à partir des données de l'API
     * @static
     * @param   {Show} obj - L'objet Show
     * @param   {Obj} data - Les données provenant de l'API
     * @returns {Array<Season>}
     */
    static seasonsDetailsToSeasons(obj: Show, data: Obj): Array<Season>;
    /**
     * Méthode static servant à récupérer une série sur l'API BS
     * @static
     * @private
     * @param  {Obj} params - Critères de recherche de la série
     * @param  {boolean} [force=false] - Indique si on utilise le cache ou non
     * @return {Promise<Show>}
     */
    protected static _fetch(params: Obj, force?: boolean): Promise<Show>;
    /**
     * fetchLastSeen - Méthode static retournant les 10 dernières séries vues par le membre
     * @static
     * @param  {number}  [limit = 10]  Le nombre limite de séries retournées
     * @return {Promise<Show>}         Une promesse avec les séries
     */
    static fetchLastSeen(limit?: number): Promise<Array<Show>>;
    /**
     * Méthode static servant à récupérer plusieurs séries sur l'API BS
     * @static
     * @param  {Array<number>} ids - Les identifiants des séries recherchées
     * @return {Promise<Array<Show>>}
     */
    static fetchMulti(ids: Array<number>): Promise<Array<Show>>;
    /**
     * Methode static servant à récupérer une série par son identifiant BS
     * @static
     * @param  {number} id - L'identifiant de la série
     * @param  {boolean} [force=false] - Indique si on utilise le cache ou non
     * @return {Promise<Show>}
     */
    static fetch(id: number, force?: boolean): Promise<Show>;
    /**
     * Methode static servant à récupérer une série par son identifiant TheTVDB
     * @static
     * @param  {number} id - L'identifiant TheTVDB de la série
     * @param  {boolean} [force=false] - Indique si on utilise le cache ou non
     * @return {Promise<Show>}
     */
    static fetchByTvdb(id: number, force?: boolean): Promise<Show>;
    /**
     * Méthode static servant à récupérer une série par son identifiant URL
     * @static
     * @param   {string} url - Identifiant URL (slug) de la série recherchée
     * @param   {boolean} force - Indique si on doit ignorer les données dans le cache
     * @returns {Promise<Show>}
     */
    static fetchByUrl(url: string, force?: boolean): Promise<Show>;
    /***************************************************/
    /***************************************************/
    /**
     * @type {object} Contient les alias de la série
     */
    aliases: object;
    /**
     * @type {string} Année de création de la série
     */
    creation: string;
    /**
     * @type {string} Pays d'origine de la série
     */
    country: string;
    /**
     * @type {number} Pointeur vers la saison courante
     */
    _currentSeason: number;
    /**
     * @type {Images} Contient les URLs d'accès aux images de la série
     */
    images: Images;
    /**
     * @type {boolean} Indique si la série se trouve dans les séries à voir
     */
    markToSee: boolean;
    /**
     * @type {number} Nombre total d'épisodes dans la série
     */
    nbEpisodes: number;
    /**
     * @type {number} Nombre de saisons dans la série
     */
    nbSeasons: number;
    /**
     * @type {string} Chaîne TV ayant produit la série
     */
    network: string;
    /**
     * @type {string}
     */
    next_trailer: string;
    /**
     * @type {string}
     */
    next_trailer_host: string;
    /**
     * @type {string} Code de classification TV parental
     */
    rating: string;
    /**
     * @type {Array<Person>} Tableau des acteurs de la série
     */
    persons: Array<Person>;
    /**
     * @type {Array<Picture>} Tableau des images uploadées par les membres
     */
    pictures: Array<Picture>;
    /**
     * @type {Platforms} Plateformes de diffusion
     */
    platforms: Platforms;
    /**
     * @type {Array<Season>} Tableau des saisons de la série
     */
    seasons: Array<Season>;
    /**
     * @type {Showrunner}
     */
    showrunner: Showrunner;
    /**
     * @type {Array<string>} Tableau des liens sociaux de la série
     */
    social_links: Array<string>;
    /**
     * @type {string} Status de la série sur le compte du membre
     */
    status: string;
    /**
     * @type {number} Identifiant TheTVDB de la série
     */
    thetvdb_id: number;
    /**
     * @type {object} Contient les URLs des posters disponibles pour la série
     */
    _posters: object;
    /***************************************************/
    /***************************************************/
    /**
     * Constructeur de la classe Show
     * @param   {Obj} data - Les données du média
     * @param   {JQuery<HTMLElement>} element - Le DOMElement associé au média
     * @returns {Show}
     */
    constructor(data: Obj, element?: JQuery<HTMLElement>);
    /**
     * Initialisation du rendu HTML
     * Sert à définir les sélecteurs CSS et ajouter, si nécessaire, des balises HTML supplémentaires
     * Seulement si la propriété {@link Show.elt} est définie
     * @returns {Show}
     */
    _initRender(): this;
    /**
     * Met à jour le nombre de followers sur la page Web
     */
    updatePropRenderFollowers(): void;
    /**
     * Met à jour le nombre de saisons sur la page Web
     */
    updatePropRenderNbSeasons(): void;
    /**
     * Met à jour le nombre d'épisodes sur la page Web
     */
    updatePropRenderNbEpisodes(): void;
    /**
     * Met à jour le statut de la série sur la page Web
     */
    updatePropRenderStatus(): void;
    /**
     * Met à jour la durée d'un épisode sur la page Web
     */
    updatePropRenderDuration(): void;
    /**
     * Initialise l'objet après sa construction et son remplissage
     * @returns {Promise<Show>}
     */
    init(): Promise<this>;
    /**
     * Récupère les données de la série sur l'API
     * @param  {boolean} [force=true]   Indique si on utilise les données en cache
     * @return {Promise<*>}             Les données de la série
     */
    fetch(force?: boolean): Promise<Obj>;
    /**
     * Récupère les saisons de la série
     * @returns {Promise<Show>}
     */
    fetchSeasons(): Promise<Show>;
    /**
     * Récupère les personnages de la série
     * @override
     * @returns {Promise<Show>}
     */
    fetchCharacters(): Promise<this>;
    /**
     * Retourne le personnage associé au nom d'acteur de la série
     * @param   {String} name - Nom de l'acteur
     * @returns {Character | null}
     */
    getCharacterByName(name: string): Character | null;
    /**
     * Récupère les acteurs sur l'API BetaSeries
     * @returns {Promise<Show>}
     */
    fetchPersons(): Promise<Show>;
    /**
     * Récupère les acteurs sur l'API BetaSeries à partir
     * des personnages de la série
     * @async
     * @returns {Promise<Show>}
     */
    fetchPersonsFromCharacters(): Promise<Show>;
    /**
     * Retourne un acteur en le cherchant par son nom
     * @param   {String} name - Nom de l'acteur
     * @returns {Person | null}
     */
    getPersonByName(name: string): Person | null;
    /**
     * Retourne un acteur en le cherchant par son ID
     * @param   {number} id - Identifiant de l'acteur
     * @returns {Person | null}
     */
    getPersonById(id: number): Person | null;
    /**
     * isEnded - Indique si la série est terminée
     *
     * @return {boolean}  Terminée ou non
     */
    isEnded(): boolean;
    /**
     * isArchived - Indique si la série est archivée
     *
     * @return {boolean}  Archivée ou non
     */
    isArchived(): boolean;
    /**
     * isFavorite - Indique si la série est dans les favoris
     *
     * @returns {boolean}
     */
    isFavorite(): boolean;
    /**
     * isMarkToSee - Indique si la série se trouve dans les séries à voir
     * @async
     * @returns {boolean}
     */
    isMarkedToSee(): Promise<boolean>;
    /**
     * addToAccount - Ajout la série sur le compte du membre connecté
     * @return {Promise<Show>} Promise of show
     */
    addToAccount(): Promise<Show>;
    /**
     * Remove Show from account member
     * @return {Promise<Show>} Promise of show
     */
    removeFromAccount(): Promise<Show>;
    /**
     * Archive la série
     * @return {Promise<Show>} Promise of show
     */
    archive(): Promise<Show>;
    /**
     * Désarchive la série
     * @return {Promise<Show>} Promise of show
     */
    unarchive(): Promise<Show>;
    /**
     * Ajoute la série aux favoris
     * @return {Promise<Show>} Promise of show
     */
    favorite(): Promise<Show>;
    /**
     * Supprime la série des favoris
     * @return {Promise<Show>} Promise of show
     */
    unfavorite(): Promise<Show>;
    /**
     * Met à jour les données de la série
     * @param  {Callback} [cb = Base.noop]  Fonction de callback
     * @return {Promise<Show>}              Promesse (Show)
     */
    update(cb?: Callback): Promise<Show>;
    /**
     * Met à jour le rendu de la barre de progression
     * et du prochain épisode
     * @param  {Callback} [cb=Base.noop] Fonction de callback
     * @return {void}
     */
    updateRender(cb?: Callback): void;
    /**
     * Met à jour la barre de progression de visionnage de la série
     * @return {void}
     */
    updateProgressBar(): void;
    /**
     * Simule un clic sur le bouton d'archivage de la série sur la page Web
     */
    updateArchived(): void;
    /**
     * Met à jour le bloc du prochain épisode à voir
     * @param   {Callback} [cb=noop] Fonction de callback
     * @returns {void}
     */
    updateNextEpisode(cb?: Callback): void;
    /**
     * On gère l'ajout de la série dans le compte utilisateur
     *
     * @param   {boolean} trigEpisode Flag indiquant si l'appel vient d'un episode vu ou du bouton
     * @returns {void}
     */
    addShowClick(trigEpisode?: boolean): void;
    /**
     * Gère la suppression de la série du compte utilisateur
     * @returns {void}
     */
    deleteShowClick(): void;
    /**
     * Ajoute le bouton toSee dans les actions de la série
     * @sync
     */
    addBtnToSee(): Promise<void>;
    /**
     * Ajoute un eventHandler sur les boutons Archiver et Favoris
     * @returns {void}
     */
    addEventBtnsArchiveAndFavoris(): void;
    /**
     * Ajoute la classification dans les détails de la ressource
     */
    addRating(): void;
    /**
     * Définit la saison courante
     * @param   {number} seasonNumber Le numéro de la saison courante (commence à 1)
     * @returns {Show}  L'instance de la série
     * @throws  {Error} if seasonNumber is out of range of seasons
     */
    setCurrentSeason(seasonNumber: number): Show;
    /**
     * Retourne la saison courante
     * @return {Season}
     */
    get currentSeason(): Season;
    /**
     * Retourne l'objet Season correspondant au numéro de saison fournit en paramètre
     * @param   {number} seasonNumber - Numéro de saison (base: 1)
     * @returns {Season}
     */
    getSeason(seasonNumber: number): Season;
    /**
     * Retourne une image, si disponible, en fonction du format désiré
     * @param  {string = Images.formats.poster} format   Le format de l'image désiré
     * @return {Promise<string>}                         L'URL de l'image
     */
    getDefaultImage(format?: string): Promise<string>;
    /**
     * Récupère et retourne les différentes affiches disponibles
     * @returns {object}
     */
    getAllPosters(): Promise<object>;
}
