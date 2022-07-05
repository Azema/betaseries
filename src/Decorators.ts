import "reflect-metadata";

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