import { Obj } from "./Base";
import { Media, MediaType } from "./Media";
import { Movie } from "./Movie";
import { Show } from "./Show";
export declare class Character {
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
    constructor(data: Obj);
}
export declare class personMedia {
    show?: Show;
    movie?: Movie;
    role: string;
    type: MediaType;
    constructor(data: Obj, type: MediaType);
    get media(): Media;
}
export declare class Person {
    /**
     * Récupère les données d'un acteur à partir de son identifiant et retourne un objet Person
     * @param   {number} personId - L'identifiant de l'acteur / actrice
     * @returns {Promise<Person | null>}
     */
    static fetch(personId: number): Promise<Person | null>;
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
    constructor(data: Obj);
}
