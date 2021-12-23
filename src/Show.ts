import {Base, Obj, EventTypes, Rating, HTTP_VERBS, MediaType} from "./Base";
import { implAddNote } from "./Note";
import {Media} from "./Media";
import {Season} from "./Episode";

declare var PopupAlert: any;

export class Images {
    constructor(data: any) {
        this.show = data.show;
        this.banner = data.banner;
        this.box = data.box;
        this.poster = data.poster;
    }

    show: string;
    banner: string;
    box: string;
    poster: string;
}
export enum Picked {
    none,
    banner,
    show
}
// eslint-disable-next-line no-unused-vars
export class Picture {
    constructor(data: any) {
        this.id = parseInt(data.id, 10);
        this.show_id = parseInt(data.show_id, 10);
        this.login_id = parseInt(data.login_id, 10);
        this.url = data.url;
        this.width = parseInt(data.width, 10);
        this.height = parseInt(data.height, 10);
        this.date = new Date(data.date);
        this.picked = data.picked;
    }
    id: number;
    show_id: number;
    login_id: number;
    url: string;
    width: number;
    height: number;
    date: Date;
    picked: Picked;
}
export class Platform {
    constructor(data: any) {
        this.id = parseInt(data.id, 10);
        this.name = data.name;
        this.tag = data.tag;
        this.link_url = data.link_url;
        this.available = data.available;
        this.logo = data.logo;
    }

    id: number;
    name: string;
    tag: string;
    link_url: string;
    available: object;
    logo: string;
}
export class Platforms {
    constructor(data: any) {
        if (data.svods && data.svods instanceof Array) {
            this.svods = new Array();
            for (let s = 0; s < data.svods.length; s++) {
                this.svods.push(new Platform(data.svods[s]));
            }
        }
        if (data.svod) {
            this.svod = new Platform(data.svod);
        }
    }

    svods: Array<Platform>;
    svod: Platform;
}
export class Showrunner {
    constructor(data: any) {
        this.id = data.id ? parseInt(data.id, 10) : null;
        this.name = data.name;
        this.picture = data.picture;
    }
    id: number;
    name: string;
    picture: string;
}
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
}
export class Show extends Media implements implShow, implAddNote {
    /***************************************************/
    /*                      STATIC                     */
    /***************************************************/

    /**
     * Types d'évenements gérés par cette classe
     * @type {Array}
     */
     static EventTypes: Array<EventTypes> = new Array(
        EventTypes.UPDATE,
        EventTypes.SAVE,
        EventTypes.ADD,
        EventTypes.REMOVE
    );

    /**
     * Methode static servant à retourner un objet show
     * à partir de son ID
     * @param  {number} id             L'identifiant de la série
     * @param  {boolean} [force=false] Indique si on utilise le cache ou non
     * @return {Promise<Show>}
     */
    static fetch(id: number, force: boolean = false): Promise<Show> {
        return new Promise((resolve: Function, reject: Function) => {
            Base.callApi('GET', 'shows', 'display', {id: id}, force)
            .then(data => resolve(new Show(data, jQuery('.blockInformations'))) )
            .catch(err => reject(err) );
        });
    }
    
    /***************************************************/
    /*                  PROPERTIES                     */
    /***************************************************/

    aliases: object;
    creation: string;
    country: string;
    currentSeason: Season;
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
    
    /***************************************************/
    /*                      METHODS                    */
    /***************************************************/

    constructor(data: Obj, element: JQuery<HTMLElement>) {
        super(data);
        this.elt = element;
        return this.fill(data)._init();
    }
    /**
     * Initialise l'objet lors de sa construction et après son remplissage
     * @returns {Show}
     */
    private _init(): Show {
        // On gère l'ajout et la suppression de la série dans le compte utilisateur
        if (this.in_account) {
            this.deleteShowClick();
        } else {
            this.addShowClick();
        }
        return this;
    }

    /**
     * Récupère les données de la série sur l'API
     * @param  {boolean} [force=true]   Indique si on utilise les données en cache
     * @return {Promise<*>}             Les données de la série
     */
    fetch(force: boolean = true): Promise<any> {
        return Base.callApi('GET', 'shows', 'display', {id: this.id}, force);
    }
    
    /**
     * isEnded - Indique si la série est terminée
     *
     * @return {boolean}  Terminée ou non
     */
    isEnded(): boolean {
        return (this.status.toLowerCase() === 'ended') ? true : false;
    }
    /**
     * isArchived - Indique si la série est archivée
     *
     * @return {boolean}  Archivée ou non
     */
    isArchived(): boolean {
        return this.user.archived;
    }
    /**
     * isFavorite - Indique si la série est dans les favoris
     * 
     * @returns {boolean}
     */
    isFavorite(): boolean {
        return this.user.favorited;
    }
    /**
     * addToAccount - Ajout la série sur le compte du membre connecté
     * @return {Promise<Show>} Promise of show
     */
    addToAccount(): Promise<Show> {
        const _this = this;
        if (this.in_account) return new Promise(resolve => resolve(_this));

        return new Promise((resolve, reject) => {
            Base.callApi('POST', 'shows', 'show', {id: _this.id})
            .then(data => {
                _this.fill(data.show);
                _this._callListeners(EventTypes.ADD);
                _this.save();
                resolve(_this);
            }, err => {
                reject(err);
            });
        });
    }
    /**
     * Remove Show from account member
     * @return {Promise<Show>} Promise of show
     */
    removeFromAccount(): Promise<Show> {
        const _this = this;
        if (! this.in_account) return new Promise(resolve => resolve(_this));

        return new Promise((resolve: Function, reject: Function) => {
            Base.callApi('DELETE', 'shows', 'show', {id: _this.id})
            .then(data => {
                _this.fill(data.show);
                _this._callListeners(EventTypes.REMOVE);
                _this.save();
                resolve(this);
            }, err => {
                reject(err);
            });
        });
    }
    /**
     * Archive la série
     * @return {Promise<Show>} Promise of show
     */
    archive(): Promise<Show> {
        const _this = this;
        return new Promise((resolve, reject) => {
            Media.callApi('POST', 'shows', 'archive', {id: _this.id})
            .then(data => {
                _this.fill(data.show);
                _this.save();
                resolve(_this);
            }, err => {
                reject(err);
            });
        });
    }
    /**
     * Désarchive la série
     * @return {Promise<Show>} Promise of show
     */
    unarchive(): Promise<Show> {
        const _this = this;
        return new Promise((resolve, reject) => {
            Media.callApi('DELETE', 'shows', 'archive', {id: _this.id})
            .then(data => {
                _this.fill(data.show);
                _this.save();
                resolve(_this);
            }, err => {
                reject(err);
            });
        });
    }
    /**
     * Ajoute la série aux favoris
     * @return {Promise<Show>} Promise of show
     */
    favorite(): Promise<Show> {
        const _this = this;
        return new Promise((resolve, reject) => {
            Media.callApi('POST', 'shows', 'favorite', {id: _this.id})
            .then(data => {
                _this.fill(data.show);
                _this.save();
                resolve(_this);
            }, err => {
                reject(err);
            });
        });
    }
    /**
     * Supprime la série des favoris
     * @return {Promise<Show>} Promise of show
     */
    unfavorite(): Promise<Show> {
        const _this = this;
        return new Promise((resolve, reject) => {
            Media.callApi('DELETE', 'shows', 'favorite', {id: _this.id})
            .then(data => {
                _this.fill(data.show);
                _this.save();
                resolve(_this);
            }, err => {
                reject(err);
            });
        });
    }
    /**
     * Met à jour les données de la série
     * @param  {Boolean}  [force=false] Forcer la récupération des données sur l'API
     * @param  {Function} [cb=noop]     Fonction de callback
     * @return {Promise<Show>}          Promesse (Show)
     */
    update(force: boolean = false, cb: Function = Base.noop): Promise<Show> {
        const _this = this;
        return new Promise((resolve: Function, reject: Function) => {
            _this.fetch(force).then(data => {
                _this.fill(data.show);
                _this.updateRender(() => {
                    resolve(_this);
                    cb();
                    _this._callListeners(EventTypes.UPDATE);
                });
            })
            .catch(err => {
                Media.notification('Erreur de récupération de la ressource Show', 'Show update: ' + err);
                reject(err);
                cb();
            });
        });
    }
    /**
     * Met à jour le rendu de la barre de progression
     * et du prochain épisode
     * @param  {Function} cb Fonction de callback
     * @return {void}
     */
    updateRender(cb: Function = Base.noop): void {
        this.updateProgressBar();
        this.updateNextEpisode();
        let note = this.objNote;
        if (Base.debug) {
            console.log('Next ID et status', {
                next: this.user.next.id,
                status: this.status,
                archived: this.user.archived,
                note_user: note.user
            });
        }
        // Si il n'y a plus d'épisodes à regarder
        if (this.user.remaining === 0 && this.in_account) {
            let promise = new Promise(resolve => { return resolve(void 0); });
            // On propose d'archiver si la série n'est plus en production
            if (this.in_account && this.isEnded() && !this.isArchived())
            {
                if (Base.debug) console.log('Série terminée, popup confirmation archivage');
                promise = new Promise(resolve => {
                    // eslint-disable-next-line no-undef
                    new PopupAlert({
                        title: 'Archivage de la série',
                        text: 'Voulez-vous archiver cette série terminée ?',
                        callback_yes: function() {
                            jQuery('#reactjs-show-actions button.btn-archive').trigger('click');
                            resolve(void 0);
                        },
                        callback_no: function() {
                            resolve(void 0);
                            return true;
                        }
                    });
                });
            }
            // On propose de noter la série
            if (note.user === 0) {
                if (Base.debug) console.log('Proposition de voter pour la série');
                promise.then(() => {
                    // eslint-disable-next-line no-undef
                    new PopupAlert({
                        title: Base.trans("popin.note.title.show"),
                        text: "Voulez-vous noter la série ?",
                        callback_yes: function() {
                            jQuery('.blockInformations__metadatas .js-render-stars').trigger('click');
                            return true;
                        },
                        callback_no: function() {
                            return true;
                        }
                    });
                });
            }
            promise.then(() => { cb(); });
        } else {
            cb();
        }
    }
    /**
     * Met à jour la barre de progression de visionnage de la série
     * @return {void}
     */
    updateProgressBar(): void {
        if (Base.debug) console.log('updateProgressBar');
        // On met à jour la barre de progression
        jQuery('.progressBarShow').css('width', this.user.status.toFixed(1) + '%');
    }
    /**
     * Met à jour le bloc du prochain épisode à voir
     * @param   {Function} [cb=noop] Fonction de callback
     * @returns {void}
     */
    updateNextEpisode(cb: Function = Base.noop): void {
        if (Base.debug) console.log('updateNextEpisode');
        const $nextEpisode = jQuery('a.blockNextEpisode');

        if ($nextEpisode.length > 0 && this.user.next && !isNaN(this.user.next.id)) {
            if (Base.debug) console.log('nextEpisode et show.user.next OK', this.user);
            // Modifier l'image
            const $img = $nextEpisode.find('img'),
                  $remaining = $nextEpisode.find('.remaining div'),
                  $parent = $img.parent('div'),
                  height = $img.attr('height'),
                  width = $img.attr('width'),
                  next = this.user.next,
                  src = `${Base.api.url}/pictures/episodes?key=${Base.userKey}&id=${next.id}&width=${width}&height=${height}`;
            $img.remove();
            $parent.append(`<img src="${src}" height="${height}" width="${width}" />`);
            // Modifier le titre
            $nextEpisode.find('.titleEpisode').text(`${next.code.toUpperCase()} - ${next.title}`);
            // Modifier le lien
            $nextEpisode.attr('href', $nextEpisode.attr('href').replace(/s\d{2}e\d{2}/, next.code.toLowerCase()));
            // Modifier le nombre d'épisodes restants
            $remaining.text($remaining.text().trim().replace(/^\d+/, this.user.remaining.toString()));
        }
        else if ($nextEpisode.length <= 0 && this.user.next && !isNaN(this.user.next.id)) {
            if (Base.debug) console.log('No nextEpisode et show.user.next OK', this.user);
            buildNextEpisode(this);
        }
        else if (! this.user.next || isNaN(this.user.next.id)) {
            $nextEpisode.remove();
        }
        cb();

        /**
         * Construit une vignette pour le prochain épisode à voir
         * @param  {Show} res  Objet API show
         * @return {void}
         */
        function buildNextEpisode(res: Show): void {
            const height = 70,
                    width = 124,
                    src = `${Base.api.url}/pictures/episodes?key=${Base.userKey}&id=${res.user.next.id}&width=${width}&height=${height}`,
                    serieTitle = res.resource_url.split('/').pop();
                
            jQuery('.blockInformations__actions').after(
                `<a href="/episode/${serieTitle}/${res.user.next.code.toLowerCase()}" class="blockNextEpisode media">
                    <div class="media-left">
                    <div class="u-insideBorderOpacity u-insideBorderOpacity--01">
                        <img src="${src}" width="${width}" height="${height}">
                    </div>
                    </div>
                    <div class="media-body">
                    <div class="title">
                        <strong>Prochain épisode à regarder</strong>
                    </div>
                    <div class="titleEpisode">
                        ${res.user.next.code.toUpperCase()} - ${res.user.next.title}
                    </div>
                    <div class="remaining">
                        <div class="u-colorWhiteOpacity05">${res.user.remaining} épisode${(res.user.remaining > 1) ? 's' : ''} à regarder</div>
                    </div>
                    </div>
                </a>`
            );
        }
    }
    /**
     * On gère l'ajout de la série dans le compte utilisateur
     *
     * @param   {boolean} trigEpisode Flag indiquant si l'appel vient d'un episode vu ou du bouton
     * @returns {void}
     */
    addShowClick(trigEpisode: boolean = false): void {
        const _this = this;
        const vignettes = $('#episodes .slide__image');
        // Vérifier si le membre a ajouter la série à son compte
        if (! this.in_account) {
            // Remplacer le DOMElement supprime l'eventHandler
            jQuery('#reactjs-show-actions').html(`
                <div class="blockInformations__action">
                    <button class="btn-reset btn-transparent" type="button">
                    <span class="svgContainer">
                        <svg fill="#0D151C" width="14" height="14" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14 8H8v6H6V8H0V6h6V0h2v6h6z" fill-rule="nonzero"></path>
                        </svg>
                    </span>
                    </button>
                    <div class="label">Ajouter</div>
                </div>`
            );
            // On ajoute un event click pour masquer les vignettes
            jQuery('#reactjs-show-actions > div > button').off('click').one('click', (e: JQuery.ClickEvent) => {
                e.stopPropagation();
                e.preventDefault();
                if (Base.debug) console.groupCollapsed('AddShow');
                const done = function(): void {
                    // On met à jour les boutons Archiver et Favori
                    changeBtnAdd(_this);
                    // On met à jour le bloc du prochain épisode à voir
                    _this.updateNextEpisode(function() {
                        if (Base.debug) console.groupEnd();
                    });
                };
                _this.addToAccount()
                .then(() => done(), err => {
                    if (err && err.code !== undefined && err.code === 2003) {
                        done();
                        return;
                    }
                    Base.notification('Erreur d\'ajout de la série', err);
                    if (Base.debug) console.groupEnd();
                });
            });
        }

        /**
         * Ajoute les items du menu Options, ainsi que les boutons Archiver et Favoris
         * et on ajoute un voile sur les images des épisodes non-vu
         *
         * @param  {Show} show L'objet de type Show
         * @return {void}
         */
        function changeBtnAdd(show: Show): void {
            let $optionsLinks = $('#dropdownOptions').siblings('.dropdown-menu').children('a.header-navigation-item');
            if ($optionsLinks.length <= 2) {
                let react_id = jQuery('script[id^="/reactjs/"]').get(0).id.split('.')[1],
                    urlShow = show.resource_url.substring(location.origin.length),
                    title = show.title.replace(/"/g, '\\"').replace(/'/g, "\\'"),
                    templateOpts = `
                            <button type="button" class="btn-reset header-navigation-item" onclick="new PopupAlert({
                            showClose: true,
                            type: "popin-subtitles",
                            reactModuleId: "reactjs-subtitles",
                            params: {
                                mediaId: "${show.id}",
                                type: "show",
                                titlePopin: "${title}";
                            },
                            callback: function() {
                                loadRecommendationModule('subtitles');
                                //addScript("/reactjs/subtitles.${react_id}.js", "module-reactjs-subtitles");
                            },
                            });">Sous-titres</button>
                            <a class="header-navigation-item" href="javascript:;" onclick="reportItem(${show.id}, 'show');">Signaler un problème</a>
                            <a class="header-navigation-item" href="javascript:;" onclick="showUpdate('${title}', ${show.id}, '0')">Demander une mise à jour</a>
                            <a class="header-navigation-item" href="webcal://www.betaseries.com/cal/i${urlShow}">Planning iCal de la série</a>

                            <form class="autocomplete js-autocomplete-form header-navigation-item">
                            <button type="reset" class="btn-reset fontWeight700 js-autocomplete-show" style="color: inherit">Recommander la série</button>
                            <div class="autocomplete__toShow" hidden="">
                                <input placeholder="Nom d'un ami" type="text" class="autocomplete__input js-search-friends">
                                <div class="autocomplete__response js-display-response"></div>
                            </div>
                            </form>
                            <a class="header-navigation-item" href="javascript:;">Supprimer de mes séries</a>`;
                if ($optionsLinks.length === 1) {
                    templateOpts = `<a class="header-navigation-item" href="${urlShow}/actions">Vos actions sur la série</a>` + templateOpts;
                }
                jQuery('#dropdownOptions').siblings('.dropdown-menu.header-navigation')
                    .append(templateOpts);
            }

            // On remplace le bouton Ajouter par les boutons Archiver et Favoris
            const divs = jQuery('#reactjs-show-actions > div');
            if (divs.length === 1) {
                jQuery('#reactjs-show-actions').remove();
                let $container = jQuery('.blockInformations__actions'),
                    method = 'prepend';
                // Si le bouton VOD est présent, on place les boutons après
                if ($('#dropdownWatchOn').length > 0) {
                    $container = jQuery('#dropdownWatchOn').parent();
                    method = 'after';
                }
                $container[method](`
                        <div class="displayFlex alignItemsFlexStart"
                                id="reactjs-show-actions"
                                data-show-id="${show.id}"
                                data-user-hasarchived="${show.user.archived ? '1' : ''}"
                                data-show-inaccount="1"
                                data-user-id="${Base.userId}"
                                data-show-favorised="${show.user.favorited ? '1' : ''}">
                            <div class="blockInformations__action">
                            <button class="btn-reset btn-transparent btn-archive" type="button">
                                <span class="svgContainer">
                                <svg fill="#0d151c" height="16" width="16" xmlns="http://www.w3.org/2000/svg">
                                    <path d="m16 8-1.41-1.41-5.59 5.58v-12.17h-2v12.17l-5.58-5.59-1.42 1.42 8 8z"></path>
                                </svg>
                                </span>
                            </button>
                            <div class="label">${Base.trans('show.button.archive.label')}</div>
                            </div>
                            <div class="blockInformations__action">
                            <button class="btn-reset btn-transparent btn-favoris" type="button">
                                <span class="svgContainer">
                                <svg fill="#FFF" width="20" height="19" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M14.5 0c-1.74 0-3.41.81-4.5 2.09C8.91.81 7.24 0 5.5 0 2.42 0 0 2.42 0 5.5c0 3.78 3.4 6.86 8.55 11.54L10 18.35l1.45-1.32C16.6 12.36 20 9.28 20 5.5 20 2.42 17.58 0 14.5 0zm-4.4 15.55l-.1.1-.1-.1C5.14 11.24 2 8.39 2 5.5 2 3.5 3.5 2 5.5 2c1.54 0 3.04.99 3.57 2.36h1.87C11.46 2.99 12.96 2 14.5 2c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z"></path>
                                </svg>
                                </span>
                            </button>
                            <div class="label">${Base.trans('show.button.favorite.label')}</div>
                            </div>
                        </div>`);
                show.elt = jQuery('reactjs-show-actions');
                // On ofusque l'image des épisodes non-vu
                let vignette: JQuery<HTMLElement>;
                for (let v = 0; v < vignettes.length; v++) {
                    vignette = $(vignettes.get(v));
                    if (vignette.find('.seen').length <= 0) {
                        vignette.find('img.js-lazy-image').attr('style', 'filter: blur(5px);');
                    }
                }
                // On doit ajouter le bouton pour noter le média
                const $stars: JQuery<HTMLElement> = jQuery('.blockInformations__metadatas .js-render-stars');
                $stars.replaceWith(`
                    <button type="button" class="btn-reset fontSize0">
                        <span class="stars js-render-stars">
                            ${$stars.html()}
                        </span>
                    </button>`
                );
                _this.elt = $('.blockInformations');
                _this.addNumberVoters();
            }
            _this.addEventBtnsArchiveAndFavoris();
            _this.deleteShowClick();
        }
        if (trigEpisode) {
            this.update(true).then(show => {
                changeBtnAdd(show);
            });
        }
    }
    /**
     * Gère la suppression de la série du compte utilisateur
     * @returns {void}
     */
    deleteShowClick(): void {
        const _this = this;
        let $optionsLinks = $('#dropdownOptions').siblings('.dropdown-menu').children('a.header-navigation-item');
        // Le menu Options est au complet
        if (this.in_account && $optionsLinks.length > 2) {
            this.addEventBtnsArchiveAndFavoris();
            // Gestion de la suppression de la série du compte utilisateur
            $optionsLinks.last().removeAttr('onclick').off('click').on('click', (e: JQuery.ClickEvent) =>
            {
                e.stopPropagation();
                e.preventDefault();
                const done = function() {
                    const afterNotif = function() {
                        // On nettoie les propriétés servant à l'update de l'affichage
                        _this.user.status = 0;
                        _this.user.archived = false;
                        _this.user.favorited = false;
                        _this.user.remaining = 0;
                        _this.user.last = "S00E00";
                        _this.user.next.id = NaN;
                        _this.save();

                        // On remet le bouton Ajouter
                        jQuery('#reactjs-show-actions').html(`
                            <div class="blockInformations__action">
                                <button class="btn-reset btn-transparent btn-add" type="button">
                                <span class="svgContainer">
                                    <svg fill="#0D151C" width="14" height="14" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M14 8H8v6H6V8H0V6h6V0h2v6h6z" fill-rule="nonzero"></path>
                                    </svg>
                                </span>
                                </button>
                                <div class="label">${Base.trans('show.button.add.label')}</div>
                            </div>`
                        );
                        // On supprime les items du menu Options
                        $optionsLinks.first().siblings().each((i, e) => { $(e).remove(); });
                        // Nettoyage de l'affichage des épisodes
                        const checks: JQuery<HTMLElement> = jQuery('#episodes .slide_flex');
                        let promise: Promise<any>,
                            update: boolean = false; // Flag pour l'update de l'affichage
                        if (_this.currentSeason.episodes && _this.currentSeason.episodes.length > 0) {
                            promise = new Promise(resolve => resolve(_this.currentSeason));
                        } else {
                            promise = _this.currentSeason.fetchEpisodes();
                        }
                        promise.then((season: Season) => {
                            for (let e = 0; e < season.episodes.length; e++) {
                                if (season.episodes[e].elt === null) {
                                    season.episodes[e].elt = $(checks.get(e));
                                }
                                if (e === season.episodes.length - 1) update = true;
                                if (Base.debug) console.log('clean episode %d', e, update);
                                season.episodes[e].updateRender('notSeen', update);
                            }
                        });
                        // On doit supprimer le bouton pour noter le média
                        const $stars: JQuery<HTMLElement> = jQuery('.blockInformations__metadatas .js-render-stars');
                        $stars.parent().replaceWith(`
                        <span class="stars js-render-stars">
                        ${$stars.html()}
                        </span>`
                        );
                        _this.elt = $('.blockInformations');
                        _this.addNumberVoters();
                        _this.addShowClick();
                    };
                    // eslint-disable-next-line no-undef
                    new PopupAlert({
                        title: Base.trans("popup.delete_show_success.title"),
                        text: Base.trans("popup.delete_show_success.text", { "%title%": _this.title }),
                        yes: Base.trans("popup.delete_show_success.yes"),
                        callback_yes: afterNotif
                    });
                };
                // Supprimer la série du compte utilisateur
                // eslint-disable-next-line no-undef
                new PopupAlert({
                    title: Base.trans("popup.delete_show.title", { "%title%": _this.title }),
                    text: Base.trans("popup.delete_show.text", { "%title%": _this.title }),
                    callback_yes: function() {
                        if (Base.debug) console.groupCollapsed('delete show');
                        _this.removeFromAccount()
                        .then(() => done(), err => {
                            if (err && err.code !== undefined && err.code === 2004) {
                                done();
                                if (Base.debug) console.groupEnd();
                                return;
                            }
                            Media.notification('Erreur de suppression de la série', err);
                            if (Base.debug) console.groupEnd();
                        });
                    },
                    callback_no: function() {}
                });
            });
        }
    }
    /**
     * Ajoute un eventHandler sur les boutons Archiver et Favoris
     * @returns {void}
     */
    addEventBtnsArchiveAndFavoris(): void {
        const _this = this;
        let $btnArchive = jQuery('#reactjs-show-actions button.btn-archive'),
            $btnFavoris = jQuery('#reactjs-show-actions button.btn-favoris');
        if ($btnArchive.length === 0 || $btnFavoris.length === 0) {
            $('#reactjs-show-actions button:first').addClass('btn-archive');
            $btnArchive = jQuery('#reactjs-show-actions button.btn-archive');
            $('#reactjs-show-actions button:last').addClass('btn-favoris');
            $btnFavoris = jQuery('#reactjs-show-actions button.btn-favoris');
        }
        // Event bouton Archiver
        $btnArchive.off('click').click((e: JQuery.ClickEvent): void => {
            e.stopPropagation();
            e.preventDefault();
            if (Base.debug) console.groupCollapsed('show-archive');
            // Met à jour le bouton d'archivage de la série
            function updateBtnArchive(promise: Promise<Show>, transform: string, label: string, notif: string) {
                promise.then(() => {
                    const $parent = $(e.currentTarget).parent();
                    $('span', e.currentTarget).css('transform', transform);
                    $('.label', $parent).text(Base.trans(label));
                    if (Base.debug) console.groupEnd();
                }, err => {
                    Base.notification(notif, err);
                    if (Base.debug) console.groupEnd();
                });
            }
            if (! _this.isArchived()) {
                updateBtnArchive(
                    _this.archive(), 'rotate(180deg)',
                    'show.button.unarchive.label', 'Erreur d\'archivage de la série'
                );
            } else {
                updateBtnArchive(
                    _this.unarchive(), 'rotate(0deg)',
                    'show.button.archive.label', 'Erreur désarchivage de la série'
                );
            }
        });
        // Event bouton Favoris
        $btnFavoris.off('click').click((e: JQuery.ClickEvent): void => {
            e.stopPropagation();
            e.preventDefault();
            if (Base.debug) console.groupCollapsed('show-favoris');
            if (! _this.isFavorite()) {
                _this.favorite()
                .then(() => {
                    jQuery(e.currentTarget).children('span').replaceWith(`
                            <span class="svgContainer">
                            <svg width="21" height="19" xmlns="http://www.w3.org/2000/svg">
                                <path d="M15.156.91a5.887 5.887 0 0 0-4.406 2.026A5.887 5.887 0 0 0 6.344.909C3.328.91.958 3.256.958 6.242c0 3.666 3.33 6.653 8.372 11.19l1.42 1.271 1.42-1.28c5.042-4.528 8.372-7.515 8.372-11.18 0-2.987-2.37-5.334-5.386-5.334z"></path>
                            </svg>
                            </span>`);
                    if (Base.debug) console.groupEnd();
                }, err => {
                    Base.notification('Erreur de favoris de la série', err);
                    if (Base.debug) console.groupEnd();
                });
            } else {
                _this.unfavorite()
                .then(() => {
                    $(e.currentTarget).children('span').replaceWith(`
                            <span class="svgContainer">
                            <svg fill="#FFF" width="20" height="19" xmlns="http://www.w3.org/2000/svg">
                                <path d="M14.5 0c-1.74 0-3.41.81-4.5 2.09C8.91.81 7.24 0 5.5 0 2.42 0 0 2.42 0 5.5c0 3.78 3.4 6.86 8.55 11.54L10 18.35l1.45-1.32C16.6 12.36 20 9.28 20 5.5 20 2.42 17.58 0 14.5 0zm-4.4 15.55l-.1.1-.1-.1C5.14 11.24 2 8.39 2 5.5 2 3.5 3.5 2 5.5 2c1.54 0 3.04.99 3.57 2.36h1.87C11.46 2.99 12.96 2 14.5 2c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z"></path>
                            </svg>
                            </span>`);
                    if (Base.debug) console.groupEnd();
                }, err => {
                    Base.notification('Erreur de favoris de la série', err);
                    if (Base.debug) console.groupEnd();
                });
            }
        });
    }
    /**
     * Ajoute la classification dans les détails de la ressource
     */
    addRating() {
        if (Base.debug) console.log('addRating');

        if (this.rating) {
            let rating: Rating = Base.ratings[this.rating] !== undefined ? Base.ratings[this.rating] : null;
            if (rating !== null) {
                // On ajoute la classification
                jQuery('.blockInformations__details')
                .append(
                    `<li id="rating"><strong>Classification</strong>
                        <img src="${rating.img}" title="${rating.title}"/>
                    </li>`
                );
            }
        }
    }
    
    /**
     * Définit la saison courante
     * @param   {number} seasonNumber Le numéro de la saison courante (commence à 1)
     * @returns {Show}  L'instance de la série
     * @throws  {Error} if seasonNumber is out of range of seasons
     */
    setCurrentSeason(seasonNumber: number): Show {
        if (seasonNumber <= 0 || seasonNumber > this.seasons.length) {
            throw new Error("seasonNumber is out of range of seasons");
        }
        this.currentSeason = this.seasons[seasonNumber - 1];
        return this;
    }
}