import "reflect-metadata";
import { Obj, EventTypes } from "./Base";
import { Changes } from "./RenderHtml";
export declare function validateType(target: any, propertyKey: string, descriptor: PropertyDescriptor): void;
/********************************************************************************/
/********************************************************************************/
/**
 * AbstractDecorator - Classe abstraite des decorators
 * @class
 * @abstract
 */
export declare abstract class AbstractDecorator {
    static logger: import("./Debug").Debug;
    static debug: any;
    protected __target: any;
    constructor(target: any);
    get target(): any;
    set target(target: any);
}
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
export declare type fnEmitter = (event: CustomEvent, ...args: any[]) => void;
export declare type OnceEmitter = {
    fn: fnEmitter;
};
export interface implEmitterDecorator {
    hasListeners(event: EventTypes): boolean;
    on(event: EventTypes, fn: fnEmitter): implEmitterDecorator;
    off(event: EventTypes, fn?: fnEmitter): implEmitterDecorator;
    once(event: EventTypes, fn: fnEmitter): implEmitterDecorator;
    emit(event: EventTypes): implEmitterDecorator;
}
export declare class EmitterDecorator extends AbstractDecorator implements implEmitterDecorator {
    /**
     * Les fonctions callback
     * @type {Object.<string, fnEmitter[]>}
     */
    private __callbacks;
    /**
     * EmiiterDecorator
     * @param target - La classe implémentant l'interface implEmitterDecorator
     * @returns {EmitterDecorator}
     * @throws {Error}
     */
    constructor(target: implEmitterDecorator);
    /**
     * Check if this emitter has `event` handlers.
     *
     * @param {EventTypes} event
     * @return {Boolean}
     */
    hasListeners(event: EventTypes): boolean;
    /**
     * Listen on the given `event` with `fn`.
     * @param   {EventTypes} event - Le nom de l'évènement sur lequel déclenché le callback
     * @param   {fnEmitter} fn - La fonction callback
     * @returns {implEmitterDecorator}
     */
    on(event: EventTypes, fn: fnEmitter): implEmitterDecorator;
    /**
     * Remove the given callback for `event` or all
     * registered callbacks.
     *
     * @param {EventTypes} event
     * @param {fnEmitter} [fn]
     * @return {implEmitterDecorator}
     */
    off(event: EventTypes, fn?: fnEmitter): implEmitterDecorator;
    /**
     * Adds an `event` listener that will be invoked a single
     * time then automatically removed.
     *
     * @param {EventTypes} event
     * @param {fnEmitter} fn
     * @return {implEmitterDecorator}
     */
    once(event: EventTypes, fn: fnEmitter): implEmitterDecorator;
    /**
     * Emit `event` with the given args.
     *
     * @param {EventTypes} event
     * @param {...*} args
     * @return {implEmitterDecorator}
     */
    emit(event: EventTypes, ...args: any[]): implEmitterDecorator;
}
