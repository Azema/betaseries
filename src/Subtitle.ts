import { Base, HTTP_VERBS, Obj } from "./Base";

export class Subtitle {
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

export enum SortTypeSubtitles {
    LANGUAGE = 'language',
    SOURCE = 'source',
    QUALITY = 'quality',
    DATE = 'date'
}

export enum SubtitleTypes {
    EPISODE = 'episode',
    SEASON = 'season',
    SHOW = 'show'
}

export enum SubtitleLanguages {
    ALL = 'all',
    VOVF = 'vovf',
    VO = 'vo',
    VF = 'vf'
}
export type ParamsFetchSubtitles = {
    id: number;
    season?: number;
};

export class Subtitles {
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
    public static fetch(type: SubtitleTypes, ids: ParamsFetchSubtitles, language: SubtitleLanguages = SubtitleLanguages.ALL): Promise<Subtitles> {
        const params: Obj = {id: ids.id, language: language};
        if (type === SubtitleTypes.SEASON) {
            params.season = ids.season;
        }
        return Base.callApi(HTTP_VERBS.GET, 'subtitles', type, params)
        .then((data: Obj) => {
            return new Subtitles(data.subtitles);
        });
    }

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