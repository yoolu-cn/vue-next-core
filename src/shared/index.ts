export const extend = Object.assign;

export const isObject = (val: unknown): val is Record<any, any> =>
    val !== null && typeof val === 'object';

export const hasChanged = (value: any, oldValue: any): boolean => !Object.is(value, oldValue);

export const isFunction = (val: unknown): val is Function => typeof val === 'function';

export const NOOP = () => {};

export const EMPTY_OBJ: { readonly [key: string]: any } = {};

const hasOwnProperty = Object.prototype.hasOwnProperty;
export const hasOwn = (val: object, key: string | symbol): key is keyof typeof val =>
    hasOwnProperty.call(val, key);

export const isString = (val: unknown): val is string => typeof val === 'string';
