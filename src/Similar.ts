import {Base, Obj, MediaType, MediaTypes, HTTP_VERBS} from "./Base";
import {Media} from "./Media";
import { Season } from "./Episode";
import {implShow, Showrunner, Platforms, Platform, Images, Picked, Picture} from "./Show";
import {implMovie, OtherTitle} from "./Movie";
import {Platform_link} from "./Episode";

declare var renderjson;

interface implDialog {
    show: Function,
    close: Function,
    setContent: Function,
    setCounter: Function,
    init: Function
}
export class Similar extends Media implements implShow, implMovie {
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
     */
    fill(data: Obj): this {
        if (this.mediaType.singular === MediaType.show) {
            this.aliases = data.aliases;
            this.creation = data.creation;
            this.country = data.country;
            this.images = null;
            if (data.images !== undefined && data.images !== null) {
                this.images = new Images(data.images);
            }
            this.nbEpisodes = parseInt(data.episodes, 10);
            this.network = data.network;
            this.next_trailer = data.next_trailer;
            this.next_trailer_host = data.next_trailer_host;
            this.rating = data.rating;
            this.platforms = null;
            if (data.platforms !== undefined && data.platforms !== null) {
                this.platforms = new Platforms(data.platforms);
            }
            this.seasons = new Array();
            this.nbSeasons = parseInt(data.seasons, 10);
            this.showrunner = null;
            if (data.showrunner !== undefined && data.showrunner !== null) {
                this.showrunner = new Showrunner(data.showrunner);
            }
            this.social_links = data.social_links;
            this.status = data.status;
            this.thetvdb_id = parseInt(data.thetvdb_id, 10);
            this.pictures = new Array();
        } else if (this.mediaType.singular === MediaType.movie) {
            if (data.user.in_account !== undefined) {
                data.in_account = data.user.in_account;
                delete data.user.in_account;
            }
            if (data.synopsis !== undefined) {
                data.description = data.synopsis;
                delete data.synopsis;
            }
            this.backdrop = data.backdrop;
            this.director = data.director;
            this.original_release_date = new Date(data.original_release_date);
            this.other_title = data.other_title;
            this.platform_links = data.platform_links;
            this.poster = data.poster;
            this.production_year = parseInt(data.production_year);
            this.release_date = new Date(data.release_date);
            this.sale_date = new Date(data.sale_date);
            this.tagline = data.tagline;
            this.tmdb_id = parseInt(data.tmdb_id);
            this.trailer = data.trailer;
            this.url = data.url;
        }
        super.fill(data);
        return this;
    }

    /**
     * Récupère les données de la série sur l'API
     * @param  {boolean} [force=true]   Indique si on utilise les données en cache
     * @return {Promise<*>}             Les données de la série
     */
    fetch(force: boolean = true): Promise<Obj> {
        let action: string = 'display';
        if (this.mediaType.singular === MediaType.movie) {
            action = 'movie';
        }
        return Base.callApi('GET', this.mediaType.plural, action, {id: this.id}, force);
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
                `<img src="${Base.serverBaseUrl}/img/viewed.png" class="bandViewed"/>`
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
              _this: Similar = this;
        $title.html($title.html() +
            `<i class="fa fa-wrench popover-wrench"
                aria-hidden="true"
                style="margin-left:5px;cursor:pointer;"
                data-id="${_this.id}"
                data-type="${_this.mediaType.singular}">
            </i>`
        );

        $title.find('.popover-wrench').click((e: JQuery.ClickEvent) => {
            e.stopPropagation();
            e.preventDefault();

            //if (debug) console.log('Popover Wrench', eltId, self);
            this.fetch().then(function(data) {
                // eslint-disable-next-line no-undef
                dialog.setContent(renderjson.set_show_to_level(2)(data[_this.mediaType.singular]));
                dialog.setCounter(Base.counter.toString());
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
    getContentPopup() {
        const _this = this;
        //if (debug) console.log('similars tempContentPopup', objRes);
        let description = this.description;
        if (description.length > 200) {
            description = description.substring(0, 200) + '…';
        }
        let template = '';
        function _renderCreation() {
            let html = '';
            if (_this.creation || _this.country || _this.production_year) {
                html += '<p>';
                if (_this.creation) {
                    html += `<u>Création:</u> <strong>${_this.creation}</strong>`;
                }
                if (_this.production_year) {
                    html += `<u>Production:</u> <strong>${_this.production_year}</strong>`;
                }
                if (_this.country) {
                    html += `, <u>Pays:</u> <strong>${_this.country}</strong>`;
                }
                html += '</p>';
            }
            return html;
        }
        function _renderGenres() {
            if (_this.genres && _this.genres.length > 0) {
                return '<p><u>Genres:</u> ' + _this.genres.join(', ') + '</p>';
            }
            return '';
        }
        template = '<div>';
        if (this.mediaType.singular === MediaType.show) {
            const status = this.status.toLowerCase() == 'ended' ? 'Terminée' : 'En cours';
            const seen = (this.user.status > 0) ? 'Vu à <strong>' + this.user.status + '%</strong>' : 'Pas vu';
            template += `<p><strong>${this.seasons.length}</strong> saison${(this.seasons.length > 1 ? 's':'')}, <strong>${this.nbEpisodes}</strong> épisodes, `;
            if (this.objNote.total > 0) {
                template += `<strong>${this.objNote.total}</strong> votes`;
                if (this.objNote.user > 0) {
                    template += `, votre note: ${this.objNote.user}`;
                }
                template += '</p>';
            } else {
                template += 'Aucun vote</p>';
            }
            if (! this.in_account) {
                template += '<p><a href="javascript:;" class="addShow">Ajouter</a></p>';
            }
            template += _renderGenres();
            template += _renderCreation();
            let archived = '';
            if (this.user.status > 0 && this.user.archived === true) {
                archived = ', Archivée: <i class="fa fa-check-circle-o" aria-hidden="true"></i>';
            } else if (this.user.status > 0) {
                archived = ', Archivée: <i class="fa fa-circle-o" aria-hidden="true"></i>';
            }
            if (this.showrunner && this.showrunner.name.length > 0) {
                template += `<p><u>Show Runner:</u> <strong>${this.showrunner.name}</strong></p>`;
            }
            template += `<p><u>Statut:</u> <strong>${status}</strong>, ${seen}${archived}</p>`;
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
        // if (Base.debug) console.log('getTitlePopup', this);
        let title: string = this.title;
        if (this.objNote.total > 0) {
            title += ' <span style="font-size: 0.8em;color:#000;">' +
                    this.objNote.mean.toFixed(2) + ' / 5</span>';
        }
        return title;
    }
    /**
     * Met à jour l'attribut title de la note du similar
     * @param  {Boolean} change Indique si il faut modifier l'attribut
     * @return {string}         La valeur modifiée de l'attribut title
     */
    updateTitleNote(change: boolean = true): string {
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
                _this = this;
        if ($img.length <= 0) {
            if (this.mediaType.singular === MediaType.show && this.thetvdb_id && this.thetvdb_id > 0) {
                // On tente de remplacer le block div 404 par une image
                this.elt.find('div.block404').replaceWith(`
                    <img class="u-opacityBackground fade-in"
                            width="125"
                            height="188"
                            alt="Poster de ${this.title}"
                            src="https://artworks.thetvdb.com/banners/posters/${this.thetvdb_id}-1.jpg"/>`
                );
            }
            else if (this.mediaType.singular === MediaType.movie && this.tmdb_id && this.tmdb_id > 0) {
                if (Base.themoviedb_api_user_key.length <= 0) return;
                const uriApiTmdb = `https://api.themoviedb.org/3/movie/${this.tmdb_id}?api_key=${Base.themoviedb_api_user_key}&language=fr-FR`;
                fetch(uriApiTmdb).then(response => {
                    if (!response.ok) return null;
                    return response.json();
                }).then(data => {
                    if (data !== null && data.poster_path !== undefined && data.poster_path !== null) {
                        _this.elt.find('div.block404').replaceWith(`
                            <img class="u-opacityBackground fade-in"
                                    width="125"
                                    height="188"
                                    alt="Poster de ${_this.title}"
                                    src="https://image.tmdb.org/t/p/original${data.poster_path}"/>`
                        );
                    }
                });
            }
        }
        return this;
    }
    /**
     * Add Show to account member
     * @return {Promise<Similar>} Promise of show
     */
    addToAccount(state: number = 0): Promise<Similar> {
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
        const _this = this;
        let params: Obj = {id: this.id};
        let verb = HTTP_VERBS.POST;
        if (state === -1 && this.mediaType.singular === MediaType.movie) {
            verb = HTTP_VERBS.DELETE;
        }
        else if (this.mediaType.singular === MediaType.movie) {
            params.state = state;
        }

        return Base.callApi(verb, this.mediaType.plural, this.mediaType.singular, params)
        .then((data: Obj) => {
            _this.fill(data[_this.mediaType.singular]);
            // En attente de la résolution du bug https://www.betaseries.com/bugs/api/462
            if (verb === HTTP_VERBS.DELETE) {
                _this.in_account = false;
                _this.user.status = -1;
                _this.save();
            }
            return _this;
        })
        .catch(err => {
            console.warn('Erreur changeState similar', err);
            Base.notification('Change State Similar', 'Erreur lors du changement de statut: ' + err.toString());
            return _this;
        });
    }
    /**
     * Ajoute une note au média
     * @param   {number} note Note du membre connecté pour le média
     * @returns {Promise<boolean>}
     */
    // eslint-disable-next-line no-unused-vars
    addVote(note: number): Promise<boolean> {
        throw new Error('On ne vote pas pour un similar');
    }
}