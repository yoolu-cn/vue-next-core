import { mutableHandlers, readonlyHandlers } from './baseHandles';

export const enum ReactiveFlags {
    IS_REACTIVE = '__v_isReactive',
    IS_READONLY = '__v_isReadonly',
}

export interface Target {
    [ReactiveFlags.IS_REACTIVE]?: boolean;
    [ReactiveFlags.IS_READONLY]?: boolean;
}

export function reactive(target: object) {
    return createReactiveObject(target, false, mutableHandlers);
}

export function readonly(target: object) {
    return createReactiveObject(target, true, readonlyHandlers);
}

function createReactiveObject(target: object, isReadonly = false, baseHandlers: ProxyHandler<any>) {
    return new Proxy(target, baseHandlers);
}

export function isReadonly(value: unknown): boolean {
    return !!(value && (value as Target)[ReactiveFlags.IS_READONLY]);
}

export function isReactive(value: unknown): boolean {
    return !!(value && (value as Target)[ReactiveFlags.IS_REACTIVE]);
}
