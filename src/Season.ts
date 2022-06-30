import { Base, Callback, HTTP_VERBS, Obj } from "./Base";
import { Episode } from "./Episode";
import { Show } from "./Show";

declare const PopupAlert;

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
     * Nombre d'épisodes dans la saison
     * @type {number}
     */
    nbEpisodes: number;
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
    _image: string;
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
    private __elt: JQuery<HTMLElement>;
    private __fetches: Record<string, Promise<Season>>;

    /**
     * Constructeur de la classe Season
     * @param   {Obj}   data    Les données provenant de l'API
     * @param   {Show}  show    L'objet Show contenant la saison
     * @returns {Season}
     */
    constructor(data: Obj, show: Show) {
        this.__fetches = {};
        this.number = parseInt(data.number, 10);
        this._show = show;
        this.episodes = [];
        this.has_subtitles = !!data.has_subtitles || false;
        this.hidden = !!data.hidden || false;
        this.seen = !!data.seen || false;
        this.image = data.image || null;
        // document.querySelector("#seasons > div > div.positionRelative > div > div:nth-child(2)")
        this.__elt = jQuery(`#seasons .slides_flex .slide_flex:nth-child(${this.number.toString()})`);
        if (data.episodes && data.episodes instanceof Array && data.episodes[0] instanceof Episode) {
            this.episodes = data.episodes;
        } else if (data.episodes && typeof data.episodes === 'number') {
            this.nbEpisodes = data.episodes;
        }
        return this;
    }

    get length(): number {
        return this.episodes.length;
    }
    /**
     * Setter pour l'attribut image
     * @param {string} src - L'URL d'accès à l'image
     */
    set image(src: string) {
        this._image = src;
        if (src) {
            const $imgs = jQuery('#seasons .slide_flex .slide__image img');
            if ($imgs.length >= this.number) {
                $($imgs.get(this.number - 1)).attr('src', src);
            }
        }
    }
    /**
     * Getter pour l'attribut image
     */
    get image(): string {
        return this._image;
    }

    /**
     * Récupère les épisodes de la saison sur l'API
     * @returns {Promise<Season>}
     */
    fetchEpisodes(): Promise<Season> {
        if (!this.number || this.number <= 0) {
            throw new Error('season number incorrect');
        }
        if (this.__fetches.episodes) return this.__fetches.episodes;
        const self = this;
        const params = {
            id: self._show.id,
            season: self.number
        };
        this.__fetches.episodes = Base.callApi('GET', 'shows', 'episodes', params, true)
            .then((data: Obj) => {
                self.episodes = [];
                for (let e = 0; e < data.episodes.length; e++) {
                    self.episodes.push(new Episode(data.episodes[e], self));
                }
                return self;
            })
            .finally(() => delete self.__fetches.episodes);

        return this.__fetches.episodes as Promise<Season>;
    }

    watched(): Promise<Season> {
        const self = this;
        const params = {id: this.episodes[this.length - 1].id, bulk: true};
        return Base.callApi(HTTP_VERBS.POST, 'episodes', 'watched', params)
        .then(() => {
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
        .then(() => {
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
     * Retourne le nombre d'épisodes non vus
     * @returns {number} Le nombre d'épisodes non vus dans la saison
     */
    getNbEpisodesUnwatched(): number {
        let nbEpisodes = 0;
        if (this.episodes.length <= 0 && ! this.seen) return this.nbEpisodes;
        else if (this.episodes.length <= 0 || this.hidden) return 0;
        for (let e = 0; e < this.episodes.length; e++) {
            if (! this.episodes[e].user.seen) nbEpisodes++;
        }
        return nbEpisodes;
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
    updateShow(cb: Callback = Base.noop): Season {
        this._show.update(true).then(cb as unknown as (value: Show) => Show);
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
            self.__elt.find('.slide__image').prepend('<div class="checkSeen"></div>');
            if (Base.debug) console.log('Tous les épisodes de la saison ont été vus', self.__elt, self.__elt.next());
            // Si il y a une saison suivante, on la sélectionne
            if (self.__elt.next().length > 0) {
                if (Base.debug) console.log('Il y a une autre saison');
                self.__elt.removeClass('slide--current');
                self.__elt.next('.slide_flex').find('.slide__image').trigger('click');
            }
            self.__elt
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
            const $checkSeen: JQuery<HTMLElement> = this.__elt.find('.checkSeen');
            if ($checkSeen.length > 0) {
                $checkSeen.remove();
                if (!self.__elt.hasClass('slide--notSeen')) {
                    self.__elt
                        .addClass('slide--notSeen')
                        .removeClass('slide--seen');
                }
            }
            // On scroll jusqu'au premier épisode non vu
            const $epNotSeen = jQuery('#episodes .slide_flex.slide--notSeen');
            if ($epNotSeen.length > 0) {
                jQuery('#episodes .slides_flex').get(0).scrollLeft = $epNotSeen.get(0).offsetLeft - 69;
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

    /**
     * Retourne le prochain épisode non vu
     * @return {Episode} Le prochain épisode non vu
     */
    getNextEpisodeUnwatched(): Episode {
        for (let e = 0; e < this.episodes.length; e++) {
            if (!this.episodes[e].user.seen) return this.episodes[e];
        }
        return null;
    }
}