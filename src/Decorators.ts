import "reflect-metadata";
import { UsBetaSeries, isNull, Obj, EventTypes } from "./Base";
import { Changes, RelatedProp, RenderHtml } from "./RenderHtml";

/*
 *              Class Decorators
 *
 * type ClassDecorator = <TFunction extends Function>(target: TFunction) => TFunction | void;
 */

/*
 *              Property Decorators
 *
 * type PropertyDecorator = (target: Object, propertyKey: string | symbol) => void;
 */

/*
 *              Method Decorators
 *
 * Descriptor keys:
 *  - value
 *  - writable
 *  - enumerable
 *  - configurable
 *
 * type MethodDecorator = <T>(
 *   target: Object,
 *   propertyKey: string | symbol,
 *   descriptor: TypedPropertyDescriptor<T>
 * ) => TypedPropertyDescriptor<T> | void;
 */

/*
 *              Accessor Decorators
 *
 * Descriptor keys:
 *  - get
 *  - set
 *  - enumerable
 *  - configurable
 *
 * type MethodDecorator = <T>(
 *   target: Object,
 *   propertyKey: string | symbol,
 *   descriptor: TypedPropertyDescriptor<T>
 * ) => TypedPropertyDescriptor<T> | void;
 */
export function validateType(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const original = descriptor.set;
    const type = Reflect.getMetadata('design:type', target, propertyKey);

    descriptor.set = function (value: any) {
        if (! (value instanceof type)) {
            throw new TypeError(`Parameter type error. Required type: ${type.name}`);
        }
        return original.call(this, { ...value });
    }
}


/********************************************************************************/
/*                          Custom Decorators                                   */
/********************************************************************************/

/*
 *              Abstract Decorator
 */

/**
 * AbstractDecorator - Classe abstraite des decorators
 * @class
 * @abstract
 */
export abstract class AbstractDecorator {
    static logger = new UsBetaSeries.setDebug('Decorators');
    static debug = AbstractDecorator.logger.debug.bind(AbstractDecorator.logger);

    protected __target: any;

    constructor(target: any) {
        this.__target = target;
        return this;
    }

    get target() {
        return this.__target;
    }
    set target(target) {
        this.__target = target;
    }
}

/*
 *              Fill Decorator
 */

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
export class FillDecorator extends AbstractDecorator {

    /**
     * Constructor
     * @param   {implFillDecorator} target - La classe utilisant le décorateur
     * @returns {FillDecorator}
     */
    constructor(target: implFillDecorator) {
        super(target);
        return this;
    }

    /**
     * Remplit l'objet avec les données fournit en paramètre
     * @param   {Obj} data - Les données provenant de l'API
     * @returns {implFillDecorator}
     */
    fill(data: Obj): implFillDecorator {
        const self = this as unknown as implFillDecorator;
        const classStatic = self.constructor as typeof RenderHtml;
        if (typeof data !== 'object') {
            const err = new TypeError(classStatic.name + '.fill data is not an object: ' + typeof data);
            console.error(err);
            throw err;
        }
        // Check property static "relatedProps"
        if (!classStatic.relatedProps) {
            const err = new Error(classStatic.name + ".fill, property static 'relatedProp' are required");
            console.error(err);
            throw err;
        }

        const checkTypeValue = (target: any, key: string, type: any, value: any, relatedProp: RelatedProp): any => {
            // console.warn('FillDecorator.fill checkTypeValue', {key, type, value});
            const typeNV = typeof value;
            const oldValue = target['_' + key];
            const hasDefault = Reflect.has(relatedProp, 'default');
            const hasTransform = Reflect.has(relatedProp, 'transform');
            if (!isNull(value) && hasTransform && typeof relatedProp.transform === 'function') {
                value = relatedProp.transform(target, value);
            } else if (isNull(value) && hasDefault) {
                value = relatedProp.default;
            }
            if (isNull(oldValue) && isNull(value)) return undefined;
            let subType = null;
            if (typeof type === 'string' && /^array<\w+>$/.test(type)) {
                subType = type.match(/<(\w+)>$/)[1];
                type = 'array';
                AbstractDecorator.debug('FillDecorator.fill for (%s.%s) type: array - subType: %s', self.constructor.name, key, subType, value);
            }
            switch(type) {
                case 'string':
                    value = (! isNull(value)) ? String(value).trim() : hasDefault ? relatedProp.default : null;
                    if (oldValue === value) return undefined;
                    break;
                case 'number':
                    if (!isNull(value) && !hasTransform && typeNV === 'string') {
                        value = parseInt(value, 10);
                    }
                    else if (isNull(value) && hasDefault) {
                        value = relatedProp.default;
                    }
                    if (oldValue === value) return undefined;
                    break;
                case 'boolean':
                    switch(typeof value) {
                        case 'string':
                            if (value.toLowerCase() === 'true' || value === '1') {
                                value = true;
                            }
                            else if (value.toLowerCase() === 'false' || value === '1') {
                                value = false;
                            }
                            break;
                        case 'number':
                        default:
                            value = !!value;
                            break;
                    }
                    value = (typeof value === 'boolean') ? value : hasDefault ? relatedProp.default : null;
                    if (oldValue === value) return undefined;
                    break;
                case 'array': {
                    // console.log(`FillDecorator checkTypeValue array key(${key}) value(${JSON.stringify(value)})`);
                    if (!isNull(subType) && Array.isArray(value)) {
                        // console.log(`FillDecorator checkTypeValue array subtype(${subType})`);
                        const data = [];
                        let isClass = false;
                        if (UsBetaSeries.checkClassname(subType)) {
                            isClass = true;
                        }
                        // console.log(`FillDecorator checkTypeValue array subtype isClass(${isClass?'true':'false'})`);
                        for (let d = 0, _len = value.length; d < _len; d++) {
                            let subVal = value[d];
                            // console.log(`FillDecorator checkTypeValue array subVal(${JSON.stringify(subVal)})`);
                            if (isClass) subVal = UsBetaSeries.getInstance(subType, subVal);
                            data.push(subVal);
                        }
                        value = data;
                        // console.log(`FillDecorator checkTypeValue array new value(${JSON.stringify(value)})`);

                    } else {
                        if (self.__initial || !Array.isArray(oldValue)) return value;
                    }
                    let diff = false;
                    if (!oldValue) {
                        console.warn(`checkTypeValue array key(${key}) target ${JSON.stringify(target)}`);
                    }
                    if (oldValue) {
                        for (let i = 0, _len = oldValue.length; i < _len; i++) {
                            if (oldValue[i] !== value[i]) {
                                diff = true;
                                break;
                            }
                        }
                        if (!diff) return undefined;
                    } else {
                        return value;
                    }
                    break;
                }
                case 'date': {
                    if (typeof value === 'string' && value === '0000-00-00') {
                        return null;
                    }
                    if (typeNV !== 'number' && !(value instanceof Date) &&
                        (typeNV === 'string' && Number.isNaN(Date.parse(value))))
                    {
                        throw new TypeError(`Invalid value for key "${key}". Expected type (Date | Number | string) but got ${JSON.stringify(value)}`);
                    }
                    if (typeNV === 'number' || typeNV === 'string')
                        value = new Date(value);
                    if (oldValue instanceof Date && value.getTime() === oldValue.getTime()) {
                        return undefined;
                    }
                    break;
                }
                case 'object':
                default: {
                    if (typeNV === 'object' && type === 'object') {
                        value = (! isNull(value)) ? Object.assign({}, value) : hasDefault ? relatedProp.default : null;
                    }
                    else if (typeof type === 'function' && !isNull(value) && !(value instanceof type)) {
                        // if (BetaSeries.debug) AbstractDecorator.debug('FillDecorator.fill: type Function for [%s.%s]', classStatic.name, key, {type, value});
                        // value = Reflect.construct(type, [value]);
                        value = new (type)(value);
                        if (typeof value === 'object' && Reflect.has(value, 'parent')) {
                            value.parent = target;
                        }
                    }
                    if (self.__initial || isNull(oldValue)) return value;
                    let changed = false;
                    try {
                        // if (BetaSeries.debug) AbstractDecorator.debug('comparaison d\'objets', {typeOld: typeof oldValue, oldValue, typeNew: typeof value, value});
                        if (
                            (isNull(oldValue) && !isNull(value)) ||
                            (!isNull(oldValue) && isNull(value))
                        ) {
                            changed = true;
                        }
                        else if (typeof value === 'object' && !isNull(value)) {
                            if (JSON.stringify(oldValue) !== JSON.stringify(value)) {
                                AbstractDecorator.debug('compare objects with JSON.stringify and are differents', {oldValue, value});
                                changed = true;
                            }
                        }
                        if (!changed) return undefined;
                    } catch (err) {
                        console.warn('FillDecorator.fill => checkTypeValue: error setter[%s.%s]', target.constructor.name, key, {oldValue, value});
                        throw err;
                    }
                }
            }
            if (type === 'date') {
                type = Date;
            } else if (type === 'other' && hasTransform) {
                return value;
            }
            if ((typeof type === 'string' && typeof value !== type) ||
                (typeof type === 'function' && !(value instanceof type)))
            {
                throw new TypeError(`Invalid value for key "${target.constructor.name}.${key}". Expected type "${(typeof type === 'string') ? type : JSON.stringify(type)}" but got "${typeof value}" value: ${JSON.stringify(value)}`);
            }
            return value;
        }
        // AbstractDecorator.debug('FillDecorator.fill target: %s', self.constructor.name, data, (self.constructor as typeof RenderHtml).relatedProps);
        // On reinitialise les changements de l'objet
        self.__changes = {};
        for (const propKey in (self.constructor as typeof RenderHtml).relatedProps) {
            if (!Reflect.has(data, propKey)) continue;
            /** relatedProp contient les infos de la propriété @see RelatedProp */
            const relatedProp = (self.constructor as typeof RenderHtml).relatedProps[propKey];
            // dataProp contient les données provenant de l'API
            const dataProp = data[propKey];
            // Le descripteur de la propriété, utilisé lors de l'initialisation de l'objet
            let descriptor: PropertyDescriptor;
            if (self.__initial) {
                descriptor = {
                    configurable: true,
                    enumerable: true,
                    get: () => {
                        return self['_' + relatedProp.key];
                    },
                    set: (newValue: any) => {
                        // On vérifie le type et on modifie, si nécessaire, la valeur
                        // pour la rendre conforme au type définit (ex: number => Date or object => Note)
                        const value = checkTypeValue(self, relatedProp.key, relatedProp.type, newValue, relatedProp);
                        // Lors de l'initialisation, on set directement la valeur
                        if (self.__initial) {
                            self['_' + relatedProp.key] = value;
                            return;
                        }
                        // On récupère l'ancienne valeur pour identifier le changement
                        const oldValue = self['_' + relatedProp.key];
                        // Si value est undefined, alors pas de modification de valeur
                        if (value === undefined) {
                            // AbstractDecorator.debug('FillDecorator.fill setter[%s.%s] not changed', self.constructor.name, relatedProp.key, relatedProp.type, {newValue, oldValue, relatedProp});
                            return;
                        }
                        AbstractDecorator.debug('FillDecorator.fill setter[%s.%s] value changed', self.constructor.name, relatedProp.key, {type: relatedProp.type, newValue, oldValue, value, relatedProp});
                        // On set la nouvelle valeur
                        self['_' + relatedProp.key] = value;
                        // On stocke le changement de valeurs
                        self.__changes[relatedProp.key] = {oldValue, newValue};
                        // On appelle la methode de mise à jour du rendu HTML pour la propriété
                        this.updatePropRender(relatedProp.key);
                    }
                };
            }

            // if (BetaSeries.debug) AbstractDecorator.debug('FillDecorator.fill descriptor[%s.%s]', this.constructor.name, relatedProp.key, {relatedProp, dataProp, descriptor});
            // Lors de l'initialisation, on définit la propriété de l'objet
            // et on ajoute le nom de la propriété dans le tableau __props
            if (self.__initial) {
                Object.defineProperty(self, relatedProp.key, descriptor);
                self.__props.push(relatedProp.key);
            }
            // On set la valeur
            self[relatedProp.key] = dataProp;
        }
        // Fin de l'initialisation
        if (self.__initial) {
            self.__props.sort();
            self.__initial = false;
        }
        return self;
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
        const self = this as unknown as implFillDecorator;
        if (! self.elt || ! self.__props.includes(propKey)) return;
        const fnPropKey = 'updatePropRender' + propKey.camelCase().upperFirst();
        const classStatic = self.constructor as typeof RenderHtml;
        AbstractDecorator.debug('FillDecorator.updatePropRender(%s.%s)', classStatic.name, propKey, fnPropKey);
        if (Reflect.has(self, fnPropKey)) {
            AbstractDecorator.debug('FillDecorator.updatePropRender call method: %s.%s', classStatic.name, fnPropKey);
            self[fnPropKey]();
        }
        else if (classStatic.selectorsCSS && classStatic.selectorsCSS[propKey]) {
            AbstractDecorator.debug('FillDecorator.updatePropRender default method: class: %s - selector: %s', classStatic.name, classStatic.selectorsCSS[propKey]);
            const selectorCSS = classStatic.selectorsCSS[propKey];
            jQuery(selectorCSS, self.elt).text(self[propKey].toString());
            delete self.__changes[propKey];
        }
    }
}

/*
 *              Emitter Decorator
 */

export type fnEmitter = (event: CustomEvent, ...args: any[]) => void;
export type OnceEmitter = { fn: fnEmitter; };
export interface implEmitterDecorator {
    hasListeners(event: EventTypes): boolean;
    on(event: EventTypes, fn: fnEmitter): implEmitterDecorator;
    off(event: EventTypes, fn?: fnEmitter): implEmitterDecorator;
    once(event: EventTypes, fn: fnEmitter): implEmitterDecorator;
    emit(event: EventTypes): implEmitterDecorator;
}
export class EmitterDecorator extends AbstractDecorator implements implEmitterDecorator {
    /**
     * Les fonctions callback
     * @type {Object.<string, fnEmitter[]>}
     */
    private __callbacks: Record<string, Array<fnEmitter | OnceEmitter>>;

    /**
     * EmiiterDecorator
     * @param target - La classe implémentant l'interface implEmitterDecorator
     * @returns {EmitterDecorator}
     * @throws {Error}
     */
    constructor(target: implEmitterDecorator) {
        super(target);
        if (!Reflect.has(target.constructor, 'EventTypes')) {
            throw new Error(`Class: ${target.constructor.name} must have a static property "EventTypes"`);
        }
        this.__callbacks = {};
        return this;
    }

    /**
     * Check if this emitter has `event` handlers.
     *
     * @param {EventTypes} event
     * @return {Boolean}
     */
    hasListeners(event: EventTypes): boolean {
        return !! this.__callbacks[event].length;
    }

    /**
     * Listen on the given `event` with `fn`.
     * @param   {EventTypes} event - Le nom de l'évènement sur lequel déclenché le callback
     * @param   {fnEmitter} fn - La fonction callback
     * @returns {implEmitterDecorator}
     */
    on(event: EventTypes, fn: fnEmitter): implEmitterDecorator {
        //AbstractDecorator.debug('EmitterDecorator[%s] method(on) event %s', this.constructor.name, event);
        // On vérifie que le type d'event est pris en charge
        if ((this.target.constructor).EventTypes.indexOf(event) < 0) {
            throw new Error(`EmitterDecorator.on: ${event} ne fait pas partit des events gérés par la classe ${this.target.constructor.name}`);
        }
        this.__callbacks = this.__callbacks || {};
        this.__callbacks[event] = this.__callbacks[event] || [];
        for (const func of this.__callbacks[event]) {
            if (typeof func === 'function' && func.toString() == fn.toString()) return this.target;
        }
        this.__callbacks[event].push(fn);
        if (UsBetaSeries.debug)
            AbstractDecorator.debug('EmitterDecorator.on[%s] addEventListener on event %s', this.target.constructor.name, event, this.__callbacks[event]);
        return this.target;
    }

    /**
     * Remove the given callback for `event` or all
     * registered callbacks.
     *
     * @param {EventTypes} event
     * @param {fnEmitter} [fn]
     * @return {implEmitterDecorator}
     */
    off(event: EventTypes, fn?: fnEmitter): implEmitterDecorator {
        this.__callbacks = this.__callbacks || {};

        // all
        if (isNull(event) && isNull(fn)) {
            this.__callbacks = {};
            return this.target;
        }

        // specific event
        const callbacks = this.__callbacks[event];
        if (!callbacks) return this.target;

        // remove all handlers
        if (isNull(fn)) {
            delete this.__callbacks[event];
            return this.target;
        }

        // remove specific handler
        let cb: fnEmitter | OnceEmitter;
        for (let i = 0; i < callbacks.length; i++) {
            cb = callbacks[i];
            if (cb === fn || (cb as OnceEmitter).fn === fn) {
                callbacks.splice(i, 1);
                break;
            }
        }

        // Remove event specific arrays for event types that no
        // one is subscribed for to avoid memory leak.
        if (callbacks.length === 0) {
            delete this.__callbacks[event];
        }

        return this.target;
    }

    /**
     * Adds an `event` listener that will be invoked a single
     * time then automatically removed.
     *
     * @param {EventTypes} event
     * @param {fnEmitter} fn
     * @return {implEmitterDecorator}
     */
    once(event: EventTypes, fn: fnEmitter): implEmitterDecorator {
        /**
         * function that runs a single time
         * @param {...*} args
         */
        const on = (...args: any[]) => {
            AbstractDecorator.debug('EmiiterDecorator.once => on called');
            this.off(event, on); // delete callback when called (emit play with a copy of callbacks)
            // args.unshift(new CustomEvent('betaseries', { detail: { event }}));
            fn.apply(this.target, args);
        }

        on.fn = fn;
        this.on(event, on);
        return this.target;
    }

    /**
     * Emit `event` with the given args.
     *
     * @param {EventTypes} event
     * @param {...*} args
     * @return {implEmitterDecorator}
     */
    emit(event: EventTypes, ...args: any[]): implEmitterDecorator {
        if (UsBetaSeries.debug)
            AbstractDecorator.debug('EmiiterDecorator.emit[%s] call Listeners of event %s', this.target.constructor.name, event, this.__callbacks);
        this.__callbacks = this.__callbacks || {};

        let callbacks = this.__callbacks[event];

        if (callbacks) {
            args.unshift(new CustomEvent('betaseries', { detail: { event }}));
            callbacks = callbacks.slice(0); // copy of callbacks (see: EmitterDecorator.once)
            for (let i = 0, len = callbacks.length; i < len; ++i) {
                (callbacks[i] as fnEmitter).apply(this.target, args);
            }
        }

        return this.target;
    }

}