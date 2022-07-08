import { Obj, Callback } from "./Base";
import { MediaBase } from "./Media";
import { Changes } from "./RenderHtml";
export interface implAddNote {
    addVote(note: number): Promise<boolean>;
}
export declare class Note {
    /**
     * Nombre de votes
     * @type {number}
     */
    total: number;
    /**
     * Note moyenne du média
     * @type {number}
     */
    mean: number;
    /**
     * Note du membre connecté
     * @type {number}
     */
    user: number;
    /**
     * Media de référence
     * @type {Base}
     */
    _parent: MediaBase;
    private __initial;
    protected __changes: Record<string, Changes>;
    constructor(data: Obj, parent?: MediaBase);
    fill(data: Obj): Note;
    get parent(): MediaBase;
    set parent(parent: MediaBase);
    /**
     * Retourne la note moyenne sous forme de pourcentage
     * @returns {number} La note sous forme de pourcentage
     */
    getPercentage(): number;
    /**
     * Retourne l'objet Note sous forme de chaine
     * @returns {string}
     */
    toString(): string;
    /**
     * Retourne l'objet sous forme d'objet simple, sans référence circulaire,
     * pour la méthode JSON.stringify
     * @returns {object}
     */
    toJSON(): object;
    /**
     * Crée une popup avec 5 étoiles pour noter le média
     * @param {Callback} cb - Fonction callback
     */
    createPopupForVote(cb?: Callback): void;
    /**
     * Retourne le type d'étoile en fonction de la note et de l'indice
     * de comparaison
     * @param  {number} note   La note du media
     * @param  {number} indice L'indice de comparaison
     * @return {string}        Le type d'étoile
     */
    static getTypeSvg(note: number, indice: number): string;
    /**
     * Met à jour l'affichage de la note
     * @param   {JQuery<HTMLElement>} [$elt] - Element HTML contenant les étoiles représentant la note
     * @returns {Note}
     */
    updateStars($elt?: JQuery<HTMLElement>): Note;
    /**
     * Met à jour l'attribut title de l'élément HTML représentant la note
     * @param   {JQuery<HTMLElement>} [$elt] - Element HTML contenant les étoiles représentant la note
     * @returns {Note}
     */
    updateAttrTitle($elt?: JQuery<HTMLElement>): Note;
    /**
     * Retourne la template pour l'affichage d'une note sous forme d'étoiles
     * @param   {number} [note=0] - La note à afficher
     * @param   {string} [color] - La couleur des étoiles
     * @returns {string}
     */
    static renderStars(note?: number, color?: string): string;
}
