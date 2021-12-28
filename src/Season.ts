import { Base, Obj } from "./Base";
import { Episode } from "./Episode";
import { Show } from "./Show";

export class Season {
    /**
     * @type {number} Numéro de la saison dans la série
     */
    number: number;
    /**
     * @type {Array<Episode>} Tableau des épisodes de la saison
     */
    episodes: Array<Episode>;
    /**
     * @type {Show} L'objet Show auquel est rattaché la saison
     */
    private _show: Show;

    /**
     * Constructeur de la classe Season
     * @param   {Obj}   data    Les données provenant de l'API
     * @param   {Show}  show    L'objet Show contenant la saison
     * @returns {Season}
     */
    constructor(data: Obj, show: Show) {
        this.number = parseInt(data.number, 10);
        this._show = show;
        if (data.episodes && data.episodes instanceof Array && data.episodes[0] instanceof Episode) {
            this.episodes = data.episodes;
        }
        return this;
    }

    /**
     * Récupère les épisodes de la saison sur l'API
     * @returns {Promise<Season>}
     */
    fetchEpisodes(): Promise<Season> {
        if (!this.number || this.number <= 0) {
            throw new Error('season number incorrect');
        }
        const _this = this;
        return new Promise((resolve: Function, reject: Function) => {
            Base.callApi('GET', 'shows', 'episodes', {id: _this._show.id, season: _this.number}, true)
            .then(data => {
                _this.episodes = [];
                for (let e = 0; e < data.episodes.length; e++) {
                    _this.episodes.push(new Episode(data.episodes[e], _this._show, _this));
                }
                resolve(_this);
            }, err => {
                reject(err);
            });
        });
    }

    /**
     * Retourne l'épisode correspondant à l'identifiant fournit
     * @param  {number} id
     * @returns {Episode}
     */
    getEpisode(id: number): Episode {
        for (let e = 0; e < this.episodes.length; e++) {
            if (this.episodes[e].id === id) {
                return this.episodes[e];
            }
        }
        return null;
    }

    /**
     * Retourne le nombre d'épisodes vus
     * @returns {number} Le nombre d'épisodes vus dans la saison
     */
    getNbEpisodesSeen(): number {
        let nbEpisodesSeen = 0;
        for (let e = 0; e < this.episodes.length; e++) {
            if (this.episodes[e].user.seen) nbEpisodesSeen++;
        }
        return nbEpisodesSeen;
    }

    /**
     * Retourne le nombre d'épisodes spéciaux
     * @returns {number} Le nombre d'épisodes spéciaux
     */
    getNbEpisodesSpecial(): number {
        let nbEpisodesSpecial = 0;
        for (let e = 0; e < this.episodes.length; e++) {
            if (this.episodes[e].special) nbEpisodesSpecial++;
        }
        return nbEpisodesSpecial;
    }
}