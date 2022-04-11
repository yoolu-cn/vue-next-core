import { track, trigger } from './effect';

const get = createGetter();
const readonlyGet = createGetter(true);

const set = createSetter();

function createGetter(isReadonly = false) {
    return function get(target: object, key: string | symbol) {
        const res = Reflect.get(target, key);

        if (!isReadonly) {
            // 依赖收集
            track(target, key);
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
