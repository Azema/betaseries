import { Obj, HTTP_VERBS, UsBetaSeries } from "./Base";
import { Media, MediaType, MediaTypes } from "./Media";
import { Season } from "./Season";
import { implShow, Showrunner, Platforms, Images, Picture, Show } from "./Show";
import { implMovie, Movie, OtherTitle } from "./Movie";
import { Platform_link } from "./Episode";
import { Person } from "./Character";

declare const renderjson;
/**
 * implDialog
 * @interface
 */
export interface implDialog {
    show: () => void,
    close: () => void,
    setContent: (text: string) => void,
    setCounter: (text: string) => void,
    setTitle: (title: string) => void,
    init: () => void
}
/**
 * Similar
 * @class
 * @extends Media
 * @implements {implShow}
 * @implements {implMovie}
 */
export class Similar extends Media implements implShow, implMovie {
    static logger = new UsBetaSeries.setDebug('Similar');
    static debug = Similar.logger.debug.bind(Similar.logger);

    static relatedProps = {};

    /* Interface implMovie */
    backdrop: string;
    director: string;
    original_release_date: Date;
    other_title: OtherTitle;
    platform_links: Platform_link[];
    poster: string;
    production_year: number;
    release_date: Date;
    sale_date: Date;
    tagline: string;
    tmdb_id: number;
    trailer: string;
    url: string;
    /* Interface implShow */
    aliases: object;
    creation: string;
    country: string;
    images: Images;
    nbEpisodes: number;
    network: string;
    next_trailer: string;
    next_trailer_host: string;
    rating: string;
    pictures: Picture[];
    platforms: Platforms;
    seasons: Season[];
    nbSeasons: number;
    showrunner: Showrunner;
    social_links: string[];
    status: string;
    thetvdb_id: number;
    persons: Array<Person>;

    constructor(data: Obj, type: MediaTypes) {
        if (type.singular === MediaType.movie) {
            data.in_account = data.user.in_account;
            delete data.user.in_account;
            data.description = data.synopsis;
            delete data.synopsis;
        }
        super(data);
        this.mediaType = type;
        return this.fill(data);
    }

    /**
     * Remplit l'objet avec les données fournit en paramètre
     * @param  {Obj} data Les données provenant de l'API
     * @returns {Similar}
     * @override
     */
    fill(data: Obj): this {
        if (this.mediaType.singular === MediaType.show) {
            Similar.relatedProps = Show.relatedProps;
            this.seasons = [];
            this.persons = [];
        } else if (this.mediaType.singular === MediaType.movie) {
            Similar.relatedProps = Movie.relatedProps;
            this.platform_links = [];
        }
        super.fill(data);
        return this;
    }

    /**
     * Récupère les données de la série sur l'API
     * @param  {boolean} [force=true]   Indique si on utilise les données en cache
     * @return {Promise<*>}             Les données de la série
     */
    fetch(force = true): Promise<Obj> {
        let action = 'display';
        if (this.mediaType.singular === MediaType.movie) {
            action = 'movie';
        }
        return UsBetaSeries.callApi('GET', this.mediaType.plural, action, {id: this.id}, force);
    }
    /**
     * Ajoute le bandeau Viewed sur le poster du similar
     * @return {Similar}
     */
    addViewed(): Similar {
        const $slideImg: JQuery<HTMLElement> = this.elt.find('a.slide__image');
        // Si la série a été vue ou commencée
        if (this.user.status &&
            (
                (this.mediaType.singular === MediaType.movie && this.user.status === 1) ||
                (this.mediaType.singular === MediaType.show && this.user.status > 0))
            )
        {
            // On ajoute le bandeau "Viewed"
            $slideImg.prepend(
                `<img src="${UsBetaSeries.serverBaseUrl}/img/viewed.png" class="bandViewed"/>`
            );
        }
        // On ajoute des infos pour la recherche du similar pour les popups
        $slideImg
            .attr('data-id', this.id)
            .attr('data-type', this.mediaType.singular);

        return this;
    }
    /**
     * Ajoute l'icône wrench à côté du titre du similar
     * pour permettre de visualiser les données du similar
     * @param   {implDialog} dialog L'objet Dialog pour afficher les données
     * @returns {Similar}
     */
    wrench(dialog: implDialog): Similar {
        const $title: JQuery<HTMLElement> = this.elt.find('.slide__title'),
              self: Similar = this;
        $title.html($title.html() +
            `<i class="fa-solid fa-wrench popover-wrench"
                aria-hidden="true"
                style="margin-left:5px;cursor:pointer;"
                data-id="${self.id}"
                data-type="${self.mediaType.singular}">
            </i>`
        );

        $title.find('.popover-wrench').click((e: JQuery.ClickEvent) => {
            e.stopPropagation();
            e.preventDefault();

            //if (debug) Similar.debug('Popover Wrench', eltId, self);
            this.fetch().then(function(data) {
                // eslint-disable-next-line no-undef
                dialog.setContent(renderjson.set_show_to_level(2)(data[self.mediaType.singular]));
                dialog.setCounter(UsBetaSeries.counter.toString());
                dialog.setTitle('Données du similar');
                dialog.show();
            });
        });
        return this;
    }
    /**
     * Retourne le contenu HTML pour la popup
     * de présentation du similar
     * @return {string}
     */
    async getContentPopup() {
        const self = this;
        //if (debug) Similar.debug('similars tempContentPopup', objRes);
        let description = this.description;
        if (description.length > 200) {
            description = description.substring(0, 200) + '…';
        }
        let template = '';
        function _renderCreation() {
            let html = '';
            if (self.creation || self.country || self.production_year) {
                html += '<p>';
                if (self.production_year) {
                    html += `<u>Production:</u> <strong>${self.production_year}</strong>`;
                }
                if (self.country) {
                    html += `<u>Pays:</u> <strong>${self.country}</strong>`;
                }
                if (self.creation) {
                    html += `<span style="margin-left:5px;">${self.creation}</span>`;
                }
                html += '</p>';
            }
            return html;
        }
        function _renderGenres() {
            if (self.genres && self.genres.length > 0) {
                return '<p><u>Genres:</u> ' + self.genres.join(', ') + '</p>';
            }
            return '';
        }
        template = '<div>';
        if (this.mediaType.singular === MediaType.show) {
            const status = `<i class="fa-solid fa-${this.status.toLowerCase() == 'ended' ? 'octagon-exclamation' : 'spinner'}" title="Statut ${this.status.toLowerCase() == 'ended' ? 'terminé' : 'en cours'}" aria-hidden="true"></i>`;
            const seen = (this.user.status > 0) ? 'Vu à <strong>' + this.user.status + '%</strong>' : 'Pas vu';
            template += `<p>
                <strong>${this.nbSeasons}</strong> saison${(this.nbSeasons > 1 ? 's':'')},
                <strong>${this.nbEpisodes}</strong> <i class="fa-solid fa-films" title="épisodes" aria-hidden="true"></i>, `;
            if (this.objNote.total > 0) {
                template += `<strong>${this.objNote.total}</strong> votes`;
                if (this.objNote.user > 0) {
                    template += `, votre note: ${this.objNote.user}`;
                }
            } else {
                template += 'Aucun vote';
            }
            template += `<span style="margin-left:5px;"><strong>${self.nbComments}</strong> <i class="fa-solid fa-comments" title="commentaires" aria-hidden="true"></i></span>`;
            if (! this.in_account) {
                template += `<span style="margin-left:5px;">
                    <a href="javascript:;" class="addShow"><i class="fa-solid fa-plus" title="Ajouter" aria-hidden="true"></i></a> -`;
                const storeToSee: Array<number> = await UsBetaSeries.gm_funcs.getValue('toSee', []);
                const toSee = storeToSee.includes(this.id);
                if (toSee) {
                    template += `<a href="javascript:;" class="toSeeShow" data-show-id="${self.id}">
                        <i class="fa-solid fa-clock-rotate-left" title="Ne plus voir" aria-hidden="true"></i>
                    </a></span>`;
                } else {
                    template += `<a href="javascript:;" class="toSeeShow" data-show-id="${self.id}">
                        <i class="fa-solid fa-user-clock" title="A voir" aria-hidden="true"></i>
                    </a></span>`;
                }
            }
            template += '</p>';
            template += _renderGenres();
            template += _renderCreation();
            let archived = '';
            if (this.user.status > 0 && this.user.archived === true) {
                archived = ', Archivée: <i class="fa-solid fa-circle-check" aria-hidden="true"></i>';
            } else if (this.user.status > 0) {
                archived = ', Archivée: <i class="fa-solid fa-circle" aria-hidden="true"></i>';
            }
            if (this.showrunner && this.showrunner.name.length > 0) {
                template += `<p><u>Show Runner:</u> <strong>${this.showrunner.name}</strong></p>`;
            }
            template += `<p><u>Statut:</u> ${status}, ${seen}${archived}</p>`;
        }
        // movie
        else {
            template += '<p>';
            if (this.objNote.total > 0) {
                template += `<strong>${this.objNote.total}</strong> votes`;
                if (this.objNote.user > 0) {
                    template += `, votre note: ${this.objNote.user}`;
                }
            } else {
                template += 'Aucun vote';
            }
            template += `<span style="margin-left:5px;"><strong>${self.nbComments}</strong> <i class="fa-solid fa-comments" title="commentaires" aria-hidden="true"></i></span>`;
            template += '</p>';
            // Ajouter une case à cocher pour l'état "Vu"
            template += `<p><label for="seen">Vu</label>
                <input type="radio" class="movie movieSeen" name="movieState" value="1" data-movie="${this.id}" ${this.user.status === 1 ? 'checked' : ''} style="margin-right:5px;vertical-align:middle;"></input>`;
            // Ajouter une case à cocher pour l'état "A voir"
            template += `<label for="mustSee">A voir</label>
                <input type="radio" class="movie movieMustSee" name="movieState" value="0" data-movie="${this.id}" ${this.user.status === 0 ? 'checked' : ''} style="margin-right:5px;vertical-align:middle;"></input>`;
            // Ajouter une case à cocher pour l'état "Ne pas voir"
            template += `<label for="notSee">Ne pas voir</label>
                <input type="radio" class="movie movieNotSee" name="movieState" value="2" data-movie="${this.id}"  ${this.user.status === 2 ? 'checked' : ''} style="vertical-align:middle;"></input>`;
            template += `<button class="btn btn-danger reset" style="margin-left:10px;padding:2px 5px;${this.user.status < 0 ? 'display:none;':''}">Reset</button></p>`;
            template += _renderGenres();
            template += _renderCreation();
            if (this.director) {
                template += `<p><u>Réalisateur:</u> <strong>${this.director}</strong></p>`;
            }
        }
        return template + `<p>${description}</p></div>`;
    }
    /**
     * Retourne le contenu HTML du titre de la popup
     * @return {string}
     */
    getTitlePopup(): string {
        // if (BetaSeries.debug) Similar.debug('getTitlePopup', this);
        let title: string = this.title;
        if (this.objNote.total > 0) {
            title += ' <span style="font-size: 0.8em;color:var(--link_color);">' +
                    this.objNote.mean.toFixed(2) + ' / 5</span>';
        }
        if (this.mediaType.singular === MediaType.show)
            title += ` <span style="float:right;">
                <a href="http://www.thetvdb.com/?tab=series&id=${this.thetvdb_id}" target="_blank" title="Lien vers la page de TheTVDB">
                    <img src="https://thetvdb.com/images/logo.svg" width="40px" />
                </a>
                <a href="javascript:;" onclick="showUpdate('${this.title}', ${this.id}, '0')" style="margin-left:5px; color:var(--default_color);" title="Mettre à jour les données venant de TheTVDB">
                    <i class="fa-solid fa-arrows-rotate" aria-hidden="true"></i>
                </a>
            </span>`;
        return title;
    }
    /**
     * Met à jour l'attribut title de la note du similar
     * @param  {Boolean} change Indique si il faut modifier l'attribut
     * @return {string}         La valeur modifiée de l'attribut title
     */
    updateTitleNote(change = true): string {
        const $elt = this.elt.find('.stars-outer');
        if (this.objNote.mean <= 0 || this.objNote.total <= 0) {
            if (change) $elt.attr('title', 'Aucun vote');
            return '';
        }

        const title = this.objNote.toString();
        if (change) {
            $elt.attr('title', title);
        }
        return title;
    }
    /**
     * Ajoute la note, sous forme d'étoiles, du similar sous son titre
     * @return {Similar}
     */
    renderStars(): Similar {
        // On ajoute le code HTML pour le rendu de la note
        this.elt.find('.slide__title').after(
            '<div class="stars-outer"><div class="stars-inner"></div></div>'
        );
        this.updateTitleNote();
        this.elt.find('.stars-inner').width(this.objNote.getPercentage() + '%');
        return this;
    }
    /**
     * Vérifie la présence de l'image du similar
     * et tente d'en trouver une si celle-ci n'est pas présente
     * @return {Similar}
     */
    checkImg(): Similar {
        const $img = this.elt.find('img.js-lazy-image'),
              self = this;

        if ($img.length > 0) {
            return this;
        }
        if (this.mediaType.singular === MediaType.show) {
            if (this.images.poster !== null) {
                // On tente de remplacer le block div 404 par une image
                this.elt.find('div.block404').replaceWith(`
                    <img class="u-opacityBackground fade-in"
                            width="125"
                            height="188"
                            alt="Affiche de la série ${this.title}"
                            src="${this.images.poster}"/>`
                );
            }
            else {
                const proxy = UsBetaSeries.serverBaseUrl + '/posters/';
                const initFetch: RequestInit = { // objet qui contient les paramètres de la requête
                    method: 'GET',
                    headers: {
                        'origin': 'https://www.betaseries.com',
                        'x-requested-with': 'userscript-bs'
                    },
                    mode: 'cors',
                    cache: 'no-cache'
                };
                this._getTvdbUrl(this.thetvdb_id).then(url => {
                    if (!url) return;
                    const urlTvdb = new URL(url);
                    fetch(`${proxy}${urlTvdb.pathname}`, initFetch)
                    .then((resp: Response) => {
                        if (resp.ok) {
                            return resp.text();
                        }
                        return null;
                    }).then(html => {
                        if (html == null) return;
                        const parser = new DOMParser();
                        const doc: Document = parser.parseFromString(html, 'text/html');
                        const link: HTMLLinkElement = doc.querySelector('.container .row a[rel="artwork_posters"]');
                        if (link) {
                            this.elt.find('div.block404').replaceWith(`
                                <img class="u-opacityBackground fade-in"
                                        width="125"
                                        height="188"
                                        alt="Affiche de la série ${self.title}"
                                        src="${link.href}"/>`
                            );
                        }
                    });
                });
            }
        }
        else if (this.mediaType.singular === MediaType.movie && this.tmdb_id && this.tmdb_id > 0) {
            if (UsBetaSeries.themoviedb_api_user_key.length <= 0) return;
            const uriApiTmdb = `https://api.themoviedb.org/3/movie/${this.tmdb_id}?api_key=${UsBetaSeries.themoviedb_api_user_key}&language=fr-FR`;
            fetch(uriApiTmdb).then(response => {
                if (!response.ok) return null;
                return response.json();
            }).then(data => {
                if (data !== null && data.poster_path !== undefined && data.poster_path !== null) {
                    self.elt.find('div.block404').replaceWith(`
                        <img class="u-opacityBackground fade-in"
                                width="125"
                                height="188"
                                alt="Poster de ${self.title}"
                                src="https://image.tmdb.org/t/p/original${data.poster_path}"/>`
                    );
                }
            });
        }
        return this;
    }
    /**
     * Add Show to account member
     * @return {Promise<Similar>} Promise of show
     */
    addToAccount(state = 0): Promise<Similar> {
        if (this.in_account) return Promise.resolve(this);
        return this.changeState(state);
    }
    /**
     * Modifie le statut du similar
     * @param   {number} state Le nouveau statut du similar
     * @returns {Promise<Similar>}
     */
    changeState(state: number): Promise<Similar> {
        if (state < -1 || state > 2) {
            throw new Error("Parameter state is incorrect: " + state.toString());
        }
        const self = this;
        const params: Obj = {id: this.id};
        let verb = HTTP_VERBS.POST;
        if (state === -1 && this.mediaType.singular === MediaType.movie) {
            verb = HTTP_VERBS.DELETE;
        }
        else if (this.mediaType.singular === MediaType.movie) {
            params.state = state;
        }

        return UsBetaSeries.callApi(verb, this.mediaType.plural, this.mediaType.singular, params)
        .then((data: Obj) => {
            self.fill(data[self.mediaType.singular]);
            // En attente de la résolution du bug https://www.betaseries.com/bugs/api/462
            if (verb === HTTP_VERBS.DELETE) {
                self.in_account = false;
                self.user.status = -1;
                self.save();
            }
            return self;
        })
        .catch(err => {
            console.warn('Erreur changeState similar', err);
            UsBetaSeries.notification('Change State Similar', 'Erreur lors du changement de statut: ' + err.toString());
            return self;
        });
    }
    /**
     * Ajoute une note au média
     * @param   {number} note Note du membre connecté pour le média
     * @returns {Promise<boolean>}
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    addVote(note: number): Promise<boolean> {
        throw new Error('On ne vote pas pour un similar');
    }
}