import { extend, isObject } from '../shared';
import { track, trigger } from './effect';
import { reactive, ReactiveFlags, readonly } from './reactive';

const get = createGetter();
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);

const set = createSetter();

function createGetter(isReadonly = false, isShallow = false) {
    return function get(target: object, key: string | symbol) {
        if (key === ReactiveFlags.IS_REACTIVE) {
            return !isReadonly;
        } else if (key === ReactiveFlags.IS_READONLY) {
            return isReadonly;
        }

        const res = Reflect.get(target, key);

        if (isShallow) {
            return res;
        }

        if (!isReadonly) {
            // 依赖收集
            track(target, key);
        }

        if (isObject(res)) {
            return isReadonly ? readonly(res) : reactive(res);
        }

        return res;
    };
}

function createSetter() {
    return function set(target: object, key: string | symbol, value: any) {
        const res = Reflect.set(target, key, value);

        // 触发依赖
        trigger(target, key);
        return res;
    };
}

export const mutableHandlers: ProxyHandler<object> = {
    get,
    set,
};

export const readonlyHandlers: ProxyHandler<object> = {
    get: readonlyGet,
    set(target: object, key: string | symbol, value: unknown) {
        console.warn(`Set operation on key "${String(key)}" failed: target is readonly.`, target);
        return true;
    },
};

export const shallowReadonlyHandlers: ProxyHandler<object> = extend({}, readonlyHandlers, {
    get: shallowReadonlyGet,
});
