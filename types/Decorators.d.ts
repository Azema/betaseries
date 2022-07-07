import "reflect-metadata";
import { Obj } from "./Base";
import { Changes } from "./RenderHtml";
export declare function validateType(target: any, propertyKey: string, descriptor: PropertyDescriptor): void;
export interface implFillDecorator {
    __initial: boolean;
    __changes: Record<string, Changes>;
    __props: Array<string>;
    elt: JQuery<HTMLElement>;
    fill(data: Obj): implFillDecorator;
    updatePropRender(propKey: string): void;
    toJSON(): object;
}
export declare abstract class AbstractDecorator {
    protected __target: implFillDecorator;
    constructor(target: implFillDecorator);
    get target(): implFillDecorator;
    set target(target: implFillDecorator);
}
export declare class FillDecorator extends AbstractDecorator {
    constructor(target: implFillDecorator);
    /**
     * Remplit l'objet avec les données fournit en paramètre
     * @param  {Obj} data - Les données provenant de l'API
     * @returns {implFillDecorator}
     * @virtual
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
