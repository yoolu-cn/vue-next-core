export const extend = Object.assign;

export const isObject = (val: unknown): val is Record<any, any> =>
    val !== null && typeof val === 'object';

export const hasChanged = (value: any, oldValue: any): boolean => !Object.is(value, oldValue);

export const isFunction = (val: unknown): val is Function => typeof val === 'function';

export const NOOP = () => {};
