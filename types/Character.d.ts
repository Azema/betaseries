import { Obj } from "./Base";
import { implFillDecorator } from "./Decorators";
import { MediaType } from "./Media";
import { Changes, RelatedProp } from "./RenderHtml";
export declare class Character implements implFillDecorator {
    static relatedProps: Record<string, RelatedProp>;
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
    private __decorators;
    protected __elt: JQuery<HTMLElement>;
    __initial: boolean;
    __changes: Record<string, Changes>;
    __props: string[];
    person: Person;
    constructor(data: Obj);
    _initRender(): Character;
    get elt(): JQuery<HTMLElement>;
    set elt(elt: JQuery<HTMLElement>);
    /**
     * Remplit l'objet avec les données fournit en paramètre
     * @param   {Obj} data - Les données provenant de l'API
     * @returns {Character}
     */
    fill(data: Obj): this;
    /**
     * Met à jour le rendu HTML des propriétés de l'objet,
     * si un sélecteur CSS exite pour la propriété fournit en paramètre\
     * **Méthode appelée automatiquement par le setter de la propriété**
     * @see Show.selectorsCSS
     * @param   {string} propKey - La propriété de l'objet à mettre à jour
     * @returns {void}
     */
    updatePropRender(propKey: string): void;
    /**
     * Retourne l'objet sous forme d'objet simple, sans référence circulaire,
     * pour la méthode JSON.stringify
     * @returns {object}
     */
    toJSON(): object;
    fetchPerson(): Promise<Person | void>;
}
export declare class PersonMedia implements implFillDecorator {
    static relatedProps: Record<string, RelatedProp>;
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
    private __decorators;
    constructor(data: Obj);
    /**
     * Remplit l'objet avec les données fournit en paramètre
     * @param   {Obj} data - Les données provenant de l'API
     * @returns {Person}
     */
    fill(data: Obj): this;
    /**
     * Met à jour le rendu HTML des propriétés de l'objet,
     * si un sélecteur CSS exite pour la propriété fournit en paramètre\
     * **Méthode appelée automatiquement par le setter de la propriété**
     * @see Show.selectorsCSS
     * @param   {string} propKey - La propriété de l'objet à mettre à jour
     * @returns {void}
     */
    updatePropRender(propKey: string): void;
    /**
     * Retourne l'objet sous forme d'objet simple, sans référence circulaire,
     * pour la méthode JSON.stringify
     * @returns {object}
     */
    toJSON(): object;
}
export declare class PersonMedias {
    media: PersonMedia;
    role: string;
    type: MediaType;
    constructor(data: Obj, type: MediaType);
    /**
     * Retourne le lien absolu du média
     * @returns {string}
     */
    createLink(): string;
    /**
     * Retourne la représentation du média et de l'acteur
     * @returns {string}
     */
    getTemplate(): string;
}
export declare class Person implements implFillDecorator {
    static relatedProps: Record<string, RelatedProp>;
    static selectorsCSS: Record<string, string>;
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
    __initial: boolean;
    __changes: Record<string, Changes>;
    __props: string[];
    private __decorators;
    private __elt;
    constructor(data: Obj);
    _initRender(): Person;
    get elt(): JQuery<HTMLElement>;
    set elt(elt: JQuery<HTMLElement>);
    /**
     * Remplit l'objet avec les données fournit en paramètre
     * @param   {Obj} data - Les données provenant de l'API
     * @returns {Person}
     */
    fill(data: Obj): this;
    /**
     * Met à jour le rendu HTML des propriétés de l'objet,
     * si un sélecteur CSS exite pour la propriété fournit en paramètre\
     * **Méthode appelée automatiquement par le setter de la propriété**
     * @see Show.selectorsCSS
     * @param   {string} propKey - La propriété de l'objet à mettre à jour
     * @returns {void}
     */
    updatePropRender(propKey: string): void;
    /**
     * Retourne l'objet sous forme d'objet simple, sans référence circulaire,
     * pour la méthode JSON.stringify
     * @returns {object}
     */
    toJSON(): object;
}
