import { hasChanged } from '../shared';
import { createDep } from './dep';
import { Dep, isTracking, trackEffects, triggerEffects } from './effect';
import { reactive, toReactive } from './reactive';

declare const RefSymbol: unique symbol;
export interface Ref<T = any> {
    value: T;
}

class RefImpl<T> {
    private _value: T;
    private _rawValue: T;

    public dep?: Dep = undefined;

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
