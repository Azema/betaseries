import {Base, Obj, HTTP_VERBS, MediaType, EventTypes} from "./Base";
import { implAddNote } from "./Note";
import { Season } from "./Season";
import { Subtitles } from "./Subtitle";

declare var PopupAlert: any;

export type Platform_link = {
    /**
     * @type {number} Identifiant de l'épisode sur la plateforme
     */
    id: number;
    /**
     * @type {string} Lien vers l'épisode sur la plateforme
     */
    link: string;
    /**
     * @type {string} Le nom de la plateforme
     */
    platform: string;
};
export type ReleasesSvod = {
    displayOriginal: boolean;
    releases: Array<string>;
};
export type WatchedBy = {
    /**
     * @type {number} Identifiant du membre
     */
    id: number;
    /**
     * @type {string} Login du membre
     */
    login: string;
    /**
     * @type {number} La note du membre
     */
    note: number;
};

export class Episode extends Base implements implAddNote {
    /**
     * @type {Season} L'objet Season contenant l'épisode
     */
    _season: Season;
    /**
     * @type {string} Le code de l'épisode SXXEXX
     */
    code: string;
    /**
     * @type {Date} La date de sortie de l'épisode
     */
    date: Date;
    /**
     * @type {string}
     */
    director: string;
    /**
     * @type {number} Le numéro de l'épisode dans la saison
     */
    episode: number;
    /**
     * @type {number} Le numéro de l'épisode dans la série
     */
    global: number;
    /**
     * @type {number} Le numéro de la saison
     */
    numSeason: number;
    /**
     * @type {Array<Platform_link>} Les plateformes de diffusion
     */
    platform_links: Array<Platform_link>;
    /**
     * @type {ReleasesSvod}
     */
    releasesSvod: ReleasesSvod;
    /**
     * @type {number} Nombre de membres de BS à avoir vu l'épisode
     */
    seen_total: number;
    /**
     * @type {boolean} Indique si il s'agit d'un épisode spécial
     */
    special: boolean;
    /**
     * @type {Array<Subtitle>} Tableau des sous-titres dispo sur BS
     */
    subtitles: Subtitles;
    /**
     * @type {number} Identifiant de l'épisode sur thetvdb.com
     */
    thetvdb_id: number;
    /**
     * @type {Array<WatchedBy>} Tableau des amis ayant vu l'épisode
     */
    watched_by: Array<WatchedBy>;
    /**
     * @type {Array<string>} Tableau des scénaristes de l'épisode
     */
    writers: Array<string>;
    /**
     * @type {string} Identifiant de la vidéo sur Youtube
     */
    youtube_id: string;

    /**
     * Constructeur de la classe Episode
     * @param   {Obj}       data    Les données provenant de l'API
     * @param   {Season}    season  L'objet Season contenant l'épisode
     * @returns {Episode}
     */
    constructor(data: any, season: Season) {
        super(data);
        this._season = season;
        return this.fill(data);
    }
    /**
     * Remplit l'objet avec les données fournit en paramètre
     * @param  {any} data Les données provenant de l'API
     * @returns {Episode}
     * @override
     */
    fill(data: any): this {
        this.code = data.code;
        this.date = new Date(data.date);
        this.director = data.director;
        this.episode = parseInt(data.episode, 10);
        this.global = parseInt(data.global, 10);
        this.numSeason = parseInt(data.season, 10);
        this.platform_links = data.platform_links;
        this.releasesSvod = data.releasesSvod;
        this.seen_total = (data.seen_total !== null) ? parseInt(data.seen_total, 10) : 0;
        this.special = data.special === 1 ? true : false;
        this.subtitles = new Subtitles(data.subtitles || []);
        this.thetvdb_id = parseInt(data.thetvdb_id, 10);
        this.watched_by = data.watched_by;
        this.writers = data.writers;
        this.youtube_id = data.youtube_id;
        this.mediaType = {singular: MediaType.episode, plural: 'episodes', className: Episode};
        super.fill(data);
        return this.save();
    }
    /**
     * Ajoute le titre de l'épisode à l'attribut Title
     * du DOMElement correspondant au titre de l'épisode
     * sur la page Web
     *
     * @return {Episode} L'épisode
     */
    addAttrTitle(): Episode {
        // Ajout de l'attribut title pour obtenir le nom complet de l'épisode, lorsqu'il est tronqué
        if (this.elt)
            this.elt.find('.slide__title').attr('title', this.title);
        return this;
    }
    /**
     * Met à jour le DOMElement .checkSeen avec les
     * données de l'épisode (id, pos, special)
     * @param  {number} pos  La position de l'épisode dans la liste
     * @return {Episode}
     */
    initCheckSeen(pos: number): Episode {
        const $checkbox = this.elt.find('.checkSeen');
        if ($checkbox.length > 0 && this.user.seen) {
            // On ajoute l'attribut ID et la classe 'seen' à la case 'checkSeen' de l'épisode déjà vu
            $checkbox.attr('id', 'episode-' + this.id);
            $checkbox.attr('data-id', this.id);
            $checkbox.attr('data-pos', pos);
            $checkbox.attr('data-special', this.special ? '1' : '0');
            $checkbox.attr('title', Base.trans("member_shows.remove"));
            $checkbox.addClass('seen');
        } else if ($checkbox.length <= 0 && !this.user.seen && !this.user.hidden) {
            // On ajoute la case à cocher pour permettre d'indiquer l'épisode comme vu
            this.elt.find('.slide__image')
                .append(`<div id="episode-${this.id}"
                                class="checkSeen"
                                data-id="${this.id}"
                                data-pos="${pos}"
                                data-special="${this.special ? '1' : '0'}"
                                style="background: rgba(13,21,28,.2);"
                                title="${Base.trans("member_shows.markas")}"></div>`
            );
            this.elt.find('.slide__image img.js-lazy-image').attr('style', 'filter: blur(5px);');
        } else if ($checkbox.length > 0 && this.user.hidden) {
            $checkbox.remove();
        }
        return this;
    }
    /**
     * Met à jour les infos de la vignette et appelle la fonction d'update du rendu
     * @param  {number} pos La position de l'épisode dans la liste
     * @return {boolean}    Indique si il y a eu un changement
     */
    updateCheckSeen(pos: number): boolean {
        const $checkSeen = this.elt.find('.checkSeen');
        let changed = false;
        if ($checkSeen.length > 0 && $checkSeen.attr('id') === undefined) {
            if (Base.debug) console.log('ajout de l\'attribut ID à l\'élément "checkSeen"');
            // On ajoute l'attribut ID
            $checkSeen.attr('id', 'episode-' + this.id);
            $checkSeen.data('id', this.id);
            $checkSeen.data('pos', pos);
            $checkSeen.data('special', this.special ? '1': '0');
        }
        // if (Base.debug) console.log('updateCheckSeen', {seen: this.user.seen, elt: this.elt, checkSeen: $checkSeen.length, classSeen: $checkSeen.hasClass('seen'), pos: pos, Episode: this});
        // Si le membre a vu l'épisode et qu'il n'est pas indiqué, on change le statut
        if (this.user.seen && $checkSeen.length > 0 && !$checkSeen.hasClass('seen')) {
            if (Base.debug) console.log('Changement du statut (seen) de l\'épisode %s', this.code);
            this.updateRender('seen', false);
            changed = true;
        }
        // Si le membre n'a pas vu l'épisode et qu'il n'est pas indiqué, on change le statut
        else if (!this.user.seen && $checkSeen.length > 0 && $checkSeen.hasClass('seen')) {
            if (Base.debug) console.log('Changement du statut (notSeen) de l\'épisode %s', this.code);
            this.updateRender('notSeen', false);
            changed = true;
        }
        else if (this.user.hidden && $checkSeen.length > 0) {
            $checkSeen.remove();
            changed = true;
        }
        return changed;
    }
    /**
     * Retourne le code HTML du titre de la popup
     * pour l'affichage de la description
     * @return {string}
     */
    getTitlePopup(): string {
        return `<span style="color: var(--link_color);">Synopsis épisode ${this.code}</span>`;
    }
    /**
     * Définit le film, sur le compte du membre connecté, comme "vu"
     * @returns {void}
     */
    markAsView(): void {
        this.updateStatus('seen', HTTP_VERBS.POST);
    }
    /**
     * Définit le film, sur le compte du membre connecté, comme "non vu"
     * @returns {void}
     */
    markAsUnview(): void {
        this.updateStatus('unseen', HTTP_VERBS.DELETE);
    }
    /**
     * Modifie le statut d'un épisode sur l'API
     * @param  {String} status    Le nouveau statut de l'épisode
     * @param  {String} method    Verbe HTTP utilisé pour la requête à l'API
     * @return {void}
     */
    updateStatus(status: string, method: HTTP_VERBS): void {
        const _this = this;
        const pos = this.elt.find('.checkSeen').data('pos');
        let promise = new Promise(resolve => { resolve(false); });
        let args = {id: this.id, bulk: true};
        this.toggleSpinner(true);

        if (method === HTTP_VERBS.POST) {
            let createPromise = () => {
                return new Promise(resolve => {
                    // eslint-disable-next-line no-undef
                    new PopupAlert({
                        title: 'Episodes vus',
                        text: 'Doit-on cocher les épisodes précédents comme vu ?',
                        callback_yes: () => {
                            resolve(true);
                        },
                        callback_no: () => {
                            resolve(false);
                        }
                    });
                });
            };
            const $vignettes = jQuery('#episodes .checkSeen');
            // On verifie si les épisodes précédents ont bien été indiqués comme vu
            for (let v = 0; v < pos; v++) {
                if (! $($vignettes.get(v)).hasClass('seen')) {
                    promise = createPromise();
                    break;
                }
            }
        }

        promise.then((response: boolean) => {
            if (method === HTTP_VERBS.POST && !response) {
                args.bulk = false; // Flag pour ne pas mettre les épisodes précédents comme vus automatiquement
            }

            Base.callApi(method, 'episodes', 'watched', args).then((data: Obj) =>
            {
                if (Base.debug) console.log('updateStatus %s episodes/watched', method, data);
                // Si un épisode est vu et que la série n'a pas été ajoutée
                // au compte du membre connecté
                if (! _this._season.showInAccount() && data.episode.show.in_account) {
                    _this._season.addShowToAccount();
                }
                // On met à jour l'objet Episode
                if (method === HTTP_VERBS.POST && response && pos) {
                    const $vignettes = jQuery('#episodes .slide_flex');
                    let episode: Episode = null;
                    for (let e = 0; e < pos; e++) {
                        episode = _this._season.episodes[e];
                        if (episode.elt === null) {
                            episode.elt = jQuery($vignettes.get(e));
                        }
                        if (! episode.user.seen) {
                            episode.user.seen = true;
                            episode
                                .updateRender('seen', false)
                                .save();
                        }
                    }
                }
                _this
                    .fill(data.episode)
                    .updateRender(status, true)
                    ._callListeners(EventTypes.UPDATE)
                    ._season.updateShow(() => {
                        _this.toggleSpinner(false);
                    });
            })
            .catch(err => {
                if (Base.debug) console.error('updateStatus error %s', err);
                if (err && err == 'changeStatus') {
                    if (Base.debug) console.log('updateStatus error %s changeStatus', method);
                    _this.updateRender(status);
                    if (status === 'seen') {
                        _this.user.seen = true;
                    } else {
                        _this.user.seen = false;
                    }
                    _this.toggleSpinner(false);
                } else {
                    _this.toggleSpinner(false);
                    Base.notification('Erreur de modification d\'un épisode', 'updateStatus: ' + err);
                }
            });
        });
    }
    /**
     * Change le statut visuel de la vignette sur le site
     * @param  {String} newStatus     Le nouveau statut de l'épisode
     * @param  {bool}   [update=true] Mise à jour de la ressource en cache et des éléments d'affichage
     * @return {Episode}
     */
    updateRender(newStatus: string, update: boolean = true): Episode {
        const $elt: JQuery<HTMLElement> = this.elt.find('.checkSeen');
        if (Base.debug) console.log('changeStatus', {elt: $elt, status: newStatus, update: update});
        if (newStatus === 'seen') {
            $elt.css('background', ''); // On ajoute le check dans la case à cocher
            $elt.addClass('seen'); // On ajoute la classe 'seen'
            $elt.attr('title', Base.trans("member_shows.remove"));
            // On supprime le voile masquant sur la vignette pour voir l'image de l'épisode
            $elt.parents('div.slide__image').first().find('img').removeAttr('style');
            $elt.parents('div.slide_flex').first().removeClass('slide--notSeen');
        } else {
            $elt.css('background', 'rgba(13,21,28,.2)'); // On enlève le check dans la case à cocher
            $elt.removeClass('seen'); // On supprime la classe 'seen'
            $elt.attr('title', Base.trans("member_shows.markas"));
            // On remet le voile masquant sur la vignette de l'épisode
            $elt.parents('div.slide__image').first()
                .find('img')
                .attr('style', 'filter: blur(5px);');

            const contVignette: JQuery<HTMLElement> = $elt.parents('div.slide_flex').first();
            if (!contVignette.hasClass('slide--notSeen')) {
                contVignette.addClass('slide--notSeen');
            }
        }
        this._season.updateRender();

        return this;
    }
    /**
     * Affiche/masque le spinner de modification de l'épisode
     *
     * @param  {boolean}  display  Le flag indiquant si afficher ou masquer
     * @return {Episode}
     */
    toggleSpinner(display: boolean): Episode {
        if (! display) {
            jQuery('.spinner').remove();
            // if (Base.debug) console.log('toggleSpinner');
            if (Base.debug) console.groupEnd();
        } else {
            if (Base.debug) console.groupCollapsed('episode checkSeen');
            // if (Base.debug) console.log('toggleSpinner');
            this.elt.find('.slide__image').first().prepend(`
                <div class="spinner">
                    <div class="spinner-item"></div>
                    <div class="spinner-item"></div>
                    <div class="spinner-item"></div>
                </div>`
            );
        }
        return this;
    }
}