import "reflect-metadata";
import { UsBetaSeries, isNull, Obj } from "./Base";
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
export abstract class AbstractDecorator {
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
            }
            if (isNull(oldValue) && isNull(value)) return undefined;
            let subType = null;
            if (typeof type === 'string' && /^array<\w+>$/.test(type)) {
                subType = type.match(/<(\w+)>$/)[1];
                if (UsBetaSeries.debug) console.log('FillDecorator.fill for (%s.%s) type: array - subType: %s', self.constructor.name, key, subType, value);
            }
            switch(type) {
                case 'string':
                    value = (! isNull(value)) ? String(value) : hasDefault ? relatedProp.default : null;
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
                    value = (typeNV === 'boolean') ? value : hasDefault ? relatedProp.default : null;
                    if (oldValue === value) return undefined;
                    break;
                case 'array': {
                    if (!isNull(subType) && Array.isArray(value)) {
                        const data = [];
                        let isClass = false;
                        if (UsBetaSeries.checkClassname(subType)) {
                            isClass = true;
                        }
                        for (let d = 0, _len = value.length; d < _len; d++) {
                            let subVal = value[d];
                            if (isClass) subVal = UsBetaSeries.getInstance(subType, [value[d]]);
                            data.push(subVal);
                        }
                        value = data;
                    } else {
                        if (self.__initial || !Array.isArray(oldValue)) return value;
                    }
                    let diff = false;
                    for (let i = 0, _len = oldValue.length; i < _len; i++) {
                        if (oldValue[i] !== value[i]) {
                            diff = true;
                            break;
                        }
                    }
                    if (!diff) return undefined;
                    break;
                }
                case 'date': {
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
                        // if (BetaSeries.debug) console.log('FillDecorator.fill: type Function for [%s.%s]', classStatic.name, key, {type, value});
                        // value = Reflect.construct(type, [value]);
                        value = new (type)(value);
                        if (typeof value === 'object' && Reflect.has(value, 'parent')) {
                            value.parent = target;
                        }
                    }
                    if (self.__initial || isNull(oldValue)) return value;
                    let changed = false;
                    try {
                        // if (BetaSeries.debug) console.log('comparaison d\'objets', {typeOld: typeof oldValue, oldValue, typeNew: typeof value, value});
                        if (
                            (isNull(oldValue) && !isNull(value)) ||
                            (!isNull(oldValue) && isNull(value))
                        ) {
                            changed = true;
                        }
                        else if (typeof value === 'object' && !isNull(value)) {
                            if (JSON.stringify(oldValue) !== JSON.stringify(value)) {
                                if (UsBetaSeries.debug) console.log('compare objects with JSON.stringify and are differents', {oldValue, value});
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
            }
            if ((typeof type === 'string' && typeof value !== type) ||
                (typeof type === 'function' && !(value instanceof type)))
            {
                throw new TypeError(`Invalid value for key "${target.constructor.name}.${key}". Expected type "${(typeof type === 'string') ? type : JSON.stringify(type)}" but got "${typeof value}"`);
            }
            return value;
        }
        // console.log('FillDecorator.fill target: %s', self.constructor.name, data, (self.constructor as typeof RenderHtml).relatedProps);
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
                            // console.log('FillDecorator.fill setter[%s.%s] not changed', self.constructor.name, relatedProp.key, relatedProp.type, {newValue, oldValue, relatedProp});
                            return;
                        }
                        if (UsBetaSeries.debug) console.log('FillDecorator.fill setter[%s.%s] value changed', self.constructor.name, relatedProp.key, {type: relatedProp.type, newValue, oldValue, value, relatedProp});
                        // On set la nouvelle valeur
                        self['_' + relatedProp.key] = value;
                        // On stocke le changement de valeurs
                        self.__changes[relatedProp.key] = {oldValue, newValue};
                        // On appelle la methode de mise à jour du rendu HTML pour la propriété
                        this.updatePropRender(relatedProp.key);
                    }
                };
            }

            // if (BetaSeries.debug) console.log('FillDecorator.fill descriptor[%s.%s]', this.constructor.name, relatedProp.key, {relatedProp, dataProp, descriptor});
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
        // if (BetaSeries.debug) console.log('%s.updatePropRender', classStatic.name, propKey, fnPropKey);
        if (Reflect.has(self, fnPropKey)) {
            // if (BetaSeries.debug) console.log('%s.updatePropRender Reflect has method: %s', classStatic.name, fnPropKey);
            self[fnPropKey]();
        }
        else if (classStatic.selectorsCSS && classStatic.selectorsCSS[propKey]) {
            // if (BetaSeries.debug) console.log('updatePropRender default');
            const selectorCSS = classStatic.selectorsCSS[propKey];
            jQuery(selectorCSS).text(self[propKey].toString());
            delete self.__changes[propKey];
        }
    }
}