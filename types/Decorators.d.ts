import "reflect-metadata";
import { Obj } from "./Base";
import { Changes } from "./RenderHtml";
export declare function validateType(target: any, propertyKey: string, descriptor: PropertyDescriptor): void;
/**
 * implFillDecorator
 * @interface implFillDecorator
 */
export interface implFillDecorator {
    __initial: boolean;
    __changes: Record<string, Changes>;
    __props: Array<string>;
    elt: JQuery<HTMLElement>;
    fill(data: Obj): implFillDecorator;
    updatePropRender(propKey: string): void;
    toJSON(): object;
}
/**
 * AbstractDecorator - Classe abstraite des decorators
 * @class
 * @abstract
 */
export declare abstract class AbstractDecorator {
    protected __target: any;
    constructor(target: any);
    get target(): any;
    set target(target: any);
}
/**
 * Classe FillDecorator permet d'ajouter des méthodes à d'autres classes
 * Ces méthodes servent à peupler un objet de classe
 * @class
 * @extends AbstractDecorator
 */
export declare class FillDecorator extends AbstractDecorator {
    /**
     * Constructor
     * @param   {implFillDecorator} target - La classe utilisant le décorateur
     * @returns {FillDecorator}
     */
    constructor(target: implFillDecorator);
    /**
     * Remplit l'objet avec les données fournit en paramètre
     * @param   {Obj} data - Les données provenant de l'API
     * @returns {implFillDecorator}
     */
    fill(data: Obj): implFillDecorator;
    /**
     * Met à jour le rendu HTML des propriétés de l'objet,
     * si un sélecteur CSS exite pour la propriété fournit en paramètre\
     * **Méthode appelée automatiquement par le setter de la propriété**
     * @see Show.selectorsCSS
     * @param   {string} propKey - La propriété de l'objet à mettre à jour
     * @returns {void}
     */
    updatePropRender(propKey: string): void;
}
