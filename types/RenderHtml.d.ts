import { Base, Obj } from "./Base";
export declare type RelatedProp = {
    key: string;
    type: any;
    default?: any;
    transform?: (obj: object, data: Obj) => any;
};
export declare type Changes = {
    oldValue: any;
    newValue: any;
};
export interface implRenderHtml {
    fill(data: Obj): this;
    [Symbol.iterator](): object;
    toJSON(): object;
    _initRender(): this;
    updatePropRender(propKey: string): void;
    isModified(): boolean;
    getChanges(): Record<string, Changes>;
    hasChange(propKey: string): boolean;
    getChange(propKey: string): Changes;
    get elt(): JQuery<HTMLElement>;
    set elt(jElt: JQuery<HTMLElement>);
}
export declare abstract class RenderHtml extends Base implements implRenderHtml {
    static relatedProps: Record<string, RelatedProp>;
    static selectorsCSS: Record<string, string>;
    /**
     * @type {JQuery<HTMLElement>} Element HTML de référence du média
     */
    private __elt;
    /**
     * @type {boolean} Flag d'initialisation de l'objet, nécessaire pour les methodes fill and compare
     */
    protected __initial: boolean;
    /**
     * @type {Record<string, Changes} Stocke les changements des propriétés de l'objet
     */
    protected __changes: Record<string, Changes>;
    /**
     * @type {Array<string>} Tableau des propriétés énumerables de l'objet
     */
    protected __props: Array<string>;
    constructor(data: Obj, elt?: JQuery<HTMLElement>);
    /**
     * Symbol.Iterator - Methode Iterator pour les boucles for..of
     * @returns {object}
     */
    [Symbol.iterator](): object;
    /**
     * Retourne l'objet sous forme d'objet simple, sans référence circulaire,
     * pour la méthode JSON.stringify
     * @returns {object}
     */
    toJSON(): object;
    /**
     * Remplit l'objet avec les données fournit en paramètre
     * @param  {Obj} data - Les données provenant de l'API
     * @returns {Base}
     * @virtual
     */
    fill(data: Obj): this;
    /**
     * Initialise le rendu HTML de la saison
     * @returns {RenderHtml}
     */
    abstract _initRender(): this;
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
     * Indique si cet objet a été modifié
     * @returns {boolean}
     */
    isModified(): boolean;
    /**
     * Retourne les changements apportés à cet objet
     * @returns {Record<string, Changes>}
     */
    getChanges(): Record<string, Changes>;
    /**
     * Indique si la propriété passée en paramètre a été modifiée
     * @param   {string} propKey - La propriété ayant potentiellement été modifiée
     * @returns {boolean}
     */
    hasChange(propKey: string): boolean;
    /**
     * Retourne l'objet Changes correspondant aux changements apportés à la propriété passée en paramètre
     * @param   {string} propKey - La propriété ayant été modifiée
     * @returns {Changes} L'objet Changes correspondant aux changement
     */
    getChange(propKey: string): Changes;
    /**
     * Retourne le DOMElement de référence du média
     * @returns {JQuery<HTMLElement>} Le DOMElement jQuery
     */
    get elt(): JQuery<HTMLElement>;
    /**
     * Définit le DOMElement de référence du média\
     * Nécessaire **uniquement** pour le média principal de la page Web\
     * Il sert à mettre à jour les données du média sur la page Web
     * @param  {JQuery<HTMLElement>} elt - DOMElement auquel est rattaché le média
     */
    set elt(elt: JQuery<HTMLElement>);
}
