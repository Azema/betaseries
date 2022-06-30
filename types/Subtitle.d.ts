import { Obj } from "./Base";
export declare class Subtitle {
    /**
     * @type {number} - L'identifiant du subtitle
     */
    id: number;
    /**
     * @type {string} - La langue du subtitle
     */
    language: string;
    /**
     * @type {string} - La source du subtitle
     */
    source: string;
    /**
     * @type {number} - La qualité du subtitle
     */
    quality: number;
    /**
     * @type {string} - Le nom du fichier du subtitle
     */
    file: string;
    /**
     * @type {string} - L'URL d'accès au subtitle
     */
    url: string;
    /**
     * @type {Date} - Date de mise en ligne
     */
    date: Date;
    episode: number;
    show: number;
    season: number;
    constructor(data: Obj);
}
export declare enum SortTypeSubtitles {
    LANGUAGE = "language",
    SOURCE = "source",
    QUALITY = "quality",
    DATE = "date"
}
export declare enum SubtitleTypes {
    EPISODE = "episode",
    SEASON = "season",
    SHOW = "show"
}
export declare enum SubtitleLanguages {
    ALL = "all",
    VOVF = "vovf",
    VO = "vo",
    VF = "vf"
}
export declare type ParamsFetchSubtitles = {
    id: number;
    season?: number;
};
export declare class Subtitles {
    /**
     * @type {Array<Subtitle>} - Collection de subtitles
     */
    subtitles: Array<Subtitle>;
    /**
     * Récupère et retourne une collection de subtitles
     * @param   {SubtitleTypes} type - Type de média
     * @param   {ParamsFetchSubtitles} ids - Les identifiants de recherche
     * @param   {SubtitleLanguages} language - La langue des subtitles recherchés
     * @returns {Promise<Subtitles>}
     */
    static fetch(type: SubtitleTypes, ids: ParamsFetchSubtitles, language?: SubtitleLanguages): Promise<Subtitles>;
    constructor(data: Array<Obj>);
    /**
     * Permet de trier les subtitles
     * @param   {SortTypeSubtitles} by - Le type de tri
     * @returns {Array<Subtitle>}
     */
    sortBy(by: SortTypeSubtitles): Array<Subtitle>;
}
