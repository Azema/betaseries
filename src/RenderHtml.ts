import { Base, isNull, Obj } from "./Base";


export type RelatedProp = {
    key: string; // Nom de la propriété dans l'objet
    type: any; // type de donnée
    default?: any; // valeur par défaut
    transform?: (obj: object, data: Obj) => any; // Fonction de transformation de la donnée
}
export type Changes = {
    oldValue: any;
    newValue: any;
}

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

export abstract class RenderHtml extends Base implements implRenderHtml {

    static relatedProps: Record<string, RelatedProp> = {};
    static selectorsCSS: Record<string, string> = {};

    /**
     * @type {JQuery<HTMLElement>} Element HTML de référence du média
     */
    private __elt: JQuery<HTMLElement>;
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
     * Remplit l'objet avec les données fournit en paramètre
     * @param  {Obj} data - Les données provenant de l'API
     * @returns {Base}
     * @virtual
     */
    fill(data: Obj): this {
        const self = this;
        if (typeof data !== 'object') {
            const err = new TypeError('Base.fill data is not an object: ' + typeof data);
            console.error(err);
            throw err;
        }
        const checkTypeValue = (target: any, key: string, type: any, value: any, relatedProp: RelatedProp): any => {
            const typeNV = typeof value;
            const oldValue = target['_' + key];
            const hasDefault = Reflect.has(relatedProp, 'default');
            const hasTransform = Reflect.has(relatedProp, 'transform');
            if (!isNull(value) && hasTransform && typeof relatedProp.transform === 'function') {
                value = relatedProp.transform(target, value);
            }
            if (isNull(oldValue) && isNull(value)) return undefined;
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
                    if (this.__initial || !Array.isArray(oldValue)) return value;
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
                        // if (Base.debug) console.log('fill type function', {type: relatedProp.type, dataProp});
                        value = Reflect.construct(type, [value]);
                        if (typeof value === 'object' && Reflect.has(value, 'parent')) {
                            value.parent = target;
                        }
                    }
                    if (this.__initial || isNull(oldValue)) return value;
                    let changed = false;
                    try {
                        // if (Base.debug) console.log('comparaison d\'objets', {typeOld: typeof oldValue, oldValue, typeNew: typeof value, value});
                        if (
                            (isNull(oldValue) && !isNull(value)) ||
                            (!isNull(oldValue) && isNull(value))
                        ) {
                            changed = true;
                        }
                        else if (typeof value === 'object' && !isNull(value)) {
                            if (JSON.stringify(oldValue) !== JSON.stringify(value)) {
                                console.log('compare objects with JSON.stringify and are differents', {oldValue, value});
                                changed = true;
                            }
                            // changed = compareObj(oldValue, value);
                        }
                        if (!changed) return undefined;
                    } catch (err) {
                        console.warn('Base.fill => checkTypeValue: error setter[%s.%s]', target.constructor.name, key, {oldValue, value});
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
        // On reinitialise les changements de l'objet
        this.__changes = {};
        for (const propKey in (this.constructor as typeof RenderHtml).relatedProps) {
            if (!Reflect.has(data, propKey)) continue;
            /** relatedProp contient les infos de la propriété @see RelatedProp */
            const relatedProp = (this.constructor as typeof RenderHtml).relatedProps[propKey];
            // dataProp contient les données provenant de l'API
            const dataProp = data[propKey];
            // Le descripteur de la propriété, utilisé lors de l'initialisation de l'objet
            let descriptor: PropertyDescriptor;
            if (this.__initial) {
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
                            // console.log('Base.fill setter[%s.%s] not changed', self.constructor.name, relatedProp.key, relatedProp.type, {newValue, oldValue, relatedProp});
                            return;
                        }
                        if (Base.debug) console.log('Base.fill setter[%s.%s] value changed', self.constructor.name, relatedProp.key, {type: relatedProp.type, newValue, oldValue, value, relatedProp});
                        // On set la nouvelle valeur
                        self['_' + relatedProp.key] = value;
                        // On stocke le changement de valeurs
                        self.__changes[relatedProp.key] = {oldValue, newValue};
                        // On appelle la methode de mise à jour du rendu HTML pour la propriété
                        self.updatePropRender(relatedProp.key);
                    }
                };
            }

            // if (Base.debug) console.log('Base.fill descriptor[%s.%s]', this.constructor.name, relatedProp.key, {relatedProp, dataProp, descriptor});
            // Lors de l'initialisation, on définit la propriété de l'objet
            // et on ajoute le nom de la propriété dans le tableau __props
            if (this.__initial) {
                Object.defineProperty(this, relatedProp.key, descriptor);
                this.__props.push(relatedProp.key);
            }
            // On set la valeur
            this[relatedProp.key] = dataProp;
        }
        // Fin de l'initialisation
        if (this.__initial) {
            this.__props.sort();
            this.__initial = false;
        }
        return this;
    }

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
    updatePropRender(propKey: string): void {
        if (! this.elt || ! this.__props.includes(propKey)) return;
        const fnPropKey = 'updatePropRender' + propKey.camelCase().upperFirst();
        // if (Base.debug) console.log('%s.updatePropRender', this.constructor.name, propKey, fnPropKey);
        if (Reflect.has(this, fnPropKey)) {
            // if (Base.debug) console.log('%s.updatePropRender Reflect has method: %s', this.constructor.name, fnPropKey);
            this[fnPropKey]();
        } else if ((this.constructor as typeof RenderHtml).selectorsCSS &&
            (this.constructor as typeof RenderHtml).selectorsCSS[propKey])
        {
            // if (Base.debug) console.log('updatePropRender default');
            const selectorCSS = (this.constructor as typeof RenderHtml).selectorsCSS[propKey];
            jQuery(selectorCSS).text(this[propKey].toString());
            delete this.__changes[propKey];
        }
    }
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