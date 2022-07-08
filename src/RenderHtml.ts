import { Base, Obj } from "./Base";
import { AbstractDecorator, FillDecorator, implFillDecorator } from "./Decorators";

/**
 * RelatedProp
 * @memberof RenderHtml
 * @alias RelatedProp
 */
export type RelatedProp = {
    /** @type {string} */
    key: string; // Nom de la propriété dans l'objet
    /** @type {*} */
    type: any; // type de donnée
    /** @type {*} */
    default?: any; // valeur par défaut
    /** @type {(ob: object, data: Obj) => *} */
    transform?: (obj: object, data: Obj) => any; // Fonction de transformation de la donnée
}
/**
 * Changes
 * @memberof RenderHtml
 * @alias Changes
 */
export type Changes = {
    oldValue: any;
    newValue: any;
}
/**
 * implRenderHtml
 * @interface implRenderHtml
 */
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

/**
 * RenderHtml - Classe abstraite des éléments ayant un rendu HTML sur la page Web
 * @class
 * @abstract
 * @extends Base
 * @implements {implRenderHtml}
 * @implements {implFillDecorator}
 */
export abstract class RenderHtml extends Base implements implRenderHtml, implFillDecorator {

    static relatedProps: Record<string, RelatedProp> = {};
    static selectorsCSS: Record<string, string> = {};

    /**
     * Decorators de la classe
     * @type {Object.<string, AbstractDecorator>}
     */
    private __decorators: Record<string, AbstractDecorator> = {
        fill: new FillDecorator(this)
    };
    /**
     * Element HTML de référence du média
     * @type {JQuery<HTMLElement>}
     */
    private __elt: JQuery<HTMLElement>;
    /**
     * Flag d'initialisation de l'objet, nécessaire pour les methodes fill and compare
     * @type {boolean}
     */
    public __initial = true;
     /**
      * Stocke les changements des propriétés de l'objet
      * @type {Object.<string, Changes>}
      */
    public __changes: Record<string, Changes> = {};
    /**
     * Tableau des propriétés énumerables de l'objet
     * @type {Array<string>}
     */
    public __props: Array<string> = [];

    /*
                    METHODS
    */
    constructor(data: Obj, elt?: JQuery<HTMLElement>) {
        super(data);
        if (elt) this.__elt = elt;
        this.__initial = true;
        this.__changes = {};
        this.__props = [];
        return this;
    }

    /**
     * Symbol.Iterator - Methode Iterator pour les boucles for..of
     * @returns {object}
     */
    [Symbol.iterator](): object {
        const self = this;
        return {
            pos: 0,
            props: self.__props,
            next(): IteratorResult<any> {
                if (this.pos < this.props.length) {
                    const item = {value: this.props[this.pos], done: false};
                    this.pos++;
                    return item;
                } else {
                    this.pos = 0;
                    return {value: null, done: true};
                }
            }
        }
    }

    /**
     * Remplit l'objet avec les données fournit en paramètre
     * @param   {Obj} data - Les données provenant de l'API
     * @returns {RenderHtml}
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

    /**
     * Initialise le rendu HTML de la saison
     * @returns {RenderHtml}
     */
    abstract _initRender(): this;

    /**
     * Indique si cet objet a été modifié
     * @returns {boolean}
     */
    isModified(): boolean {
        return Object.keys(this.__changes).length > 0;
    }
    /**
     * Retourne les changements apportés à cet objet
     * @returns {Record<string, Changes>}
     */
    getChanges(): Record<string, Changes> {
        return this.__changes;
    }
    /**
     * Indique si la propriété passée en paramètre a été modifiée
     * @param   {string} propKey - La propriété ayant potentiellement été modifiée
     * @returns {boolean}
     */
    hasChange(propKey: string): boolean {
        if (! this.__props.includes(propKey)) {
            throw new Error(`Property[${propKey}] not exists in this object(${this.constructor.name})`);
        }
        return Reflect.has(this.__changes, propKey);
    }
    /**
     * Retourne l'objet Changes correspondant aux changements apportés à la propriété passée en paramètre
     * @param   {string} propKey - La propriété ayant été modifiée
     * @returns {Changes} L'objet Changes correspondant aux changement
     */
    getChange(propKey: string): Changes {
        if (! this.__props.includes(propKey)) {
            throw new Error(`Property[${propKey}] not exists in this object(${this.constructor.name})`);
        }
        return this.__changes[propKey];
    }
    /**
     * Retourne le DOMElement de référence du média
     * @returns {JQuery<HTMLElement>} Le DOMElement jQuery
     */
    get elt(): JQuery<HTMLElement> {
        return this.__elt;
    }
    /**
     * Définit le DOMElement de référence du média\
     * Nécessaire **uniquement** pour le média principal de la page Web\
     * Il sert à mettre à jour les données du média sur la page Web
     * @param  {JQuery<HTMLElement>} elt - DOMElement auquel est rattaché le média
     */
    set elt(elt: JQuery<HTMLElement>) {
        this.__elt = elt;
    }
}