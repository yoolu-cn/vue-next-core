import { hasChanged } from '../shared';
import { createDep } from './dep';
import { Dep, isTracking, trackEffects, triggerEffects } from './effect';
import { isReactive, toReactive } from './reactive';

declare const RefSymbol: unique symbol;
export interface Ref<T = any> {
    value: T;
}

class RefImpl<T> {
    private _value: T;
    private _rawValue: T;

    public dep?: Dep = undefined;
    public readonly __is_ref = true;

    constructor(value: T) {
        this._value = toReactive(value);
        this._rawValue = value;
    }

    get value() {
        trackRefValue(this);
        return this._value;
    }

    set value(newVal) {
        if (hasChanged(newVal, this._rawValue)) {
            this._value = toReactive(newVal);
            this._rawValue = newVal;
            triggerRefValue(this);
        }
    }
}

type RefBase<T> = {
    dep?: Dep;
    value: T;
};

function trackRefValue(ref: RefBase<any>) {
    if (isTracking()) {
        trackEffects(ref.dep || (ref.dep = createDep()));
    }
}

function triggerRefValue(ref: RefBase<any>) {
    if (ref.dep) {
        triggerEffects(ref.dep);
    }
}
export function ref<T extends object>(value: T): [T] extends [Ref] ? T : Ref<T>;
export function ref<T>(value: T): Ref<T>;
export function ref<T = any>(): Ref<T | undefined>;
export function ref(value?: unknown) {
    return new RefImpl(value);
}

export function isRef(r: any): r is Ref {
    return !!(r && r.__is_ref === true);
}

export function unref<T>(ref: T | Ref<T>): T {
    return isRef(ref) ? (ref.value as any) : ref;
}

const shallowUnwrapHandlers: ProxyHandler<any> = {
    /**
     * 如果里面是一个 ref 类型，直接返回 .value
     * 如果不是一个 ref 类型，直接返回原 value
     */
    get: (target, key) => unref(Reflect.get(target, key)),
    /**
     * 如果初始值和新值都是 ref 类型， 直接替换ref
     * 如果初始值为 ref 新值不是 ref 类型, 则需要把新值 set 到初始值 ref 的 value
     */
    set(target, key, value) {
        const oldValue = target[key];
        if (isRef(oldValue) && !isRef(value)) {
            return (target[key].value = value);
        } else {
            return Reflect.set(target, key, value);
        }
    },
};

export function proxyRefs<T extends object>(objectWithRefs: T): ShallowUnwrapRef<T> {
    return isReactive(objectWithRefs)
        ? objectWithRefs
        : new Proxy(objectWithRefs, shallowUnwrapHandlers);
}

export type ShallowUnwrapRef<T> = {
    [K in keyof T]: T[K] extends Ref<infer V>
        ? V
        : // if `V` is `unknown` that means it does not extend `Ref` and is undefined
        T[K] extends Ref<infer V> | undefined
        ? unknown extends V
            ? undefined
            : V | undefined
        : T[K];
};
