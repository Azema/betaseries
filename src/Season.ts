import { Base, HTTP_VERBS, Obj } from "./Base";
import { Episode } from "./Episode";
import { Show } from "./Show";

declare var PopupAlert;

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
     * @type {boolean} Possède des sous-titres
     */
    has_subtitles: boolean;
    /**
     * @type {boolean} Saison pas vu
     */
    hidden: boolean;
    /**
     * @type {string} URL de l'image
     */
    image: string;
    /**
     * @type {boolean} Saison vu
     */
    seen: boolean;
    /**
     * @type {Show} L'objet Show auquel est rattaché la saison
     */
    private _show: Show;
    /**
     * @type {JQuery<HTMLElement>} Le DOMElement jQuery correspondant à la saison
     */
    private _elt: JQuery<HTMLElement>;

    /**
     * Constructeur de la classe Season
     * @param   {Obj}   data    Les données provenant de l'API
     * @param   {Show}  show    L'objet Show contenant la saison
     * @returns {Season}
     */
    constructor(data: Obj, show: Show) {
        this.number = parseInt(data.number, 10);
        this._show = show;
        this.episodes = new Array();
        this.has_subtitles = !!data.has_subtitles || false;
        this.hidden = !!data.hidden || false;
        this.seen = !!data.seen || false;
        this.image = data.image || null;
        // document.querySelector("#seasons > div > div.positionRelative > div > div:nth-child(2)")
        this._elt = jQuery(`#seasons .slides_flex .slide_flex:nth-child(${this.number.toString()})`);
        if (data.episodes && data.episodes instanceof Array && data.episodes[0] instanceof Episode) {
            this.episodes = data.episodes;
        }
        return this;
    }

    get length(): number {
        return this.episodes.length;
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
                    _this.episodes.push(new Episode(data.episodes[e], _this));
                }
                resolve(_this);
            }, err => {
                reject(err);
            });
        });
    }

    watched(): Promise<Season> {
        const self = this;
        const params = {id: this.episodes[this.length - 1].id, bulk: true};
        return Base.callApi(HTTP_VERBS.POST, 'episodes', 'watched', params)
        .then((data: Obj) => {
            let update = false;
            for (let e = 0; e < self.episodes.length; e++) {
                if (e == self.episodes.length - 1) update = true;
                self.episodes[e].user.seen = true;
                self.episodes[e].updateRender('seen', update);
            }
            return self;
        });
    }

    hide(): Promise<Season> {
        const self = this;
        const params = {id: this._show.id, season: this.number};
        return Base.callApi(HTTP_VERBS.POST, 'seasons', 'hide', params)
        .then((data: Obj) => {
            self.hidden = true;
            jQuery(`#seasons .slide_flex:nth-child(${self.number}) .slide__image`).prepend('<div class="checkSeen"></div><div class="hideIcon"></div>');
            let update = false;
            for (let e = 0; e < self.episodes.length; e++) {
                if (e == self.episodes.length - 1) update = true;
                self.episodes[e].user.hidden = true;
                self.episodes[e].updateRender('hidden', update);
            }
            return self;
        })
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

    /**
     * Met à jour l'objet Show
     * @param {Function} cb Function de callback
     * @returns {Season}
     */
    updateShow(cb: Function = Base.noop): Season {
        this._show.update(true).then(cb as (value: Show) => Show);
        return this;
    }

    /**
     * Change le statut visuel de la saison sur le site
     * @return {Season}
     */
    updateRender(): Season {
        const self: Season = this;
        const lenEpisodes: number = this.episodes.length;
        const lenSpecials: number = this.getNbEpisodesSpecial();
        const lenNotSpecials: number = lenEpisodes - lenSpecials;
        const lenSeen: number = self.getNbEpisodesSeen();
        if (Base.debug) console.log('Season updateRender', {lenEpisodes, lenSpecials, lenNotSpecials, lenSeen});
        /**
         * Met à jour la vignette de la saison courante
         * et change de saison, si il y en a une suivante
         */
        const seasonViewed = function(): void {
            // On check la saison
            self._elt.find('.slide__image').prepend('<div class="checkSeen"></div>');
            if (Base.debug) console.log('Tous les épisodes de la saison ont été vus', self._elt, self._elt.next());
            // Si il y a une saison suivante, on la sélectionne
            if (self._elt.next().length > 0) {
                if (Base.debug) console.log('Il y a une autre saison');
                self._elt.removeClass('slide--current');
                self._elt.next('.slide_flex').find('.slide__image').trigger('click');
            }
            self._elt
                .removeClass('slide--notSeen')
                .addClass('slide--seen');
            self.seen = true;
        };
        // Si tous les épisodes de la saison ont été vus
        if (lenSeen === lenEpisodes) {
            seasonViewed();
        }
        // Si tous les épisodes de la saison, hors spéciaux, ont été vus
        else if (lenSpecials > 0 && lenSeen === lenNotSpecials) {
            // eslint-disable-next-line no-undef
            new PopupAlert({
                title: 'Fin de la saison',
                text: 'Tous les épisodes de la saison, hors spéciaux, ont été vu.<br/>Voulez-vous passer à la saison suivante ?',
                callback_yes: () => {
                    seasonViewed();
                },
                callback_no: () => {
                    return true;
                }
            });
        } else {
            const $checkSeen: JQuery<HTMLElement> = this._elt.find('.checkSeen');
            if ($checkSeen.length > 0) {
                $checkSeen.remove();
                if (!self._elt.hasClass('slide--notSeen')) {
                    self._elt
                        .addClass('slide--notSeen')
                        .removeClass('slide--seen');
                }
            }
        }

        return this;
    }

    /**
     * Modifie la saison courante de l'objet Show
     * @param   {number} seasonNumber Le numéro de la saison
     * @returns {Season}
     */
    changeCurrentSeason(seasonNumber: number): Season {
        this._show.setCurrentSeason(seasonNumber);
        return this;
    }

    /**
     * Indique si la série est sur le compte du membre connecté
     * @returns {boolean}
     */
    showInAccount(): boolean {
        return this._show.in_account;
    }

    /**
     * Définit la série comme étant sur le compte du membre connecté
     * @returns {Season}
     */
    addShowToAccount(): Season {
        this._show.in_account = true;
        return this;
    }
}