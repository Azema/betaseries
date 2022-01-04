import {Base, Obj} from "./Base";
import {Similar} from "./Similar";

export abstract class Media extends Base {

    followers: number;
    genres: Array<string>;
    imdb_id: string;
    language: string;
    length: number;
    original_title: string;
    similars: Array<Similar>;
    nbSimilars: number;
    _in_account: boolean;

    constructor(data: Obj) {
        super(data);
        return this;
    }

    /**
     * Remplit l'objet avec les données fournit en paramètre
     * @param  {Obj} data Les données provenant de l'API
     * @returns {Media}
     * @override
     */
    fill(data: Obj): this {
        this.followers = parseInt(data.followers, 10);
        this.imdb_id = data.imdb_id;
        this.language = data.language;
        this.length = parseInt(data.length, 10);
        this.original_title = data.original_title;
        if (!this.similars || this.similars.length <= 0) {
            this.similars = new Array();
        }
        this.nbSimilars = 0;
        if (data.similars && data.similars instanceof Array) {
            this.similars = data.similars;
            this.nbSimilars = this.similars.length;
        } else if (data.similars) {
            this.nbSimilars = parseInt(data.similars);
        }
        this.genres = new Array();
        if (data.genres && data.genres instanceof Array) {
            this.genres = data.genres;
        } else if (data.genres instanceof Object) {
            for (let g in data.genres) {
                this.genres.push(data.genres[g]);
            }
        }
        this.in_account = data.in_account;
        super.fill(data);
        return this;
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
}