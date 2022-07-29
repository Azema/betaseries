import { Obj } from "./Base";
export declare class Subtitle {
    /**
     * L'identifiant du subtitle
     * @type {number}
     */
    id: number;
    /**
     * La langue du subtitle
     * @type {string}
     */
    language: string;
    /**
     * La source du subtitle
     * @type {string}
     */
    source: string;
    /**
     * La qualité du subtitle
     * @type {number}
     */
    quality: number;
    /**
     * Le nom du fichier du subtitle
     * @type {string}
     */
    file: string;
    /**
     * L'URL d'accès au subtitle
     * @type {string}
     */
    url: string;
    /**
     * Date de mise en ligne
     * @type {Date}
     */
    date: Date;
    /**
     * Identifiant ou numéro de l'épisode
     * @type {number}
     */
    episode: number;
    /**
     * Identifiant de la série
     * @type {number}
     */
    show: number;
    /**
     * Numéro de saison
     * @type {number}
     */
    season: number;
    constructor(data: Obj);
}
/**
 * SortTypeSubtitles
 * @enum
 * @memberof Subtitles
 * @alias SortTypeSubtitles
 */
export declare enum SortTypeSubtitles {
    LANGUAGE = "language",
    SOURCE = "source",
    QUALITY = "quality",
    DATE = "date"
}
/**
 * SubtitleTypes
 * @enum
 * @memberof Subtitles
 * @alias SubtitleTypes
 */
export declare enum SubtitleTypes {
    EPISODE = "episode",
    SEASON = "season",
    SHOW = "show"
}
/**
 * SubtitleLanguages
 * @enum
 * @memberof Subtitles
 * @alias SubtitleLanguages
 */
export declare enum SubtitleLanguages {
    ALL = "all",
    VOVF = "vovf",
    VO = "vo",
    VF = "vf"
}
/**
 * ParamsFetchSubtitles
 * @memberof Subtitles
 * @alias ParamsFetchSubtitles
 */
export declare type ParamsFetchSubtitles = {
    id: number;
    season?: number;
};
/**
 * Subtitles - Classe collection de sous-titres
 * @class
 */
export declare class Subtitles {
    static logger: import("./Debug").Debug;
    static debug: any;
    /**
     * Collection de subtitles
     * @type {Subtitle[]}
     */
    subtitles: Array<Subtitle>;
    /**
     * Récupère et retourne une collection de subtitles
     * @static
     * @param   {SubtitleTypes} type - Type de média
     * @param   {ParamsFetchSubtitles} ids - Les identifiants de recherche
     * @param   {SubtitleLanguages} language - La langue des subtitles recherchés
     * @returns {Promise<Subtitles>}
     */
    static fetch(type: SubtitleTypes, ids: ParamsFetchSubtitles, language?: SubtitleLanguages): Promise<Subtitles>;
    /**
     * Constructor
     * @param  {Obj} data - Les données
     * @return {Subtitles}
     */
    constructor(data: Array<Obj>);
    /**
     * Permet de trier les subtitles
     * @param   {SortTypeSubtitles} by - Le type de tri
     * @returns {Array<Subtitle>}
     */
    sortBy(by: SortTypeSubtitles): Array<Subtitle>;
}
