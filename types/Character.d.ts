import { MediaType, Obj } from "./Base";
import { Media } from "./Media";
import { Movie } from "./Movie";
import { Show } from "./Show";
export declare class Character {
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
    constructor(data: Obj);
}
