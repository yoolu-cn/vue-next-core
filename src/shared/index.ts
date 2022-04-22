export const extend = Object.assign;

export const isObject = (val: unknown): val is Record<any, any> =>
    val !== null && typeof val === 'object';

export const isArray = Array.isArray;

export const hasChanged = (value: any, oldValue: any): boolean => !Object.is(value, oldValue);

export const isFunction = (val: unknown): val is Function => typeof val === 'function';

export const NOOP = () => {};

export const EMPTY_OBJ: { readonly [key: string]: any } = {};

const hasOwnProperty = Object.prototype.hasOwnProperty;
export const hasOwn = (val: object, key: string | symbol): key is keyof typeof val =>
    hasOwnProperty.call(val, key);

export const isString = (val: unknown): val is string => typeof val === 'string';
export const isPromise = <T = any>(val: unknown): val is Promise<T> => {
    return isObject(val) && isFunction(val.then) && isFunction(val.catch);
};

const onRE = /^on[^a-z]/; // 匹配以 on 开头并且 on 后首字符不为 a-z
export const isOn = (key: string) => onRE.test(key);

const cacheStringFunction = <T extends (str: string) => string>(fn: T): T => {
    const cache: Record<string, string> = Object.create(null);
    return ((str: string) => {
        const hit = cache[str];
        return hit || (cache[str] = fn(str));
    }) as any;
};

const camelizeRE = /-(\w)/g;
/**
 * @private
 */
export const camelize = cacheStringFunction((str: string): string => {
    return str.replace(camelizeRE, (_, c) => (c ? c.toUpperCase() : ''));
});

const hyphenateRE = /\B([A-Z])/g;
/**
 * @private
 */
export const hyphenate = cacheStringFunction((str: string) =>
    str.replace(hyphenateRE, '-$1').toLowerCase()
);

/**
 * @private
 */
export const capitalize = cacheStringFunction(
    (str: string) => str.charAt(0).toUpperCase() + str.slice(1)
);

/**
 * @private
 */
export const toHandlerKey = cacheStringFunction((str: string) =>
    str ? `on${capitalize(str)}` : ``
);
