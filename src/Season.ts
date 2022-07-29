import { UsBetaSeries, HTTP_VERBS, isNull, Obj } from "./Base";
import { Episode } from "./Episode";
import { RelatedProp, RenderHtml } from "./RenderHtml";
import { Show } from "./Show";

declare const PopupAlert;

export class Season extends RenderHtml {
    static logger = new UsBetaSeries.setDebug('Show:Season');
    static debug = Season.logger.debug.bind(Season.logger);

    /**
     * Les différents sélecteurs CSS des propriétés de l'objet
     * @static
     * @type {Record<string, string>}
     */
    static selectorsCSS: Record<string, string> = {
        title: 'div.slide__title',
        nbEpisodes: 'div.slide__infos',
        image: 'div.slide__image img',
        seen: '.checkSeen',
        hidden: '.hideIcon'
    };
    /**
     * Objet contenant les informations de relations entre les propriétés des objets de l'API
     * et les proriétés de cette classe.
     * Sert à la construction de l'objet
     * @static
     * @type {Record<string, RelatedProp>}
     */
    static relatedProps: Record<string, RelatedProp> = {
        // data: Obj => object: Season
        number: {key: "number", type: 'number', default: 0},
        episodes: {key: "nbEpisodes", type: 'number', default: 0},
        seen: {key: 'seen', type: 'boolean', default: false},
        hidden: {key: 'hidden', type: 'boolean', default: false},
        image: {key: 'image', type: 'string'},
        has_subtitles: {key: "has_subtitles", type: 'boolean', default: false}
    };
    /**
     * Numéro de la saison dans la série
     * @type {number}
     */
    number: number;
    /**
     * Tableau des épisodes de la saison
     * @type {Array<Episode>}
     */
    episodes: Array<Episode>;
    /**
     * Nombre d'épisodes dans la saison
     * @type {number}
     */
    nbEpisodes: number;
    /**
     * Possède des sous-titres
     * @type {boolean}
     */
    has_subtitles: boolean;
    /**
     * Indique si la saison est indiquée comme ignorée par le membre
     * @type {boolean}
     */
    hidden: boolean;
    /**
     * URL de l'image
     * @type {string}
     */
    image: string;
    /**
     * Indique si le membre a vu la saison complète
     * @type {boolean}
     */
    seen: boolean;
    /**
     * L'objet Show auquel est rattaché la saison
     * @type {Show}
     */
    private _show: Show;
    /**
     * Objet contenant les promesses en attente des méthodes fetchXXX
     * @type {Object.<string, Promise<Season>>}
     */
    private __fetches: Record<string, Promise<Season>> = {};

    /**
     * Constructeur de la classe Season
     * @param   {Obj}   data    Les données provenant de l'API
     * @param   {Show}  show    L'objet Show contenant la saison
     * @returns {Season}
     */
    constructor(data: Obj, show: Show) {
        const number = (data.number) ? parseInt(data.number, 10) : null;
        // Si le parent Show à son HTMLElement de déclaré, alors on déclare celui de la saison
        const elt = (number && show.elt) ? jQuery(`#seasons .slides_flex .slide_flex:nth-child(${number.toString()})`) : null;
        super(data, elt);
        this._show = show;
        this.episodes = [];
        return this.fill(data)._initRender();
    }

    /**
     * Initialise le rendu HTML de la saison
     * @returns {Seasons}
     */
    _initRender(): this {
        if (!this.elt) return this;

        this.elt
            .attr('data-number', this.number)
            .attr('data-seen', this.seen ? '1' : '0')
            .attr('data-hidden', this.hidden ? '1' : '0')
            .attr('data-episodes', this.nbEpisodes);

        const $nbEpisode = jQuery(Season.selectorsCSS.nbEpisodes, this.elt);
        const $spanNbEpisodes = jQuery(Season.selectorsCSS.nbEpisodes + ' span.nbEpisodes', this.elt);
        Season.debug('Season._initRender', $nbEpisode, $spanNbEpisodes);
        if ($nbEpisode.length > 0 && $spanNbEpisodes.length <= 0) {
            $nbEpisode.empty().append(`<span class="nbEpisodes">${this.nbEpisodes}</span> épisodes`);
        }
        const $img = jQuery(Season.selectorsCSS.image, this.elt);
        const $checkSeen = jQuery(Season.selectorsCSS.seen, this.elt);
        const $hidden = jQuery(Season.selectorsCSS.hidden, this.elt);
        if (this.seen && $checkSeen.length <= 0) {
            $img.before('<div class="checkSeen"></div>');
        }
        else if (this.hidden && $hidden.length <= 0) {
            $img.before('<div class="hideIcon"></div>');
        }
        return this;
    }

    /**
     * Mise à jour du nombre d'épisodes de la saison sur la page Web
     * @returns {void}
     */
    updatePropRenderNbepisodes(): void {
        if (!this.elt) return;
        const $nbEpisode = jQuery(Season.selectorsCSS.nbEpisodes + ' span.nbEpisodes', this.elt);
        if ($nbEpisode.length > 0) {
            $nbEpisode.text(this.nbEpisodes);
        }
    }

    /**
     * Mise à jour de l'image de la saison sur la page Web
     * @returns {void}
     */
    updatePropRenderImage(): void {
        if (!this.elt) return;
        // Si image est null, on récupère celle de la série
        if (isNull(this.image) && !isNull(this._show.images.poster)) {
            this.image = this._show.images.poster;
            return;
        }
        // Si celle de la série est null, on ne fait rien
        else if (isNull(this.image)) {
            return;
        }
        const $img = jQuery(Season.selectorsCSS.image, this.elt);
        if ($img.length > 0 && $img.attr('src') != this.image) {
            $img.attr('src', this.image);
        }
        return;
    }

    /**
     * Retourne le nombre d'épisodes dans la saison
     * @returns {number}
     */
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
        if (this.__fetches.fepisodes) return this.__fetches.fepisodes;
        const self = this;
        const params = {
            id: self._show.id,
            season: self.number
        };
        this.__fetches.fepisodes = UsBetaSeries.callApi('GET', 'shows', 'episodes', params, true)
            .then((data: Obj) => {
                if (isNull(self.episodes) || self.episodes.length <= 0) {
                    self.episodes = new Array(data.episodes.length);
                    for (let e = 0; e < data.episodes.length; e++) {
                        const selector = `#episodes .slides_flex .slide_flex:nth-child(${e+1})`;
                        self.episodes[e] = new Episode(data.episodes[e], self, jQuery(selector));
                    }
                } else {
                    for (let e = 0; e < data.episodes.length; e++) {
                        // const selector = `#episodes .slides_flex .slide_flex:nth-child(${e+1})`;
                        const episode = self.getEpisode(data.episodes[e].id);
                        if (episode) {
                            episode.fill(data.episodes[e]);
                        } else {
                            Season.debug('Season.checkEpisodes: episode(pos: %d) unknown', e, data.episodes[e]);
                            const selector = `#episodes .slides_flex .slide_flex:nth-child(${e+1})`;
                            self.episodes.push(new Episode(data.episodes[e], self, jQuery(selector)));
                        }
                    }
                }
                delete self.__fetches.fepisodes;
                return self;
            })
            .catch(err => {
                delete self.__fetches.fepisodes;
                console.warn('Season.fetchEpisodes error', err);
                return self;
            });

        return this.__fetches.fepisodes as Promise<Season>;
    }
    /**
     * Vérifie et met à jour les épisodes de la saison
     * @returns {Promise<Season>}
     */
    /* checkEpisodes(): Promise<Season> {
        if (!this.number || this.number <= 0) {
            throw new Error('season number incorrect');
        }
        if (this.__fetches.cepisodes) return this.__fetches.cepisodes;
        const self = this;
        const params = {
            id: self._show.id,
            season: self.number
        };
        this.__fetches.cepisodes = UsBetaSeries.callApi('GET', 'shows', 'episodes', params, true)
            .then((data: Obj) => {
                if (isNull(self.episodes) || self.episodes.length <= 0) {
                    self.episodes = [data.episodes.length];
                    for (let e = 0; e < data.episodes.length; e++) {
                        const selector = `#episodes .slides_flex .slide_flex:nth-child(${e+1})`;
                        self.episodes.push(new Episode(data.episodes[e], self, jQuery(selector)));
                    }
                } else {
                    for (let e = 0; e < data.episodes.length; e++) {
                        // const selector = `#episodes .slides_flex .slide_flex:nth-child(${e+1})`;
                        const episode = self.getEpisode(data.episodes[e].id);
                        if (episode) {
                            episode.fill(data.episodes[e]);
                        } else {
                            Season.debug('Season.checkEpisodes: episode(pos: %d) unknown', e, data.episodes[e]);
                            const selector = `#episodes .slides_flex .slide_flex:nth-child(${e+1})`;
                            self.episodes.push(new Episode(data.episodes[e], self, jQuery(selector)));
                        }
                    }
                }
                delete self.__fetches.cepisodes;
                return self;
            })
            .catch(err => {
                console.warn('Season.checkEpisodes error', err);
                delete self.__fetches.cepisodes;
                return self;
            });

        return this.__fetches.cepisodes as Promise<Season>;
    } */

    /**
     * Cette méthode permet de passer tous les épisodes de la saison en statut **seen**
     * @returns {Promise<Season>}
     */
    watched(): Promise<Season> {
        const self = this;
        const params = {id: this.episodes[this.length - 1].id, bulk: true};
        return UsBetaSeries.callApi(HTTP_VERBS.POST, 'episodes', 'watched', params)
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
    /**
     * Cette méthode permet de passer tous les épisodes de la saison en statut **hidden**
     * @returns {Promise<Season>}
     */
    hide(): Promise<Season> {
        const self = this;
        const params = {id: this._show.id, season: this.number};
        return UsBetaSeries.callApi(HTTP_VERBS.POST, 'seasons', 'hide', params)
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
     * @returns {Episode | null}
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
     * @returns {Promise<Show>}
     */
    updateShow(): Promise<Show> {
        return this._show.update();
    }
    /**
     * Vérifie la modification des épisodes et met à jour le rendu HTML, ainsi que la série
     * @returns {Promise<Season>}
     */
    update(): Promise<Season> {
        const self = this;
        return this.fetchEpisodes().then(() => {
            Season.debug('Season.update: episodes', self.episodes);
            for (const episode of self.episodes) {
                Season.debug('Season.update: check episode changes', episode);
                if (episode.isModified()) {
                    Season.debug('Season.update changed true', self);
                    return self.updateRender()
                               .updateShow().then(() => self);
                }
            }
            Season.debug('Season.update no changes');
            return self;
        }).catch(err => {
            console.error(err);
            UsBetaSeries.notification('Erreur de mise à jour des épisodes', 'Season update: ' + err);
        }) as Promise<Season>;
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
        Season.debug('Season.updateRender', {lenEpisodes, lenSpecials, lenNotSpecials, lenSeen});
        /**
         * Met à jour la vignette de la saison courante
         * et change de saison, si il y en a une suivante
         */
        const seasonViewed = function(): void {
            // On check la saison
            self.elt.find('.slide__image').prepend('<div class="checkSeen"></div>');
            Season.debug('Season.updateRender: Tous les épisodes de la saison ont été vus', self.elt, self.elt.next());
            // Si il y a une saison suivante, on la sélectionne
            if (self.elt.next('.slide_flex').length > 0) {
                Season.debug('Season.updateRender: Il y a une autre saison');
                self.elt.removeClass('slide--current');
                self.elt.next('.slide_flex').find('.slide__image').trigger('click');
            }
            self.elt
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
            const $checkSeen: JQuery<HTMLElement> = this.elt.find('.checkSeen');
            if ($checkSeen.length > 0) {
                $checkSeen.remove();
                if (!self.elt.hasClass('slide--notSeen')) {
                    self.elt
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