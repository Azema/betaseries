import { Base, UsBetaSeries, EventTypes, HTTP_VERBS, Obj } from "./Base";
import { CacheUS, DataTypesCache } from "./Cache";
import { Character } from "./Character";
import { CommentsBS } from "./Comments";
import { implAddNote, Note } from "./Note";
import { RenderHtml } from "./RenderHtml";
import { Similar } from "./Similar";
import { User } from "./User";

type Class<T> = new (...args: any[]) => T;
export enum MediaType {
    show = 'show',
    movie = 'movie',
    episode = 'episode'
}
export type MediaTypes = {
    singular: MediaType;
    plural: string;
    className: Class<Base>;
};

export abstract class MediaBase extends RenderHtml implements implAddNote {

    /*
                    PROPERTIES
    */
    /** @type {string} */
    description: string;
    /** @type {number} */
    nbComments: number;
    /** @type {number} */
    id: number;
    /** @type {Note} */
    objNote: Note;
    /** @type {string} */
    resource_url: string;
    /** @type {string} */
    title: string;
    /** @type {User} */
    user: User;
    /** @type {Array<Character>} */
    characters: Array<Character>;
    /** @type {CommentsBS} */
    comments: CommentsBS;
    /** @type {MediaTypes} */
    mediaType: MediaTypes;

    constructor(data: Obj, elt?: JQuery<HTMLElement>) {
        super(data, elt);
        this.characters = [];
        this.__props = ['characters', 'comments', 'mediaType'];
        return this;
    }

    /**
     * Initialisation du rendu HTML
     * @returns {MediaBase}
     */
    _initRender(): this {
        if (!this.elt) return this;
        // console.log('Base._initRender', this);
        this.objNote
            .updateAttrTitle()
            .updateStars();
        this.decodeTitle();
        return this;
    }
    /**
     * Met à jour les informations de la note du média sur la page Web
     */
    updatePropRenderObjNote(): void {
        if (! this.elt) return;
        if (UsBetaSeries.debug) console.log('updatePropRenderObjNote');
        this.objNote
            .updateStars()
            .updateAttrTitle();
        this._callListeners(EventTypes.NOTE);
        delete this.__changes.objNote;
    }
    /**
     * Met à jour le titre du média sur la page Web
     */
    updatePropRenderTitle(): void {
        if (! this.elt) return;
        const $title = jQuery((this.constructor as typeof RenderHtml).selectorsCSS.title);
        if (/&#/.test(this.title)) {
            $title.text($('<textarea />').html(this.title).text());
        } else {
            $title.text(this.title);
        }
        delete this.__changes.title;
    }
    /**
     * Méthode d'initialisation de l'objet
     * @returns {Promise<MediaBase>}
     */
    public init(): Promise<this> {
        if (this.elt) {
            this.comments = new CommentsBS(this.nbComments, this);
        }
        this.save();
        return new Promise(resolve => resolve(this));
    }
    /**
     * Sauvegarde l'objet en cache
     * @return {MediaBase} L'instance du média
     */
    public save(): this {
        if (UsBetaSeries.cache instanceof CacheUS) {
            UsBetaSeries.cache.set(this.mediaType.plural as DataTypesCache, this.id, this);
            this._callListeners(EventTypes.SAVE);
        }
        return this;
    }
    /**
     * Retourne le nombre d'acteurs référencés dans ce média
     * @returns {number}
     */
    get nbCharacters(): number {
        return this.characters.length;
    }
    /**
     * Décode le titre de la page
     * @return {Base} L'instance du média
     */
    decodeTitle(): MediaBase {
        if (!this.elt) return this;

        let $elt = jQuery('.blockInformations__title', this.elt);
        if ((this.constructor as typeof RenderHtml).selectorsCSS.title) {
            $elt = jQuery((this.constructor as typeof RenderHtml).selectorsCSS.title);
        }
        const title = $elt.text();

        if (/&#/.test(title)) {
            $elt.text($('<textarea />').html(title).text());
        }
        return this;
    }
    /**
     * Ajoute le nombre de votes, à la note du média, dans l'attribut title de la balise
     * contenant la représentation de la note du média
     *
     * @return {void}
     */
    changeTitleNote(): void {
        if (!this.elt) return;
        const $elt = jQuery('.js-render-stars', this.elt);
        if (this.objNote.mean <= 0 || this.objNote.total <= 0) {
            $elt.attr('title', 'Aucun vote');
            return;
        }
        $elt.attr('title', this.objNote.toString());
    }
    /**
     * Ajoute le vote du membre connecté pour le média
     * @param   {number} note - Note du membre connecté pour le média
     * @returns {Promise<boolean>}
     */
    addVote(note: number): Promise<boolean> {
        const self = this;
        // return new Promise((resolve, reject) => {
        return UsBetaSeries.callApi(HTTP_VERBS.POST, this.mediaType.plural, 'note', {id: this.id, note: note})
            .then((data: Obj) => {
                self.fill(data[this.mediaType.singular]);
                return this.objNote.user == note;
            })
            .catch(err => {
                UsBetaSeries.notification('Erreur de vote', 'Une erreur s\'est produite lors de l\'envoi de la note: ' + err);
                return false;
            }) as Promise<boolean>;
        // });
    }
    /**
     * *fetchCharacters* - Récupère les acteurs du média
     * @abstract
     * @returns {Promise<MediaBase>}
     */
    fetchCharacters(): Promise<this> {
        throw new Error('Method abstract');
    }
    /**
     * *getCharacter* - Retourne un personnage à partir de son identifiant
     * @param   {number} id - Identifiant de l'actor
     * @returns {Character | null}
     */
    getCharacter(id: number): Character | null {
        for (const actor of this.characters) {
            if (actor.person_id === id) return actor;
        }
        return null;
    }
}

export abstract class Media extends MediaBase {

    /***************************************************/
    /*                      STATIC                     */
    /***************************************************/

    static propsAllowedOverride: object = {};
    static overrideType: string;
    static selectorsCSS: Record<string, string> = {
        genres: '.blockInformations .blockInformations__details li:nth-child(#n#) span',
        duration: '.blockInformations .blockInformations__details li:nth-child(#n#) span'
    };

    /**
     * Méthode static servant à récupérer un média sur l'API BS
     * @param  {Obj} params - Critères de recherche du média
     * @param  {boolean} [force=false] - Indique si on utilise le cache ou non
     * @return {Promise<Show>}
     * @protected
     * @abstract
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected static _fetch(params: Obj, force: boolean): Promise<Media> {
        throw new Error("Abstract Static Method");
    }

    /**
     * Methode static servant à récupérer un média par son identifiant IMDB
     * @param  {number} id - L'identifiant IMDB du média
     * @param  {boolean} [force=false] - Indique si on utilise le cache ou non
     * @return {Promise<Media>}
     */
    static fetchByImdb(id: number, force = false): Promise<Media> {
        return this._fetch({imdb_id: id}, force);
    }

    /***************************************************/
    /*                  PROPERTIES                     */
    /***************************************************/

    /**
     * Nombre de membres ayant ce média sur leur compte
     * @type {number}
     */
    followers: number;
    /**
     * Les genres attribués à ce média
     * @type {string[]}
     */
    genres: Array<string>;
    /**
     * Identifiant IMDB
     * @type {string}
     */
    imdb_id: string;
    /**
     * Langue originale du média
     * @type {string}
     */
    language: string;
    /**
     * Durée du média en minutes
     * @type {number}
     */
    duration: number;
    /**
     * Titre original du média
     * @type {string}
     */
    original_title: string;
    /**
     * Tableau des médias similaires
     * @type {Similar[]}
     */
    similars: Array<Similar>;
    /**
     * Nombre de médias similaires
     * @type {number}
     */
    nbSimilars: number;
    /**
     * Indique si le média se trouve sur le compte du membre connecté
     * @type {boolean}
     */
    in_account: boolean;
    /**
     * Identifiant du média servant pour l'URL
     * @type {string}
     */
    slug: string;

    protected __fetches: Record<string, Promise<any>>;

    /**
     * Constructeur de la classe Media
     * Le DOMElement est nécessaire que pour le média principal sur la page Web
     * @param   {Obj} data - Les données du média
     * @param   {JQuery<HTMLElement>} [element] - Le DOMElement de référence du média
     * @returns {Media}
     */
    constructor(data: Obj, element?: JQuery<HTMLElement>) {
        super(data);
        if (element)
            this.elt = element;
        this.__fetches = {};
        this.similars = [];
        this.genres = [];
        return this;
    }
    /**
     * Initialise l'objet lors de sa construction et après son remplissage
     * @returns {Promise<Media>}
     */
    public init(): Promise<this> {
        if (this.elt) {
            return super.init().then(() => {
                this._overrideProps();
                return this;
            });
        }
        return super.init();
    }
    updatePropRenderGenres(): void {
        const $genres = jQuery(Media.selectorsCSS.genres);
        if ($genres.length > 0) {
            $genres.text(this.genres.join(', '));
        }
        delete this.__changes.genres;
    }

    /**
     * Retourne les similars associés au media
     * @return {Promise<Media>}
     */
    fetchSimilars(): Promise<Media> {
        return new Promise(resolve => resolve(this));
    }

    /**
     * Retourne le similar correspondant à l'identifiant
     * @abstract
     * @param  {number} id      L'identifiant du similar
     * @return {Similar|void}   Le similar ou null
     */
    getSimilar(id: number): Similar {
        if (!this.similars) return null;
        for (let s = 0; s < this.similars.length; s++) {
            if (this.similars[s].id === id) {
                return this.similars[s];
            }
        }
        return null;
    }
    /**
     * override - Permet de surcharger des propriétés de l'objet, parmis celles autorisées,
     * et de stocker les nouvelles valeurs
     * @see Show.propsAllowedOverride
     * @param   {string} prop - Nom de la propriété à modifier
     * @param   {string} value - Nouvelle valeur de la propriété
     * @param   {object} [params] - Optional: paramètres à fournir pour modifier le path de la propriété
     * @returns {Promise<boolean>}
     */
    async override(prop: string, value: string, params?: object): Promise<boolean> {
        const type = (this.constructor as typeof Media);
        if (type.propsAllowedOverride[prop]) {
            const override = await UsBetaSeries.gm_funcs.getValue('override', {shows: {}, movies: {}});
            if (override[type.overrideType][this.id] === undefined) override[type.overrideType][this.id] = {};
            override[type.overrideType][this.id][prop] = value;
            let path = type.propsAllowedOverride[prop].path;
            if (type.propsAllowedOverride[prop].params) {
                override[type.overrideType][this.id][prop] = {value, params};
                path = UsBetaSeries.replaceParams(path, type.propsAllowedOverride[prop].params, params);
                console.log('override', {prop, value, params, path});
            }
            UsBetaSeries.setPropValue(this, path, value);
            await UsBetaSeries.gm_funcs.setValue('override', override);
            return true;
        }
        return false;
    }
    /**
     * _overrideProps - Permet de restaurer les valeurs personalisées dans l'objet
     * @see Show.propsAllowedOverride
     * @private
     * @returns {Promise<Media>}
     */
    async _overrideProps(): Promise<Media> {
        const type = (this.constructor as typeof Media);
        const overrideType = type.overrideType;
        const override = await UsBetaSeries.gm_funcs.getValue('override', {shows: {}, movies: {}});
        if (UsBetaSeries.debug) console.log('_overrideProps override', override);
        if (Reflect.has(override[overrideType], this.id)) {
            if (UsBetaSeries.debug) console.log('_overrideProps override found', override[overrideType][this.id]);
            for (const prop in override[overrideType][this.id]) {
                let path = type.propsAllowedOverride[prop].path;
                let value = override[overrideType][this.id][prop];
                if (type.propsAllowedOverride[prop].params && typeof override[overrideType][this.id][prop] === 'object') {
                    value = override[overrideType][this.id][prop].value;
                    const params = override[overrideType][this.id][prop].params;
                    path = UsBetaSeries.replaceParams(path, type.propsAllowedOverride[prop].params, params);
                }
                if (UsBetaSeries.debug) console.log('_overrideProps prop[%s]', prop, {path, value});
                UsBetaSeries.setPropValue(this, path, value);
            }
        }
        return this;
    }
    /**
     * Retourne l'URL de la page de la série à partir de son identifiant tvdb
     * @param   {number} tvdb_id - Identifiant TheTvDB
     * @returns {Promise<string>}
     */
    _getTvdbUrl(tvdb_id: number): Promise<string> {
        const proxy = UsBetaSeries.serverBaseUrl + '/proxy/';
        const initFetch: RequestInit = { // objet qui contient les paramètres de la requête
            method: 'GET',
            headers: {
                'origin': 'https://www.betaseries.com',
                'x-requested-with': '',
                'Accept': 'application/json'
            },
            mode: 'cors',
            cache: 'no-cache'
        };
        return new Promise((res, rej) => {
            fetch(`${proxy}?tab=series&id=${tvdb_id}`, initFetch)
            .then(res => {
                // console.log('_getTvdbUrl response', res);
                if (res.ok) {
                    return res.json();
                }
                return rej();
            }).then(data => {
                // console.log('_getTvdbUrl data', data);
                if (data) { res(data.url) } else { rej(); }
            });
        });
    }
}