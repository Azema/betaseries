import {Base, Obj, EventTypes, Rating, HTTP_VERBS, Callback, objToArr, MediaType, RelatedProp} from "./Base";
import { implAddNote, Note } from "./Note";
import {Media} from "./Media";
import {Season} from "./Season";
import { Character, Person } from "./Character";
import {Next, User} from "./User";

declare const PopupAlert;

/**
 * Classe représentant les différentes images d'une série
 * @class
 */
export class Images {
    /**
     * Les formats des images
     * @static
     * @type {object}
     */
    static formats = {
        poster: 'poster',
        wide: 'wide'
    }

    /**
     * Contructeur
     * @param {Obj} data - Les données de l'objet
     */
    constructor(data: Obj) {
        this.show = data.show;
        this.banner = data.banner;
        this.box = data.box;
        this.poster = data.poster;
        this._local = {
            show: this.show,
            banner: this.banner,
            box: this.box,
            poster: this.poster
        };
    }
    /** @type {string} */
    show: string;
    /** @type {string} */
    banner: string;
    /** @type {string} */
    box: string;
    /** @type {string} */
    poster: string;
    /** @type {object} */
    _local: {show: string, banner: string, box: string, poster: string};
}
/** @enum {number} */
export enum Picked {
    none,
    banner,
    show
}
/**
 * Classe représentant une image
 * @class
 */
export class Picture {
    /**
     * Contructeur
     * @param {Obj} data - Les données de l'objet
     */
    constructor(data: Obj) {
        this.id = parseInt(data.id, 10);
        this.show_id = parseInt(data.show_id, 10);
        this.login_id = parseInt(data.login_id, 10);
        this.url = data.url;
        this.width = parseInt(data.width, 10);
        this.height = parseInt(data.height, 10);
        this.date = new Date(data.date);
        this.picked = data.picked;
    }
    /** @type {number} */
    id: number;
    /** @type {number} */
    show_id: number;
    /** @type {number} */
    login_id: number;
    /** @type {string} */
    url: string;
    /** @type {number} */
    width: number;
    /** @type {number} */
    height: number;
    /** @type {Date} */
    date: Date;
    /** @type {Picked} */
    picked: Picked;
}
/**
 * Classe représentant une plateforme de diffusion
 * @class
 */
export class Platform {
    /**
     * Contructeur
     * @param {Obj} data - Les données de l'objet
     */
    constructor(data: Obj) {
        this.id = parseInt(data.id, 10);
        this.name = data.name;
        this.tag = data.tag;
        this.link_url = data.link_url;
        this.available = data.available;
        this.logo = data.logo;
        this.partner = !data.partner || false;
    }
    /**
     * Identifiant de la plateforme
     * @type {number}
     */
    id: number;
    /**
     * Nom de la plateforme
     * @type {string}
     */
    name: string;
    /** @type {string} */
    tag: string;
    /**
     * Lien URL d'accès au média sur la plateforme
     * @type {string}
     */
    link_url: string;
    /** @type {object} */
    available: object;
    /**
     * URL du logo de la plateforme
     * @type {string}
     */
    logo: string;
    /**
     * Flag de partenariat avec la plateforme
     * @type {boolean}
     */
    partner: boolean;
}
/**
 * Classe représentant les différentes plateformes de diffusion
 * sous deux types de plateformes
 * @class
 */
export class PlatformList {
    /** @type {Array<Platform>} */
    svod: Array<Platform>;
    /** @type {Array<Platform>} */
    vod: Array<Platform>;
    /** @type {string} */
    country: string;

    /**
     * Les types de plateformes
     * @type {Obj}
     * @static
     */
    static types: Obj = {
        svod: 'svod',
        vod: 'vod'
    };

    /**
     * fetchPlatforms - Récupère la liste des plateformes sur l'API
     * @static
     * @param  {string}                [country = 'us'] - Le pays concerné par les plateformes
     * @return {Promise<PlatformList>}                    L'objet contenant les différentes plateformes
     */
    static fetchPlatforms(country = 'us'): Promise<PlatformList> {
        return new Promise((resolve, reject) => {
            Base.callApi(HTTP_VERBS.GET, 'platforms', 'list', {country})
            .then((data: Obj) => {
                resolve(new PlatformList(data.platforms, country));
            })
            .catch(err => reject(err));
        });
    }
    /**
     * Contructeur
     * @param {Obj}     data -      Les données de l'objet
     * @param {string}  country -   Le pays correspondant aux plateformes
     */
    constructor(data: Obj, country = 'fr') {
        if (data.svod) {
            this.svod = [];
            for (let s = 0; s < data.svod.length; s++) {
                this.svod.push(new Platform(data.svod[s]));
            }
            this.svod.sort(function(a, b) {
                if (a.name < b.name) return -1;
                else if (a.name > b.name) return 1;
                else return 0;
            });
        }
        if (data.vod) {
            this.vod = [];
            for (let v = 0; v < data.vod.length; v++) {
                this.vod.push(new Platform(data.vod[v]));
            }
            this.vod.sort(function(a, b) {
                if (a.name < b.name) return -1;
                else if (a.name > b.name) return 1;
                else return 0;
            });
        }
        this.country = country;
    }
    /**
     * Retourne les plateformes sous forme d'éléments HTML Option
     * @param  {string}           [type = 'svod'] -     Le type de plateformes souhaité
     * @param  {Array<number>}    [exclude = null] -    Les identifiants des plateformes à exclure
     * @return {string}                                 Les options sous forme de chaîne
     */
    renderHtmlOptions(type = 'svod', exclude: Array<number> = null): string {
        let options = '';
        if (type === PlatformList.types.svod) {
            const svod = this.svod.filter(elt => {
                return exclude.indexOf(elt.id) === -1;
            });
            for (let s = 0; s < svod.length; s++) {
                options += `<option value="${svod[s].id}" data-src="${svod[s].logo}">${svod[s].name}</option>`;
            }
        } else if (type === PlatformList.types.vod) {
            const vod = this.vod.filter(elt => {
                return exclude.indexOf(elt.id) === -1;
            });
            for (let v = 0; v < vod.length; v++) {
                options += `<option value="${vod[v].id}" data-src="${vod[v].logo}">${vod[v].name}</option>`;
            }
        }
        return options;
    }
}
/**
 * Classe représentant les différentes plateformes de diffusion d'un média
 * @class
 */
export class Platforms {
    /**
     * Contructeur
     * @param {Obj} data - Les données de l'objet
     */
    constructor(data: Obj) {
        this.svods = [];
        if (data?.svods && data?.svods instanceof Array) {
            for (let s = 0; s < data.svods.length; s++) {
                this.svods.push(new Platform(data.svods[s]));
            }
        }
        if (data?.svod) {
            this.svod = new Platform(data.svod);
        }
        this.vod = [];
        if (data?.vod && data?.vod instanceof Array) {
            for (let v = 0; v < data.vod.length; v++) {
                this.vod.push(new Platform(data.vod[v]));
            }
        }
    }
    /** @type {Array<Platform>} */
    svods: Array<Platform>;
    /** @type {Platform} */
    svod: Platform;
    /** @type {Array<Platform>} */
    vod: Array<Platform>;
}
/**
 * Class représentant un ShowRunner
 * @class
 */
export class Showrunner {
    /**
     * Contructeur
     * @param {Obj} data - Les données de l'objet
     */
    constructor(data: Obj) {
        this.id = data.id ? parseInt(data.id, 10) : null;
        this.name = data.name;
        this.picture = data.picture;
    }
    /** @type {number} */
    id: number;
    /** @type {string} */
    name: string;
    /** @type {string} */
    picture: string;
}
/**
 * Interface de la classe Show
 * @interface
 */
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
    persons: Array<Person>;
}
/**
 * Class representing a Show
 * @class
 * @extends Media
 * @implements {implShow, implAddNote}
 */
export class Show extends Media implements implShow, implAddNote {
    /***************************************************/
    /*                      STATIC                     */
    /***************************************************/

    /**
     * Types d'évenements gérés par cette classe
     * @type {Array}
     * @static
     */
    static EventTypes: Array<EventTypes> = [
        EventTypes.UPDATE,
        EventTypes.SAVE,
        EventTypes.ADD,
        EventTypes.ADDED,
        EventTypes.REMOVE,
        EventTypes.NOTE,
        EventTypes.ARCHIVE,
        EventTypes.UNARCHIVE
    ];
    /**
     * Propriétés pouvant être surchargées
     * @type {object}
     */
    static propsAllowedOverride: object = {
        poster: { path: 'images.poster' },
        season: { path: 'seasons[#season#].image', params: {season: 'number'} }
    };
    /**
     * Type de surcharge
     * Nécessaire pour la classe parente
     * @static
     * @type {string}
     */
    static overrideType = 'shows';
    /**
     * Les différents sélecteurs CSS des propriétés de l'objet
     * @static
     * @type {Record<string, string>}
     */
    static selectorsCSS: Record<string, string> = {
        title: '.blockInformations h1.blockInformations__title',
        description: '.blockInformations p.blockInformations__synopsis',
        creation: '.blockInformations .blockInformations__metadatas time',
        followers: '.blockInformations .blockInformations__metadatas span.u-colorWhiteOpacity05.textAlignCenter:nth-of-type(2)',
        nbSeasons: '.blockInformations .blockInformations__metadatas span.u-colorWhiteOpacity05.textAlignCenter:nth-of-type(3)',
        nbEpisodes: '.blockInformations .blockInformations__metadatas span.u-colorWhiteOpacity05.textAlignCenter:nth-of-type(4)',
        country: '.blockInformations .blockInformations__details li:nth-child(#n#) a',
        genres: '.blockInformations .blockInformations__details li:nth-child(#n#) span',
        duration: '.blockInformations .blockInformations__details li:nth-child(#n#) span',
        status: '.blockInformations .blockInformations__details li:nth-child(#n#) span',
        network: '.blockInformations .blockInformations__details li:nth-child(#n#) span',
        showrunner: '.blockInformations .blockInformations__details li:nth-child(#n#) span',
        /*rating: '#rating',
        seasons: '#seasons',
        episodes: '#episodes',
        comments: '#comments',
        characters: '#actors',
        similars: '#similars'*/
    };
    /**
     * Objet contenant les informations de relations entre les propriétés des objets de l'API
     * et les proriétés de cette classe.
     * Sert à la construction de l'objet
     * @static
     * @type {Record<string, RelatedProp>}
     */
    static relatedProps: Record<string, RelatedProp> = {
        // data: Obj => object: Show
        aliases: {key: "aliases", type: 'object', default: {}},
        comments: {key: "nbComments", type: 'number', default: 0},
        country: {key: "country", type: 'string', default: ''},
        creation: {key: "creation", type: 'number', default: 0},
        description: {key: "description", type: 'string', default: ''},
        episodes: {key: "nbEpisodes", type: 'number', default: 0},
        followers: {key: "followers", type: 'number', default: 0},
        genres: {key: "genres", type: 'array', transform: objToArr, default: []},
        id: {key: "id", type: 'number'},
        images: {key: "images", type: Images},
        imdb_id: {key: "imdb_id", type: 'string', default: ''},
        in_account: {key: "in_account", type: 'boolean', default: false},
        language: {key: "language", type: 'string', default: ''},
        length: {key: "duration", type: 'number', default: 0},
        network: {key: "network", type: 'string', default: ''},
        next_trailer: {key: "next_trailer", type: 'string', default: ''},
        next_trailer_host: {key: "next_trailer_host", type: 'string', default: ''},
        notes: {key: "objNote", type: Note},
        original_title: {key: "original_title", type: 'string', default: ''},
        platforms: {key: "platforms", type: Platforms},
        rating: {key: "rating", type: 'string', default: ''},
        resource_url: {key: "resource_url", type: 'string', default: ''},
        seasons: {key: "nbSeasons", type: 'number', default: 0},
        seasons_details: {key: "seasons", type: "array", transform: Show.seasonsDetailsToSeasons},
        showrunner: {key: "showrunner", type: Showrunner},
        similars: {key: "nbSimilars", type: 'number', default: 0},
        slug: {key: 'slug', type: 'string', default: ''},
        social_links: {key: "social_links", type: 'array', default: []},
        status: {key: "status", type: "string", default: ''},
        thetvdb_id: {key: "thetvdb_id", type: 'number', default: 0},
        themoviedb_id: {key: "tmdb_id", type: 'number', default: 0},
        title: {key: "title", type: 'string', default: ''},
        user: {key: "user", type: User}
    };
    /**
     * Fonction statique servant à construire un tableau d'objets Season
     * à partir des données de l'API
     * @static
     * @param   {Show} obj - L'objet Show
     * @param   {Obj} data - Les données provenant de l'API
     * @returns {Array<Season>}
     */
    static seasonsDetailsToSeasons(obj: Show, data: Obj): Array<Season> {
        if (Array.isArray(obj.seasons) && obj.seasons.length === data.length) {
            return obj.seasons;
        }
        const seasons = [];
        for (let s = 0; s < data.length; s++) {
            seasons.push(new Season(data[s], obj));
        }
        return seasons;
    }

    /**
     * Méthode static servant à récupérer une série sur l'API BS
     * @static
     * @private
     * @param  {Obj} params - Critères de recherche de la série
     * @param  {boolean} [force=false] - Indique si on utilise le cache ou non
     * @return {Promise<Show>}
     */
    protected static _fetch(params: Obj, force = false): Promise<Show> {
        return new Promise((resolve, reject) => {
            Base.callApi('GET', 'shows', 'display', params, force)
            .then(data => resolve(new Show(data.show, jQuery('.blockInformations'))) )
            .catch(err => reject(err) );
        });
    }

    /**
     * fetchLastSeen - Méthode static retournant les 10 dernières séries vues par le membre
     * @static
     * @param  {number}  [limit = 10]  Le nombre limite de séries retournées
     * @return {Promise<Show>}         Une promesse avec les séries
     */
    static fetchLastSeen(limit = 10): Promise<Array<Show>> {
        return new Promise((resolve, reject) => {
            Base.callApi(HTTP_VERBS.GET, 'shows', 'member', {order: 'last_seen', limit})
            .then((data: Obj) => {
                const shows: Array<Show> = [];
                for (let s = 0; s < data.shows.length; s++) {
                    shows.push(new Show(data.shows[s]));
                }
                resolve(shows);
            })
            .catch(err => reject(err));
        });
    }

    /**
     * Méthode static servant à récupérer plusieurs séries sur l'API BS
     * @static
     * @param  {Array<number>} ids - Les identifiants des séries recherchées
     * @return {Promise<Array<Show>>}
     */
    static fetchMulti(ids: Array<number>): Promise<Array<Show>> {
        return new Promise((resolve, reject) => {
            Base.callApi(HTTP_VERBS.GET, 'shows', 'display', {id: ids.join(',')})
            .then((data: Obj) => {
                const shows: Array<Show> = [];
                if (ids.length > 1) {
                    for (let s = 0; s < data.shows.length; s++) {
                        shows.push(new Show(data.shows[s]));
                    }
                } else {
                    shows.push(new Show(data.show));
                }
                resolve(shows);
            })
            .catch(err => reject(err));
        });
    }

    /**
     * Methode static servant à récupérer une série par son identifiant BS
     * @static
     * @param  {number} id - L'identifiant de la série
     * @param  {boolean} [force=false] - Indique si on utilise le cache ou non
     * @return {Promise<Show>}
     */
    static fetch(id: number, force = false): Promise<Show> {
        return Show._fetch({id}, force);
    }

    /**
     * Methode static servant à récupérer une série par son identifiant TheTVDB
     * @static
     * @param  {number} id - L'identifiant TheTVDB de la série
     * @param  {boolean} [force=false] - Indique si on utilise le cache ou non
     * @return {Promise<Show>}
     */
    static fetchByTvdb(id: number, force = false): Promise<Show> {
        return this._fetch({thetvdb_id: id}, force);
    }

    /**
     * Méthode static servant à récupérer une série par son identifiant URL
     * @static
     * @param   {string} url - Identifiant URL (slug) de la série recherchée
     * @param   {boolean} force - Indique si on doit ignorer les données dans le cache
     * @returns {Promise<Show>}
     */
    static fetchByUrl(url: string, force = true): Promise<Show> {
        return this._fetch({url: url}, force);
    }

    /***************************************************/
    /*                  PROPERTIES                     */
    /***************************************************/

    /**
     * @type {object} Contient les alias de la série
     */
    aliases: object;
    /**
     * @type {string} Année de création de la série
     */
    creation: string;
    /**
     * @type {string} Pays d'origine de la série
     */
    country: string;
    /**
     * @type {number} Pointeur vers la saison courante
     */
    _currentSeason: number;
    /**
     * @type {Images} Contient les URLs d'accès aux images de la série
     */
    images: Images;
    /**
     * @type {boolean} Indique si la série se trouve dans les séries à voir
     */
    markToSee: boolean;
    /**
     * @type {number} Nombre total d'épisodes dans la série
     */
    nbEpisodes: number;
    /**
     * @type {number} Nombre de saisons dans la série
     */
    nbSeasons: number;
    /**
     * @type {string} Chaîne TV ayant produit la série
     */
    network: string;
    /**
     * @type {string}
     */
    next_trailer: string;
    /**
     * @type {string}
     */
    next_trailer_host: string;
    /**
     * @type {string} Code de classification TV parental
     */
    rating: string;
    /**
     * @type {Array<Person>} Tableau des acteurs de la série
     */
    persons: Array<Person>;
    /**
     * @type {Array<Picture>} Tableau des images uploadées par les membres
     */
    pictures: Array<Picture>;
    /**
     * @type {Platforms} Plateformes de diffusion
     */
    platforms: Platforms;
    /**
     * @type {Array<Season>} Tableau des saisons de la série
     */
    seasons: Array<Season>;
    /**
     * @type {Showrunner}
     */
    showrunner: Showrunner;
    /**
     * @type {Array<string>} Tableau des liens sociaux de la série
     */
    social_links: Array<string>;
    /**
     * @type {string} Status de la série sur le compte du membre
     */
    status: string;
    /**
     * @type {number} Identifiant TheTVDB de la série
     */
    thetvdb_id: number;
    /**
     * @type {object} Contient les URLs des posters disponibles pour la série
     */
    _posters: object;

    /***************************************************/
    /*                      METHODS                    */
    /***************************************************/

    /**
     * Constructeur de la classe Show
     * @param   {Obj} data - Les données du média
     * @param   {JQuery<HTMLElement>} element - Le DOMElement associé au média
     * @returns {Media}
     */
    constructor(data: Obj, element?: JQuery<HTMLElement>) {
        super(data, element);
        this.__fetches = {};
        this._posters = null;
        this.persons = [];
        this.seasons = [];
        this.mediaType = {singular: MediaType.show, plural: 'shows', className: Show};
        return this.fill(data)._initRender();
    }
    /**
     * Initialisation du rendu HTML
     * Sert à définir les sélecteurs CSS et ajouter, si nécessaire, des balises HTML supplémentaires
     * Seulement si la propriété {@link Show.elt} est définie
     * @returns {Show}
     */
    _initRender(): this {
        if (!this.elt) {
            return this;
        }
        super._initRender();
        // title
        const $title = jQuery(Show.selectorsCSS.title);
        if ($title.length > 0) {
            const title = $title.text();
            $title.empty().append(`<span class="title">${title}</span>`);
            Show.selectorsCSS.title += ' span.title';
        }
        const $details = jQuery('.blockInformations__details li', this.elt);
        for (let d = 0, _len = $details.length; d < _len; d++) {
            const $li = jQuery($details.get(d));
            if ($li.get(0).classList.length <= 0) {
                const title = $li.find('strong').text().trim().toLowerCase();
                switch (title) {
                    case 'pays':
                        Show.selectorsCSS.country = Show.selectorsCSS.country.replace('#n#', (d+1).toString());
                        break;
                    case 'genres':
                        Media.selectorsCSS.genres = Media.selectorsCSS.genres.replace('#n#', (d+1).toString());
                        Show.selectorsCSS.genres = Show.selectorsCSS.genres.replace('#n#', (d+1).toString());
                        break;
                    case 'durée d’un épisode': {
                        Show.selectorsCSS.duration = Show.selectorsCSS.duration.replace('#n#', (d+1).toString());
                        const $span = jQuery(Show.selectorsCSS.duration);
                        const value = $span.text().trim();
                        const minutes = value.substring(0, value.indexOf(' '));
                        const text = value.substring(value.indexOf(' '));
                        $span.empty().append(`<span class="time">${minutes}</span>${text}`);
                        Show.selectorsCSS.duration += ' span.time';
                        Media.selectorsCSS.duration = Show.selectorsCSS.duration;
                        break;
                    }
                    case 'statut':
                        Show.selectorsCSS.status = Show.selectorsCSS.status.replace('#n#', (d+1).toString());
                        break;
                    case 'chaîne':
                        Show.selectorsCSS.network = Show.selectorsCSS.network.replace('#n#', (d+1).toString());
                        break;
                    case 'showrunner':
                        Show.selectorsCSS.showrunner = Show.selectorsCSS.showrunner.replace('#n#', (d+1).toString());
                        break;
                    default:
                        break;
                }
            }
        }
        return this;
    }
    /**
     * Met à jour le nombre de followers sur la page Web
     */
    updatePropRenderFollowers(): void {
        const $followers = jQuery(Show.selectorsCSS.followers);
        if ($followers.length > 0) {
            let text = `${this.followers.toString()} membre${this.followers > 1 ? 's' : ''}`;
            $followers.attr('title', text);
            if (this.followers >= 1000) {
                const thousand = Math.round(this.followers / 1000);
                text = `${thousand.toString()}K membres`;
            }
            $followers.text(text);
        }
        delete this.__changes.followers;
    }
    /**
     * Met à jour le nombre de saisons sur la page Web
     */
    updatePropRenderNbSeasons(): void {
        const $seasons = jQuery(Show.selectorsCSS.nbSeasons);
        if ($seasons.length > 0) {
            $seasons.text(`${this.nbSeasons.toString()} saison${this.nbSeasons > 1 ? 's' : ''}`);
        }
        delete this.__changes.nbSeasons;
    }
    /**
     * Met à jour le nombre d'épisodes sur la page Web
     */
    updatePropRenderNbEpisodes(): void {
        const $episodes = jQuery(Show.selectorsCSS.nbEpisodes);
        if ($episodes.length > 0) {
            $episodes.text(`${this.nbEpisodes.toString()} épisode${this.nbEpisodes > 1 ? 's' : ''}`);
        }
        delete this.__changes.nbEpisodes;
    }
    /**
     * Met à jour le statut de la série sur la page Web
     */
    updatePropRenderStatus(): void {
        const $status = jQuery(Show.selectorsCSS.status);
        if ($status.length > 0) {
            let text = 'Terminée';
            if (this.status.toLowerCase() === 'continuing') {
                text = 'En cours';
            }
            $status.text(text);
        }
        delete this.__changes.status;
    }
    /**
     * Met à jour la durée d'un épisode sur la page Web
     */
    updatePropRenderDuration(): void {
        const $duration = jQuery(Show.selectorsCSS.duration);
        if ($duration.length > 0) {
            $duration.text(this.duration.toString());
        }
    }
    /**
     * Initialise l'objet après sa construction et son remplissage
     * @returns {Promise<Show>}
     */
    public init(): Promise<this> {
        if (this.elt) {
            const promises = [];
            promises.push(this.fetchSeasons().then(() => {
                // On gère l'ajout et la suppression de la série dans le compte utilisateur
                if (this.in_account) {
                    this.deleteShowClick();
                } else {
                    this.addShowClick();
                }
                return this;
            }));
            promises.push(super.init());
            return Promise.all(promises).then(() => this);
        }
        return super.init();
    }
    /**
     * Récupère les données de la série sur l'API
     * @param  {boolean} [force=true]   Indique si on utilise les données en cache
     * @return {Promise<*>}             Les données de la série
     */
    fetch(force = true): Promise<Obj> {
        const self = this;
        if (this.__fetches.show) return this.__fetches.show;
        this.__fetches.show = Base.callApi('GET', 'shows', 'display', {id: this.id}, force)
        .then((data) => {
            return data;
        }).finally(() => delete self.__fetches.show);
        return this.__fetches.show;
    }
    /**
     * Récupère les saisons de la série
     * @returns {Promise<Show>}
     */
    fetchSeasons(): Promise<Show> {
        const self = this;
        if (this.__fetches.seasons) return this.__fetches.seasons as Promise<Show>;
        const params: Obj = {thetvdb_id: this.thetvdb_id};
        let force = false;
        if (this.thetvdb_id <= 0) {
            delete params.thetvdb_id;
            params.id = this.id;
            force = true;
        }
        this.__fetches.seasons = Base.callApi(HTTP_VERBS.GET, 'shows', 'seasons', params, force)
        .then((data: Obj) => {
            self.seasons = [];
            if (data?.seasons?.length <= 0) {
                return self;
            }
            let seasonNumber: number;
            for (let s = 0; s < data.seasons.length; s++) {
                seasonNumber = parseInt(data.seasons[s].number, 10);
                self.seasons[seasonNumber - 1] = new Season(data.seasons[s], this);
            }
            return self;
        }).finally(() => delete self.__fetches.seasons);
        return this.__fetches.seasons as Promise<Show>;
    }
    /**
     * Récupère les personnages de la série
     * @override
     * @returns {Promise<Show>}
     */
    fetchCharacters(): Promise<this> {
        const self = this;
        if (this.__fetches.characters) return this.__fetches.characters as Promise<this>;
        this.__fetches.characters = Base.callApi(HTTP_VERBS.GET, 'shows', 'characters', {thetvdb_id: this.thetvdb_id})
        .then((data: Obj) => {
            self.characters = [];
            if (data?.characters?.length <= 0) {
                return self;
            }
            for (let c = 0; c < data.characters.length; c++) {
                self.characters.push(new Character(data.characters[c]));
            }
            return self;
        }).finally(() => delete self.__fetches.characters);
        return this.__fetches.characters as Promise<this>;
    }
    /**
     * Retourne le personnage associé au nom d'acteur de la série
     * @param   {String} name - Nom de l'acteur
     * @returns {Character | null}
     */
    getCharacterByName(name: string): Character | null {
        const comp = name.toLocaleLowerCase();
        for (const actor of this.characters) {
            if (actor.actor.toLocaleLowerCase() === comp) return actor;
        }
        return null;
    }
    /**
     * Récupère les acteurs sur l'API BetaSeries
     * @returns {Promise<Show>}
     */
    fetchPersons(): Promise<Show> {
        const self = this;
        if (this.__fetches.persons) return this.__fetches.persons as Promise<Show>;
        this.__fetches.persons = Base.callApi(HTTP_VERBS.GET, 'persons', 'show', {id: this.id})
        .then(data => {
            this.persons = [];
            if (data.persons) {
                for (let p = 0; p < data.persons.length; p++) {
                    self.persons.push(new Person(data.persons[p]));
                }
            }
            return self;
        }).finally(() => delete self.__fetches.persons);
        return this.__fetches.persons as Promise<Show>;
    }
    /**
     * Récupère les acteurs sur l'API BetaSeries à partir
     * des personnages de la série
     * @async
     * @returns {Promise<Show>}
     */
    async fetchPersonsFromCharacters(): Promise<Show> {
        const self = this;
        if (this.characters.length <= 0) {
            await this.fetchCharacters();
        }
        const promises = [];
        for (let c = 0; c < self.characters.length; c++) {
            promises.push(Person.fetch(self.characters[c].person_id));
        }
        return Promise.all(promises).then((persons) => {
            for (let p = 0; p < persons.length; p++) {
                if (persons[p]) self.persons.push(persons[p]);
            }
            return self;
        });
    }
    /**
     * Retourne un acteur en le cherchant par son nom
     * @param   {String} name - Nom de l'acteur
     * @returns {Person | null}
     */
    getPersonByName(name: string): Person | null {
        const comp = name.toLowerCase();
        for (const actor of this.persons) {
            if (actor.name.toLowerCase() === comp) return actor;
        }
        return null;
    }
    /**
     * Retourne un acteur en le cherchant par son ID
     * @param   {number} id - Identifiant de l'acteur
     * @returns {Person | null}
     */
    getPersonById(id: number): Person | null {
        for (const actor of this.persons) {
            if (actor.id === id) return actor;
        }
        return null;
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
     * isMarkToSee - Indique si la série se trouve dans les séries à voir
     * @async
     * @returns {boolean}
     */
    async isMarkedToSee(): Promise<boolean> {
        const toSee: Obj = await Base.gm_funcs.getValue('toSee', {});
        return toSee[this.id] !== undefined;
    }
    /**
     * addToAccount - Ajout la série sur le compte du membre connecté
     * @return {Promise<Show>} Promise of show
     */
    addToAccount(): Promise<Show> {
        const self = this;
        if (this.in_account) return new Promise(resolve => resolve(self));

        return new Promise((resolve, reject) => {
            Base.callApi('POST', 'shows', 'show', {id: self.id})
            .then(data => {
                self.fill(data.show);
                self._callListeners(EventTypes.ADD);
                self.save();
                resolve(self);
            }, err => {
                // Si la série est déjà sur le compte du membre
                if (err.code !== undefined && err.code === 2003) {
                    self.update().then((show: Show) => {
                        return resolve(show);
                    });
                }
                reject(err);
            });
        });
    }
    /**
     * Remove Show from account member
     * @return {Promise<Show>} Promise of show
     */
    removeFromAccount(): Promise<Show> {
        const self = this;
        if (! this.in_account) return new Promise(resolve => resolve(self));

        return new Promise((resolve, reject) => {
            Base.callApi('DELETE', 'shows', 'show', {id: self.id})
            .then(data => {
                self.fill(data.show);
                self._callListeners(EventTypes.REMOVE);
                self.save();
                resolve(self);
            }, err => {
                // Si la série n'est plus sur le compte du membre
                if (err.code !== undefined && err.code === 2004) {
                    self.update().then((show: Show) => {
                        return resolve(show);
                    });
                }
                reject(err);
            });
        });
    }
    /**
     * Archive la série
     * @return {Promise<Show>} Promise of show
     */
    archive(): Promise<Show> {
        const self = this;
        return new Promise((resolve, reject) => {
            Media.callApi('POST', 'shows', 'archive', {id: self.id})
            .then(data => {
                self.fill(data.show);
                self.save();
                self._callListeners(EventTypes.ARCHIVE);
                resolve(self);
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
        const self = this;
        return new Promise((resolve, reject) => {
            Media.callApi('DELETE', 'shows', 'archive', {id: self.id})
            .then(data => {
                self.fill(data.show);
                self.save();
                self._callListeners(EventTypes.UNARCHIVE);
                resolve(self);
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
        const self = this;
        return new Promise((resolve, reject) => {
            Media.callApi('POST', 'shows', 'favorite', {id: self.id})
            .then(data => {
                self.fill(data.show);
                self.save();
                resolve(self);
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
        const self = this;
        return new Promise((resolve, reject) => {
            Media.callApi('DELETE', 'shows', 'favorite', {id: self.id})
            .then(data => {
                self.fill(data.show);
                self.save();
                resolve(self);
            }, err => {
                reject(err);
            });
        });
    }
    /**
     * Met à jour les données de la série
     * @param  {Callback} [cb = Base.noop]  Fonction de callback
     * @return {Promise<Show>}              Promesse (Show)
     */
    update(cb: Callback = Base.noop): Promise<Show> {
        const self = this;
        return Base.callApi('GET', 'shows', 'display', {id: self.id}, true)
        .then(data => {
            if (data.show) {
                self.fill(data.show).save();
                self.updateRender(() => {
                    if (typeof cb === 'function') cb();
                    self._callListeners(EventTypes.UPDATE);
                });
            }
            return self;
        })
        .catch(err => {
            Base.notification('Erreur de récupération de la ressource Show', 'Show update: ' + err);
            if (typeof cb === 'function') cb();
        }) as Promise<Show>;
    }
    /**
     * Met à jour le rendu de la barre de progression
     * et du prochain épisode
     * @param  {Callback} [cb=Base.noop] Fonction de callback
     * @return {void}
     */
    updateRender(cb: Callback = Base.noop): void {
        if (!this.elt) return;

        const self = this;
        this.updateProgressBar();
        this.updateNextEpisode();
        this.updateArchived();
        // this.updateNote();
        const note = this.objNote;
        if (Base.debug) {
            console.log('Next ID et status', {
                next: this.user.next.id,
                status: this.status,
                archived: this.user.archived,
                note_user: note.user
            });
        }
        // Si il n'y a plus d'épisodes à regarder
        if (this.user.remaining === 0 && this.in_account && this.currentSeason.seen) {
            let promise = new Promise(resolve => { return resolve(void 0); });
            // On propose d'archiver si la série n'est plus en production
            if (this.isEnded() && ! this.isArchived())
            {
                if (Base.debug) console.log('Série terminée, popup proposition archivage');
                promise = new Promise(resolve => {
                    // eslint-disable-next-line no-undef
                    new PopupAlert({
                        title: 'Archivage de la série',
                        text: 'Voulez-vous archiver cette série terminée ?',
                        callback_yes: function() {
                            jQuery('#reactjs-show-actions button.btn-archive', this.elt).trigger('click');
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
                    let retourCallback = false;
                    // eslint-disable-next-line no-undef
                    new PopupAlert({
                        title: Base.trans("popin.note.title.show"),
                        text: "Voulez-vous noter la série ?",
                        callback_yes: function() {
                            // jQuery('.blockInformations__metadatas > button').trigger('click');
                            retourCallback = true;
                            return true;
                        },
                        callback_no: function() {
                            return true;
                        },
                        onClose: function() {
                            if (retourCallback) {
                                self.objNote.updateStars();
                                self.objNote.createPopupForVote();
                            }
                        }
                    });
                });
            }
            promise.then(() => {
                cb();
            });
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
     * Simule un clic sur le bouton d'archivage de la série sur la page Web
     */
    updateArchived(): void {
        if (!this.elt) return;
        if (Base.debug) console.log('Show updateArchived');
        const $btnArchive = jQuery('#reactjs-show-actions button.btn-archive', this.elt);
        if (this.isArchived() && $btnArchive.length > 0) {
            $btnArchive.trigger('click');
        }
    }
    /**
     * Met à jour le bloc du prochain épisode à voir
     * @param   {Callback} [cb=noop] Fonction de callback
     * @returns {void}
     */
    updateNextEpisode(cb: Callback = Base.noop): void {
        if (!this.elt) return;
        if (Base.debug) console.log('updateNextEpisode');
        const self = this;
        const $nextEpisode = jQuery('a.blockNextEpisode', this.elt);
        /**
         * Retourne le nombre total d'épisodes non vus dans la série
         * @return {string} le nombre total d'épisodes non vus
         */
        const getNbEpisodesUnwatchedTotal = function(): string {
            let nbEpisodes = 0;
            for (let s = 0; s < self.seasons.length; s++) {
                nbEpisodes += self.seasons[s].getNbEpisodesUnwatched();
            }
            return nbEpisodes.toString();
        };

        if ($nextEpisode.length > 0 && this.user.next && !isNaN(this.user.next.id)) {
            const seasonNext = parseInt(this.user.next.code.match(/S\d+/)[0].replace('S',''), 10);
            let next = this.user.next;
            const episode = this.currentSeason?.getNextEpisodeUnwatched();
            if (seasonNext < this.currentSeason?.number && episode) {
                next = new Next({
                    id: episode.id,
                    code: episode.code,
                    date: episode.date,
                    title: episode.title,
                    image: ''
                });
            }
            if (Base.debug) console.log('nextEpisode et show.user.next OK', this.user, next);
            // Modifier l'image
            const $img = $nextEpisode.find('img'),
                  $remaining = $nextEpisode.find('.remaining div'),
                  $parent = $img.parent('div'),
                  height = $img.attr('height'),
                  width = $img.attr('width'),
                  src = `${Base.api.url}/pictures/episodes?key=${Base.userKey}&id=${next.id}&width=${width}&height=${height}`;
            $img.remove();
            $parent.append(`<img data-src="${src}" class="js-lazy-image" height="${height}" width="${width}" />`);
            // Modifier le titre
            $nextEpisode.find('.titleEpisode').text(`${next.code.toUpperCase()} - ${next.title}`);
            // Modifier le lien
            $nextEpisode.attr('href', $nextEpisode.attr('href').replace(/s\d{2}e\d{2}/, next.code.toLowerCase()));
            // Modifier le nombre d'épisodes restants
            $remaining.text($remaining.text().trim().replace(/^\d+/, getNbEpisodesUnwatchedTotal()));
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

            jQuery('.blockInformations__actions').last().after(
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
                        <div class="u-colorWhiteOpacity05">${getNbEpisodesUnwatchedTotal()} épisode${(res.user.remaining > 1) ? 's' : ''} à regarder</div>
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
    addShowClick(trigEpisode = false): void {
        const self = this;
        const vignettes = $('#episodes .slide__image');
        // Vérifier si le membre a ajouter la série à son compte
        if (! this.in_account) {
            // Remplacer le DOMElement supprime l'eventHandler
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
            this.addBtnToSee();
            const title = this.title.replace(/"/g, '\\"').replace(/'/g, "\\'");
            const templateOpts = `<a class="header-navigation-item" href="javascript:;" onclick="showUpdate('${title}', ${this.id}, '0')">Demander une mise à jour</a>`;
            jQuery('.blockInformations__action .dropdown-menu.header-navigation[aria-labelledby="dropdownOptions"]')
                    .append(templateOpts);
            // On ajoute un event click pour masquer les vignettes
            jQuery('#reactjs-show-actions > div > button').off('click').one('click', (e: JQuery.ClickEvent) => {
                e.stopPropagation();
                e.preventDefault();
                if (Base.debug) console.groupCollapsed('AddShow');
                const done = function(): void {
                    // On met à jour les boutons Archiver et Favori
                    changeBtnAdd(self);
                    // On met à jour le bloc du prochain épisode à voir
                    self.updateNextEpisode(function() {
                        self._callListeners(EventTypes.ADDED);
                        if (Base.debug) console.groupEnd();
                    });
                };
                self.addToAccount()
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
        async function changeBtnAdd(show: Show): Promise<void> {
            const $optionsLinks = jQuery('.blockInformations__action .dropdown-menu a.header-navigation-item');
            if ($optionsLinks.length <= 3) {
                const react_id = jQuery('script[id^="/reactjs/"]').get(0).id.split('.')[1],
                      urlShow = show.resource_url.substring(location.origin.length),
                      title = show.title.replace(/"/g, '\\"').replace(/'/g, "\\'");
                let templateOpts = `
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
                        <a class="header-navigation-item" href="webcal://www.betaseries.com/cal/i${urlShow}">Planning iCal de la série</a>

                        <form class="autocomplete js-autocomplete-form header-navigation-item">
                            <button type="reset" class="btn-reset fontWeight700 js-autocomplete-show" style="color: inherit">Recommander la série</button>
                            <div class="autocomplete__toShow" hidden="">
                                <input placeholder="Nom d'un ami" type="text" class="autocomplete__input js-search-friends">
                                <div class="autocomplete__response js-display-response"></div>
                            </div>
                        </form>
                        <script>
                            new SearchFriend({url: document.querySelector("[data-show-url]").dataset.showUrl});
                        </script>
                        <a class="header-navigation-item" href="javascript:;">Supprimer de mes séries</a>`;
                if ($optionsLinks.length === 2) {
                    templateOpts = `<a class="header-navigation-item" href="${urlShow}/actions">Vos actions sur la série</a>` + templateOpts;
                }
                jQuery('.blockInformations__action .dropdown-menu.header-navigation[aria-labelledby="dropdownOptions"]')
                    .append(templateOpts);
            }

            // On remplace le bouton Ajouter par les boutons Archiver et Favoris
            const divs = jQuery('#reactjs-show-actions > div');
            if (divs.length === 1) {
                const $reactjs: JQuery<HTMLElement> = jQuery('#reactjs-show-actions');
                $reactjs
                    .empty()
                    .append(`
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
                self.elt = $('.blockInformations');
                const btnAddSimilars = `<button
                    type="button"
                    class="btn-reset blockTitle-subtitle u-colorWhiteOpacity05"
                >
                    ${Base.trans("popup.suggest_show.title", {'%title%': "une série"})}</button>`;
                jQuery('#similars h2.blockTitle').after(btnAddSimilars);
                // self.addNumberVoters();
                // On supprime le btn ToSeeLater
                self.elt.find('.blockInformations__action .btnMarkToSee').parent().remove();
                self.elt.find('.blockInformations__title .fa-clock-o').remove();
                const toSee = await Base.gm_funcs.getValue('toSee', {});
                if (toSee[self.id] !== undefined) {
                    delete toSee[self.id];
                    Base.gm_funcs.setValue('toSee', toSee);
                }
            }
            self.addEventBtnsArchiveAndFavoris();
            self.deleteShowClick();
        }
        if (trigEpisode) {
            this.update().then(show => {
                changeBtnAdd(show);
            });
        }
    }
    /**
     * Gère la suppression de la série du compte utilisateur
     * @returns {void}
     */
    deleteShowClick(): void {
        const self = this;
        const $optionsLinks = $('#dropdownOptions').siblings('.dropdown-menu').children('a.header-navigation-item');
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
                        self.user.status = 0;
                        self.user.archived = false;
                        self.user.favorited = false;
                        self.user.remaining = 0;
                        self.user.last = "S00E00";
                        self.user.next.id = NaN;
                        self.save();

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
                        let promise: Promise<Season>,
                            update = false; // Flag pour l'update de l'affichage
                        if (self.currentSeason.episodes && self.currentSeason.episodes.length > 0) {
                            promise = new Promise(resolve => resolve(self.currentSeason));
                        } else {
                            promise = self.currentSeason.fetchEpisodes();
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
                        self.elt = $('.blockInformations');
                        // self.addNumberVoters();
                        self.addBtnToSee();
                        self.addShowClick();
                        self.updateProgressBar();
                        self.updateNextEpisode();
                    };
                    // eslint-disable-next-line no-undef
                    new PopupAlert({
                        title: Base.trans("popup.delete_show_success.title"),
                        text: Base.trans("popup.delete_show_success.text", { "%title%": self.title }),
                        yes: Base.trans("popup.delete_show_success.yes"),
                        callback_yes: afterNotif
                    });
                };
                // Supprimer la série du compte utilisateur
                // eslint-disable-next-line no-undef
                new PopupAlert({
                    title: Base.trans("popup.delete_show.title", { "%title%": self.title }),
                    text: Base.trans("popup.delete_show.text", { "%title%": self.title }),
                    callback_yes: function() {
                        if (Base.debug) console.groupCollapsed('delete show');
                        self.removeFromAccount()
                        .then(done, err => {
                            if (err && err.code !== undefined && err.code === 2004) {
                                done();
                                if (Base.debug) console.groupEnd();
                                return;
                            }
                            Media.notification('Erreur de suppression de la série', err);
                            if (Base.debug) console.groupEnd();
                        });
                    },
                    callback_no: Base.noop
                });
            });
        }
    }
    /**
     * Ajoute le bouton toSee dans les actions de la série
     * @sync
     */
    async addBtnToSee(): Promise<void> {
        if (this.elt.find('.btnMarkToSee').length > 0) return;
        const self = this;
        const btnHTML = `
            <div class="blockInformations__action">
                <button class="btn-reset btn-transparent btnMarkToSee" type="button" title="Ajouter la série aux séries à voir">
                    <i class="fa fa-clock-o" aria-hidden="true"></i>
                </button>
                <div class="label">A voir</div>
            </div>`;
        const toggleToSeeShow = async (showId: number): Promise<boolean> => {
            const storeToSee: Array<number> = await Base.gm_funcs.getValue('toSee', []);
            const toSee = storeToSee.includes(showId);
            if (!toSee) {
                storeToSee.push(showId);
            } else {
                storeToSee.splice(storeToSee.indexOf(showId), 1);
            }
            Base.gm_funcs.setValue('toSee', storeToSee);
            return toSee;
        };
        this.elt.find('.blockInformations__actions').last().append(btnHTML);
        const $btn = this.elt.find('.blockInformations__action .btnMarkToSee');
        $btn.on('click', async (e: JQuery.ClickEvent) => {
            e.stopPropagation();
            e.preventDefault();
            const $btn = jQuery(e.currentTarget);
            const toSee = await toggleToSeeShow(self.id);
            if (toSee) {
                $btn.find('i.fa').css('color', 'var(--body_background)');
                $btn.attr('title', 'Retirer la série des séries à voir');
                self.elt.find('.blockInformations__title').append('<i class="fa fa-clock-o" aria-hidden="true" style="font-size:0.6em;margin-left:5px;vertical-align:middle;" title="Série à voir plus tard"></i>');
            } else {
                $btn.find('i.fa').css('color', 'var(--default-color)');
                $btn.attr('title', 'Ajouter la série aux séries à voir');
                self.elt.find('.blockInformations__title .fa').remove();
            }
            $btn.blur();
        });
        const toSee: Obj = await Base.gm_funcs.getValue('toSee', {});
        if (toSee[this.id] !== undefined) {
            $btn.find('i.fa').css('color', 'var(--body_background)');
            $btn.attr('title', 'Retirer la série des séries à voir');
            self.elt.find('.blockInformations__title').append('<i class="fa fa-clock-o" aria-hidden="true" style="font-size:0.6em;" title="Série à voir plus tard"></i>');
        }
    }
    /**
     * Ajoute un eventHandler sur les boutons Archiver et Favoris
     * @returns {void}
     */
    addEventBtnsArchiveAndFavoris(): void {
        const self = this;
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
            if (! self.isArchived()) {
                updateBtnArchive(
                    self.archive(), 'rotate(180deg)',
                    'show.button.unarchive.label', 'Erreur d\'archivage de la série'
                );
            } else {
                updateBtnArchive(
                    self.unarchive(), 'rotate(0deg)',
                    'show.button.archive.label', 'Erreur désarchivage de la série'
                );
            }
        });
        // Event bouton Favoris
        $btnFavoris.off('click').click((e: JQuery.ClickEvent): void => {
            e.stopPropagation();
            e.preventDefault();
            if (Base.debug) console.groupCollapsed('show-favoris');
            if (! self.isFavorite()) {
                self.favorite()
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
                self.unfavorite()
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
            const rating: Rating = Base.ratings[this.rating] !== undefined ? Base.ratings[this.rating] : null;
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
        this._currentSeason = seasonNumber - 1;
        return this;
    }
    /**
     * Retourne la saison courante
     * @return {Season}
     */
    public get currentSeason() : Season {
        return this.seasons[this._currentSeason];
    }
    /**
     * Retourne l'objet Season correspondant au numéro de saison fournit en paramètre
     * @param   {number} seasonNumber - Numéro de saison (base: 1)
     * @returns {Season}
     */
    getSeason(seasonNumber: number): Season {
        if (Base.debug) console.log('getSeason: ', seasonNumber);
        for (let s = 0; s < this.seasons.length; s++) {
            if (this.seasons[s].number == seasonNumber) {
                return this.seasons[s];
            }
        }
        return null;
    }
    /**
     * Retourne une image, si disponible, en fonction du format désiré
     * @param  {string = Images.formats.poster} format   Le format de l'image désiré
     * @return {Promise<string>}                         L'URL de l'image
     */
    getDefaultImage(format: string = Images.formats.poster): Promise<string> {
        const proxy = Base.serverBaseUrl + '/posters';
        const initFetch: RequestInit = { // objet qui contient les paramètres de la requête
            method: 'GET',
            headers: {
                'origin': 'https://www.betaseries.com',
                'x-requested-with': ''
            },
            mode: 'cors',
            cache: 'no-cache'
        };
        return new Promise((res, rej) => {
            if (format === Images.formats.poster) {
                if (Base.debug) console.log('getDefaultImage poster', this.images.poster);
                if (this.images.poster) res(this.images.poster);
                else {
                    this._getTvdbUrl(this.thetvdb_id).then(url => {
                        if (!url) return res('');
                        const urlTvdb = new URL(url);
                        fetch(`${proxy}${urlTvdb.pathname}`, initFetch)
                        .then((resp: Response) => {
                            if (resp.ok) {
                                return resp.text();
                            }
                            return null;
                        }).then(html => {
                            if (html == null) {
                                return rej('HTML error');
                            }
                            const parser = new DOMParser();
                            const doc: Document = parser.parseFromString(html, 'text/html');
                            const link: HTMLLinkElement = doc.querySelector('.container .row a[rel="artwork_posters"]');
                            if (link) res(link.href.replace('original', 'w500'));
                            rej('poster not found');
                        }).catch(err => rej(err));
                    });
                }
            }
            else if (format === Images.formats.wide) {
                if (this.images.show !== null) res(this.images.show);
                else if(this.images.box !== null) res(this.images.box);
                else {
                    this._getTvdbUrl(this.thetvdb_id).then(url => {
                        if (!url) return res('');
                        const urlTvdb = new URL(url);
                        fetch(`${proxy}${urlTvdb.pathname}`, initFetch)
                        .then((resp: Response) => {
                            if (resp.ok) {
                                return resp.text();
                            }
                            return null;
                        }).then(html => {
                            if (html == null) {
                                return rej('HTML error');
                            }
                            const parser = new DOMParser();
                            const doc: Document = parser.parseFromString(html, 'text/html');
                            const link: HTMLLinkElement = doc.querySelector('.container .row a[rel="artwork_backgrounds"]');
                            if (link) res(link.href.replace('original', 'w500'));
                            rej('image not found');
                        }).catch(err => rej(err));
                    });
                }
            }
        });
    }
    /**
     * Récupère et retourne les différentes affiches disponibles
     * @returns {object}
     */
    getAllPosters(): Promise<object> {
        if (this._posters) {
            return new Promise(res => res(this._posters));
        }
        const proxy = Base.serverBaseUrl + '/posters';
        const initFetch: RequestInit = { // objet qui contient les paramètres de la requête
            method: 'GET',
            headers: {
                'origin': 'https://www.betaseries.com',
                'x-requested-with': ''
            },
            mode: 'cors',
            cache: 'no-cache'
        };
        return new Promise((res, rej) => {
            const posters = {};
            if (this.images?._local.poster) posters['local'] = [this.images._local.poster];
            this._getTvdbUrl(this.thetvdb_id).then(url => {
                // console.log('getAllPosters url', url);
                if (!url) return res(posters);
                const urlTvdb = new URL(url);
                fetch(`${proxy}${urlTvdb.pathname}/artwork/posters`, initFetch)
                .then((resp: Response) => {
                    if (resp.ok) {
                        return resp.text();
                    }
                    return null;
                }).then(html => {
                    if (html == null) {
                        return rej('HTML error');
                    }
                    posters['TheTVDB'] = [];
                    const parser = new DOMParser();
                    const doc: Document = parser.parseFromString(html, 'text/html');
                    const imgs: NodeListOf<HTMLImageElement> = doc.querySelectorAll('a.thumbnail img');
                    for (let l = 0; l < imgs.length; l++) {
                        posters['TheTVDB'].push(imgs[l].dataset.src);
                    }
                    this._posters = posters;
                    res(posters);
                }).catch(err => rej(err));
            })
        });
    }
}