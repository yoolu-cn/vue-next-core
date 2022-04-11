import { mutableHandlers, readonlyHandlers } from './baseHandles';

export function reactive(target: object) {
    return createReactiveObject(target, false, mutableHandlers);
}

export function readonly(target: object) {
    return createReactiveObject(target, true, readonlyHandlers);
}

function createReactiveObject(target: object, isReadonly = false, baseHandlers: ProxyHandler<any>) {
    return new Proxy(target, baseHandlers);
}
