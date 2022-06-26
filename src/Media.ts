import {Base, Obj} from "./Base";
import {Similar} from "./Similar";

export abstract class Media extends Base {

    /***************************************************/
    /*                      STATIC                     */
    /***************************************************/

    static propsAllowedOverride: object = {};
    static overrideType: string;
    static selectorsCSS = {
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
     * @type {number} Nombre de membres ayant ce média sur leur compte
     */
    followers: number;
    /**
     * @type {Array<string>} Les genres attribués à ce média
     */
    genres: Array<string>;
    /**
     * @type {string} Identifiant IMDB
     */
    imdb_id: string;
    /**
     * @type {string} Langue originale du média
     */
    language: string;
    /**
     * @type {number} Durée du média en minutes
     */
    duration: number;
    /**
     * @type {string} Titre original du média
     */
    original_title: string;
    /**
     * @type {Array<Similar>} Tableau des médias similaires
     */
    similars: Array<Similar>;
    /**
     * @type {number} Nombre de médias similaires
     */
    nbSimilars: number;
    /**
     * @type {boolean} Indique si le média se trouve sur le compte du membre connecté
     */
    _in_account: boolean;
    /**
     * @type {string} slug - Identifiant du média servant pour l'URL
     */
    slug: string;

    /**
     * Constructeur de la classe Media
     * @param   {Obj} data - Les données du média
     * @param   {JQuery<HTMLElement>} [element] - Le DOMElement associé au média
     * @returns {Media}
     */
    constructor(data: Obj, element?: JQuery<HTMLElement>) {
        super(data);
        if (element)
            this.elt = element;
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

    /**
     * Remplit l'objet avec les données fournit en paramètre
     * @param  {Obj} data Les données provenant de l'API
     * @returns {Media}
     * @override
     */
    fill(data: Obj): this {
        return super.fill(data);
    }
    updatePropRenderGenres(): void {
        const $genres = jQuery(Media.selectorsCSS.genres);
        if ($genres.length > 0) {
            $genres.text(this.genres.join(', '));
        }
        delete this.__changes.genres;
    }
    /**
     * Indique si le média est enregistré sur le compte du membre
     * @returns {boolean}
     */
    public get in_account(): boolean {
        return this._in_account;
    }
    /**
     * Définit si le média est enregistré sur le compte du membre
     * @param {boolean} i Flag
     */
    public set in_account(i: boolean) {
        this._in_account = !!i;
        this.save();
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
            const override = await Base.gm_funcs.getValue('override', {shows: {}, movies: {}});
            if (override[type.overrideType][this.id] === undefined) override[type.overrideType][this.id] = {};
            override[type.overrideType][this.id][prop] = value;
            let path = type.propsAllowedOverride[prop].path;
            if (type.propsAllowedOverride[prop].params) {
                override[type.overrideType][this.id][prop] = {value, params};
                path = Base.replaceParams(path, type.propsAllowedOverride[prop].params, params);
                console.log('override', {prop, value, params, path});
            }
            Base.setPropValue(this, path, value);
            await Base.gm_funcs.setValue('override', override);
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
        const override = await Base.gm_funcs.getValue('override', {shows: {}, movies: {}});
        console.log('_overrideProps override', override);
        if (override[overrideType][this.id]) {
            console.log('_overrideProps override found', override[overrideType][this.id]);
            for (const prop in override[overrideType][this.id]) {
                let path = type.propsAllowedOverride[prop].path;
                let value = override[overrideType][this.id][prop];
                if (type.propsAllowedOverride[prop].params && typeof override[overrideType][this.id][prop] === 'object') {
                    value = override[overrideType][this.id][prop].value;
                    const params = override[overrideType][this.id][prop].params;
                    path = Base.replaceParams(path, type.propsAllowedOverride[prop].params, params);
                }
                console.log('_overrideProps prop[%s]', prop, {path, value});
                Base.setPropValue(this, path, value);
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
        const proxy = Base.serverBaseUrl + '/proxy/';
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