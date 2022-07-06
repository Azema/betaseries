import { Base, HTTP_VERBS, Obj } from "./Base";
import { Media, MediaType } from "./Media";
import { Movie } from "./Movie";
import { Show } from "./Show";

export class Character {
    /**
     * @type {string} Nom de l'acteur/actrice
     */
    actor: string;
    /**
     * @type {string} Description du rôle
     */
    description: string;
    /**
     * @type {boolean} Invité ?
     */
    guest: boolean;
    /**
     * @type {number} Identifiant de l'acteur
     */
    id: number;
    /**
     * @type {string} Nom du personnage
     */
    name: string;
    /**
     * @type {string} URL de l'image du personnage
     */
    picture: string;
    /**
     * @type {string} Type de rôle du personnage dans le média
     */
    role: string;
    /**
     * @type {number} Identifiant de la série
     */
    show_id: number;
    /**
     * @type {number} Identifiant du film
     */
    movie_id: number;
    /**
     * @type {number} Identifiant de l'objet Person correspondant à l'acteur
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
        return Base.callApi(HTTP_VERBS.GET, 'persons', 'person', {id: personId})
        .then(data => { return data ? new Person(data.person) : null });
    }
    /**
     * @type {number} Identifiant de l'acteur / actrice
     */
    id: number;
    /**
     * @type {string} Nom de l'acteur
     */
    name: string;
    /**
     * @type {Date} Date de naissance
     */
    birthday: Date;
    /**
     * @type {Date} Date de décès
     */
    deathday: Date;
    /**
     * @type {string} Description
     */
    description: string;
    /**
     * @type {personMedia} Dernier média enregistré sur BetaSeries
     */
    last: personMedia;
    /**
     * @type {Array<personMedia>} Tableau des séries dans lesquelles à joué l'acteur
     */
    shows: Array<personMedia>;
    /**
     * @type {Array<personMedia>} Tableau des films dans lesquels a joué l'acteur
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