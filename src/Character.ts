import { UsBetaSeries, HTTP_VERBS, Obj } from "./Base";
import { AbstractDecorator, FillDecorator, implFillDecorator } from "./Decorators";
import { MediaType } from "./Media";
import { Changes, RelatedProp } from "./RenderHtml";

export class Character implements implFillDecorator {
    static logger = new UsBetaSeries.setDebug('Character');
    static debug = Character.logger.debug.bind(Character.logger);

    static relatedProps: Record<string, RelatedProp> = {
        "actor": {key: "actor", type: 'string'},
        // "description": {key: "description", type: 'string'},
        // "guest": {key: "guest", type: 'boolean', default: false},
        // "id": {key: "id", type: 'number'},
        "name": {key: "name", type: 'string'},
        "picture": {key: "picture", type: 'string'},
        // "role": {key: "role", type: 'string'},
        "show_id": {key: "show_id", type: 'number'},
        "movie_id": {key: "movie_id", type: 'number'},
        "person_id": {key: "person_id", type: 'number'}
    };

    /**
     * Nom de l'acteur/actrice
     * @type {string}
     */
    actor: string;
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

    private __decorators: Record<string, AbstractDecorator> = {
        fill: new FillDecorator(this)
    }
    protected __elt: JQuery<HTMLElement>;
    __initial = true;
    __changes: Record<string, Changes> = {};
    __props: string[] = [];

    person: Person;

    constructor(data: Obj) {
        return this.fill(data)._initRender();
    }

    _initRender(): Character {
        if (!this.elt) {
            const self = this;
            const $actors = jQuery('#actors .slides_flex .slide_flex');
            $actors.each((_, elt) => {
                let title = jQuery('.slide__title', elt).text().trim();
                if (/&nbsp;/g.test(title)) {
                    title = title.replace(/&nbsp;/g, '');
                }
                if (title == this.actor) {
                    Character.debug('Character._initRender: actor found', {actor: this.actor, title});
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

    /**
     * Remplit l'objet avec les données fournit en paramètre
     * @param   {Obj} data - Les données provenant de l'API
     * @returns {Character}
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
        return UsBetaSeries.generateRoute(this.type, this.media);
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
    static logger = new UsBetaSeries.setDebug('Person');
    static debug = Character.logger.debug.bind(Character.logger);

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