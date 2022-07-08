import { UsBetaSeries, HTTP_VERBS, Obj } from "./Base";
import { AbstractDecorator, FillDecorator, implFillDecorator } from "./Decorators";
import { MediaType } from "./Media";
import { Changes, RelatedProp } from "./RenderHtml";

export class Character {
    /**
     * Nom de l'acteur/actrice
     * @type {string}
     */
    actor: string;
    /**
     * Description du rôle
     * @type {string}
     */
    description: string;
    /**
     * Invité ?
     * @type {boolean}
     */
    guest: boolean;
    /**
     * Identifiant de l'acteur
     * @type {number}
     */
    id: number;
    /**
     * Nom du personnage
     * @type {string}
     */
    name: string;
    /**
     * URL de l'image du personnage
     * @type {string}
     */
    picture: string;
    /**
     * Type de rôle du personnage dans le média
     * @type {string}
     */
    role: string;
    /**
     * Identifiant de la série
     * @type {number}
     */
    show_id: number;
    /**
     * Identifiant du film
     * @type {number}
     */
    movie_id: number;
    /**
     * Identifiant de l'objet Person correspondant à l'acteur
     * @type {number}
     */
    person_id: number;

    protected __elt: JQuery<HTMLElement>;

    person: Person;

    constructor(data: Obj) {
        this.actor = data.actor || '';
        this.picture = data.picture || '';
        this.name = data.name || '';
        this.guest = !!data.guest || false;
        this.id = (data.id !== undefined) ? parseInt(data.id, 10) : 0;
        this.description = data.description || '';
        this.role = data.role || '';
        this.show_id = (data.show_id !== undefined) ? parseInt(data.show_id, 10) : 0;
        this.movie_id = (data.movie_id !== undefined) ? parseInt(data.movie_id, 10) : 0;
        this.person_id = (data.person_id !== undefined) ? parseInt(data.person_id, 10) : 0;
        return this._initRender();
    }

    _initRender(): Character {
        if (!this.elt) {
            const self = this;
            const $actors = jQuery('#actors .slides_flex .slide_flex');
            $actors.each((_, elt) => {
                const title = jQuery('.slide__title', elt).text().trim();
                if (title == this.actor) {
                    if (UsBetaSeries.debug) console.log('Character._initRender: actor found', {actor: this.actor, title});
                    self.elt = jQuery(elt);
                    self.elt.attr('data-person-id', this.person_id);
                    return false;
                }
            });
        }
        return this;
    }
    get elt(): JQuery<HTMLElement> {
        return this.__elt;
    }
    set elt(elt: JQuery<HTMLElement>) {
        this.__elt = elt;
    }
    public fetchPerson(): Promise<Person | void> {
        return Person.fetch(this.person_id)
        .then((person: Person) => {
            if (person instanceof Person) {
                this.person = person;
            }
            return this.person;
        }).catch(err => {
            console.error('Character.fetchPerson error: ', err);
            return null;
        });
    }
}
export class PersonMedia implements implFillDecorator {
    static relatedProps: Record<string, RelatedProp> = {
        "id": {key: "id", type: 'number'},
        "thetvdb_id": {key: "thetvdb_id", type: 'number'},
        "imdb_id": {key: "imdb_id", type: 'string'},
        "themoviedb_id": {key: "tmdb_id", type: 'number'},
        "tmdb_id": {key: "tmdb_id", type: 'number'},
        "title": {key: "title", type: 'string'},
        "seasons": {key: "seasons", type: 'number'},
        "episodes": {key: "episodes", type: 'number'},
        "followers": {key: "followers", type: 'number'},
        "creation": {key: "creation", type: 'number'},
        "production_year": {key: "creation", type: 'number'},
        "slug": {key: "slug", type: 'string'},
        "url": {key: "slug", type: 'string'},
        "poster": {key: "poster", type: 'string'},
    };

    id: number;
    thetvdb_id?: number;
    imdb_id: string;
    tmdb_id?: number;
    title: string;
    seasons?: number;
    episodes?: number;
    followers: number;
    creation: number;
    slug: string;
    poster: string;

    __initial: boolean;
    __changes: Record<string, Changes>;
    __props: string[];
    elt: JQuery<HTMLElement>;
    private __decorators: Record<string, AbstractDecorator> = {
        "fill": new FillDecorator(this)
    };

    constructor(data: Obj) {
        this.fill(data);
    }

    /**
     * Remplit l'objet avec les données fournit en paramètre
     * @param   {Obj} data - Les données provenant de l'API
     * @returns {Person}
     */
    public fill(data: Obj): this {
        try {
            return (this.__decorators.fill as FillDecorator).fill.call(this, data);
        } catch (err) {
            console.error(err);
        }
    }

    /**
     * Met à jour le rendu HTML des propriétés de l'objet,
     * si un sélecteur CSS exite pour la propriété fournit en paramètre\
     * **Méthode appelée automatiquement par le setter de la propriété**
     * @see Show.selectorsCSS
     * @param   {string} propKey - La propriété de l'objet à mettre à jour
     * @returns {void}
     */
    updatePropRender(propKey: string): void {
        try {
            (this.__decorators.fill as FillDecorator).updatePropRender.call(this, propKey);
        } catch (err) {
            console.error(err);
        }
    }

    /**
     * Retourne l'objet sous forme d'objet simple, sans référence circulaire,
     * pour la méthode JSON.stringify
     * @returns {object}
     */
    toJSON(): object {
        const obj: object = {};
        for (const key of this.__props) {
            obj[key] = this[key];
        }
        return obj;
    }
}
export class PersonMedias {
    media: PersonMedia;
    role: string;
    type: MediaType;
    constructor(data: Obj, type: MediaType) {
        if (type === MediaType.show) {
            this.media = new PersonMedia(data.show);
        } else if (type === MediaType.movie) {
            this.media = new PersonMedia(data.movie);
        }
        this.role = data.name;
        this.type = type;
    }
    /**
     * Retourne le lien absolu du média
     * @returns {string}
     */
    createLink(): string {
        let link = `https://www.betaseries.com/`;
        if (this.type === MediaType.show) {
            link += 'serie/';
        } else if (this.type === MediaType.movie) {
            link += 'film/';
        }
        link += this.media.slug;
        return link;
    }
    /**
     * Retourne la représentation du média et de l'acteur
     * @returns {string}
     */
    getTemplate(): string {
        return `<div class="card" style="width: 18rem;">
            <img data-src="${this.media.poster}" alt="Affiche" class="js-lazy-image img-thumbnail card-img-top"/>
            <div class="card-body">
                <h5 class="card-title">(${this.media.creation}) ${this.media.title}</h5>
                <p class="card-text"><u>Personnage:</u> ${this.role}</p>
                <a href="${this.createLink()}" target="_blank" class="btn btn-primary">Voir la fiche ${this.type === MediaType.show ? 'de la série' : 'du film'}</a>
            </div>
        </div>`;
    }
}

export class Person implements implFillDecorator {
    static relatedProps: Record<string, RelatedProp> = {
        "id": {key: "id", type: 'number'},
        "name": {key: "name", type: 'string'},
        "birthday": {key: "birthday", type: 'date'},
        "deathday": {key: "deathday", type: 'date'},
        "description": {key: "description", type: 'string'},
        "shows": {key: "shows", type: 'other', default: [], transform(obj: Person, data: Obj) {
            if (Array.isArray(obj.shows) && obj.shows.length === data.length) {
                return obj.shows;
            }
            const shows = [];
            for (let s = 0, _len = data.length; s < _len; s++) {
                shows.push(new PersonMedias(data[s], MediaType.show));
            }
            return shows;
        }},
        "movies": {key: "movies", type: 'other', default: [], transform(obj: Person, data: Obj) {
            if (Array.isArray(obj.movies) && obj.movies.length === data.length) {
                return obj.movies;
            }
            const movies = [];
            for (let s = 0, _len = data.length; s < _len; s++) {
                movies.push(new PersonMedias(data[s], MediaType.movie));
            }
            return movies;
        }},
        "last": {key: "last", type: PersonMedias, transform(obj, data) {
            if (data instanceof PersonMedias) return data;
            if (data && data.show) {
                return new PersonMedias(data, MediaType.show);
            } else if (data && data.movie) {
                return new PersonMedias(data, MediaType.movie);
            }
            return null;
        }}
    };
    static selectorsCSS: Record<string, string> = {
        "name": ".slide__title"
    };
    /**
     * Récupère les données d'un acteur à partir de son identifiant et retourne un objet Person
     * @param   {number} personId - L'identifiant de l'acteur / actrice
     * @returns {Promise<Person | null>}
     */
    static fetch(personId: number): Promise<Person | null> {
        return UsBetaSeries.callApi(HTTP_VERBS.GET, 'persons', 'person', {id: personId})
        .then(data => { return data ? new Person(data.person) : null });
    }
    /**
     * Identifiant de l'acteur / actrice
     * @type {number}
     */
    id: number;
    /**
     * Nom de l'acteur
     * @type {string}
     */
    name: string;
    /**
     * Date de naissance
     * @type {Date}
     */
    birthday: Date;
    /**
     * Date de décès
     * @type {Date}
     */
    deathday: Date;
    /**
     * Description
     * @type {string}
     */
    description: string;
    /**
     * Dernier média enregistré sur BetaSeries
     * @type {PersonMedias}
     */
    last: PersonMedias;
    /**
     * Tableau des séries dans lesquelles à joué l'acteur
     * @type {Array<PersonMedias>}
     */
    shows: Array<PersonMedias>;
    /**
     * Tableau des films dans lesquels a joué l'acteur
     * @type {Array<PersonMedias>}
     */
    movies: Array<PersonMedias>;

    public __initial = true;
    public __changes: Record<string, Changes> = {};
    public __props: string[] = [];

    private __decorators: Record<string, AbstractDecorator> = {
        "fill": new FillDecorator(this)
    };
    private __elt: JQuery<HTMLElement>;

    constructor(data: Obj) {
        return this.fill(data)._initRender();
    }

    public _initRender(): Person {
        if (!this.elt) return this;
    }

    get elt(): JQuery<HTMLElement> {
        return this.__elt;
    }
    set elt(elt: JQuery<HTMLElement>) {
        this.__elt = elt;
    }

    /**
     * Remplit l'objet avec les données fournit en paramètre
     * @param   {Obj} data - Les données provenant de l'API
     * @returns {Person}
     */
    public fill(data: Obj): this {
        try {
            return (this.__decorators.fill as FillDecorator).fill.call(this, data);
        } catch (err) {
            console.error(err);
        }
    }

    /**
     * Met à jour le rendu HTML des propriétés de l'objet,
     * si un sélecteur CSS exite pour la propriété fournit en paramètre\
     * **Méthode appelée automatiquement par le setter de la propriété**
     * @see Show.selectorsCSS
     * @param   {string} propKey - La propriété de l'objet à mettre à jour
     * @returns {void}
     */
    updatePropRender(propKey: string): void {
        try {
            (this.__decorators.fill as FillDecorator).updatePropRender.call(this, propKey);
        } catch (err) {
            console.error(err);
        }
    }

    /**
     * Retourne l'objet sous forme d'objet simple, sans référence circulaire,
     * pour la méthode JSON.stringify
     * @returns {object}
     */
    toJSON(): object {
        const obj: object = {};
        for (const key of this.__props) {
            obj[key] = this[key];
        }
        return obj;
    }
}