import { UsBetaSeries, HTTP_VERBS, Obj } from "./Base";

export class Subtitle {
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

    constructor(data: Obj) {
        this.id = parseInt(data.id, 10);
        this.language = data.language;
        this.source = data.source;
        this.quality = parseInt(data.quality, 10);
        this.file = data.file;
        this.url = data.url;
        this.date = new Date(data.date);
        this.show = parseInt(data.show_id, 10);
        this.episode = parseInt(data.episode_id, 10);
        this.season = parseInt(data.season, 10);
    }
}

/**
 * SortTypeSubtitles
 * @enum
 * @memberof Subtitles
 * @alias SortTypeSubtitles
 */
export enum SortTypeSubtitles {
    LANGUAGE = 'language',
    SOURCE = 'source',
    QUALITY = 'quality',
    DATE = 'date'
}

/**
 * SubtitleTypes
 * @enum
 * @memberof Subtitles
 * @alias SubtitleTypes
 */
export enum SubtitleTypes {
    EPISODE = 'episode',
    SEASON = 'season',
    SHOW = 'show'
}

/**
 * SubtitleLanguages
 * @enum
 * @memberof Subtitles
 * @alias SubtitleLanguages
 */
export enum SubtitleLanguages {
    ALL = 'all',
    VOVF = 'vovf',
    VO = 'vo',
    VF = 'vf'
}
/**
 * ParamsFetchSubtitles
 * @memberof Subtitles
 * @alias ParamsFetchSubtitles
 */
export type ParamsFetchSubtitles = {
    id: number;
    season?: number;
};
/**
 * Subtitles - Classe collection de sous-titres
 * @class
 */
export class Subtitles {
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
    public static fetch(type: SubtitleTypes, ids: ParamsFetchSubtitles, language: SubtitleLanguages = SubtitleLanguages.ALL): Promise<Subtitles> {
        const params: Obj = {id: ids.id, language: language};
        if (type === SubtitleTypes.SEASON) {
            params.season = ids.season;
        }
        return UsBetaSeries.callApi(HTTP_VERBS.GET, 'subtitles', type, params)
        .then((data: Obj) => {
            return new Subtitles(data.subtitles);
        });
    }
    /**
     * Constructor
     * @param  {Obj} data - Les données
     * @return {Subtitles}
     */
    constructor(data: Array<Obj>) {
        this.subtitles = [];
        if (data && data.length > 0) {
            for (let s = 0; s < data.length; s++) {
                this.subtitles.push(new Subtitle(data[s]));
            }
        }
    }
    /**
     * Permet de trier les subtitles
     * @param   {SortTypeSubtitles} by - Le type de tri
     * @returns {Array<Subtitle>}
     */
    public sortBy(by: SortTypeSubtitles): Array<Subtitle> {
        const funcCompare = (elt1: Subtitle, elt2: Subtitle) => {
            if (elt1[by] > elt2[by]) return 1;
            else if (elt1[by] < elt2[by]) return -1;
            else return 0;
        }
        return this.subtitles.sort(funcCompare);
    }
}