import { Base, UsBetaSeries, HTTP_VERBS, Obj } from "./Base";
import { Media, MediaType } from "./Media";
import { Movie } from "./Movie";
import { Show } from "./Show";

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
    }
}

export class personMedia {
    show?: Show;
    movie?: Movie;
    role: string;
    type: MediaType;
    constructor(data: Obj, type: MediaType) {
        if (type === MediaType.show) {
            this.show = new Show(data.show);
        } else if (type === MediaType.movie) {
            this.movie = new Movie(data.movie);
        }
        this.role = data.name;
        this.type = type;
    }
    get media(): Media {
        if (this.type === MediaType.show) {
            return this.show;
        } else if (this.type === MediaType.movie) {
            return this.movie;
        }
    }
}

export class Person {
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
     * @type {personMedia}
     */
    last: personMedia;
    /**
     * Tableau des séries dans lesquelles à joué l'acteur
     * @type {Array<personMedia>}
     */
    shows: Array<personMedia>;
    /**
     * Tableau des films dans lesquels a joué l'acteur
     * @type {Array<personMedia>}
     */
    movies: Array<personMedia>;

    constructor(data: Obj) {
        this.id = (data.id !== undefined) ? parseInt(data.id, 10) : 0;
        this.name = data.name || '';
        this.birthday = data.birthday ? new Date(data.birthday) : null;
        this.deathday = data.deathday ? new Date(data.deathday) : null;
        this.description = data.description || '';
        this.shows = [];
        for (let s = 0; s < data.shows.length; s++) {
            this.shows.push(new personMedia(data.shows[s], MediaType.show));
        }
        this.movies = [];
        for (let m = 0; m < data.movies.length; m++) {
            this.movies.push(new personMedia(data.movies[m], MediaType.movie));
        }
        if (data.last?.show) {
            this.last = new personMedia(data.last, MediaType.show);
        } else if (data.last?.movie) {
            this.last = new personMedia(data.last, MediaType.movie);
        }
    }
}