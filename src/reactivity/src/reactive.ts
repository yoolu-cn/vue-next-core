import { isObject } from '../../shared';
import {
    mutableHandlers,
    readonlyHandlers,
    shallowReactiveHandlers,
    shallowReadonlyHandlers,
} from './baseHandles';

export const enum ReactiveFlags {
    IS_REACTIVE = '__v_isReactive',
    IS_READONLY = '__v_isReadonly',
    IS_SHALLOW = '__v_isShallow',
    RAW = '__v_raw',
}

export interface Target {
    [ReactiveFlags.IS_REACTIVE]?: boolean;
    [ReactiveFlags.IS_READONLY]?: boolean;
    [ReactiveFlags.IS_SHALLOW]?: boolean;
    [ReactiveFlags.RAW]?: any;
}

export function reactive(target: Record<any, any>): Record<any, any> {
    return createReactiveObject(target, false, mutableHandlers);
}

export function readonly(target: object) {
    return createReactiveObject(target, true, readonlyHandlers);
}

export function shallowReactive(target: object) {
    return createReactiveObject(target, false, shallowReactiveHandlers);
}

export function shallowReadonly(target: object) {
    return createReactiveObject(target, true, shallowReadonlyHandlers);
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

export function isShallow(value: unknown): boolean {
    return !!(value && (value as Target)[ReactiveFlags.IS_SHALLOW]);
}

export function isProxy(value: unknown): boolean {
    return isReactive(value) || isReadonly(value);
}

export function toReactive<T extends unknown>(value: T): T {
    return isObject(value) ? reactive(value) : value;
}

export function toRaw<T>(observed: T): T {
    const raw = observed && (observed as Target)[ReactiveFlags.RAW];
    return raw ? toRaw(raw) : observed;
}
