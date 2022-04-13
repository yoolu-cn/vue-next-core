import { isFunction, NOOP } from '../../shared';
import { ReactiveEffect } from './effect';
import { ReactiveFlags, toRaw } from './reactive';
import { Ref, trackRefValue, triggerRefValue } from './ref';

declare const ComputedRefSymbol: unique symbol;

export type ComputedGetter<T> = (...args: any[]) => T;
export type ComputedSetter<T> = (v: T) => void;

export interface WritableComputedOptions<T> {
    get: ComputedGetter<T>;
    set: ComputedSetter<T>;
}

export interface WritableComputedRef<T> extends Ref<T> {
    readonly effect: ReactiveEffect<T>;
}

export interface ComputedRef<T = any> extends WritableComputedRef<T> {
    readonly value: T;
    [ComputedRefSymbol]: true;
}

export class ComputedRefImpl<T> {
    private _value!: T;
    public readonly effect: ReactiveEffect<T>;

    public readonly __v_isRef = true;
    public readonly [ReactiveFlags.IS_READONLY]: boolean;

    public _dirty = true;

    constructor(
        getter: ComputedGetter<T>,
        private readonly _setter: ComputedSetter<T>,
        isReadonly: boolean
    ) {
        this.effect = new ReactiveEffect(getter, () => {
            if (!this._dirty) {
                this._dirty = true;
                triggerRefValue(this);
            }
        });
        this.effect.computed = this;
        this[ReactiveFlags.IS_READONLY] = isReadonly;
    }

    get value() {
        const self = toRaw(this);
        trackRefValue(self);
        if (self._dirty) {
            self._dirty = false;
            self._value = self.effect.run();
        }
        return self._value;
    }

    set value(newValue: T) {
        this._setter(newValue);
    }
}

export function computed<T>(getter: ComputedGetter<T>): ComputedRef<T>;
export function computed<T>(options: WritableComputedOptions<T>): WritableComputedRef<T>;
export function computed<T>(getterOrOptions: ComputedGetter<T> | WritableComputedOptions<T>) {
    let getter: ComputedGetter<T>;
    let setter: ComputedSetter<T>;

    const onlyGetter = isFunction(getterOrOptions);
    if (onlyGetter) {
        getter = getterOrOptions;
        setter = NOOP;
    } else {
        getter = getterOrOptions.get;
        setter = getterOrOptions.set;
    }
    const cRef = new ComputedRefImpl(getter, setter, onlyGetter || !setter);
    return cRef as any;
}

/**
 * computed 思路解析
 * 表现：
 *   - 返回一个 ref 类型的值，通过返回值的 .value 获取结果
 *   - 调用 computed 时，传入的 getter 并不会执行，当访问 .value 结果时，执行getter 并缓存，只有 getter 函数中依赖的某个值发生变化，获取 .value 结果时才会重新执行
 * 1. computed 中传入 getter 函数
 *   - 创建 ComputedRefImpl 类
 *   - computed 底层逻辑依赖于 effect API 来实现，添加公共只读属性 effect 记录 ReactiveEffect 实例。
 *   - 由于 computed 计算结果在返回值的 .value 中，参照 ref 提供 get value 方法返回计算结果, 在读取 .value 结果时调用 effect.run 方法，第一次执行 getter, 并且收集依赖
 *   - computed 在 getter 的依赖没有改变时不会重新计算，所以设置一个公共只读的 dirty 变量来控制，默认 true, 每次调用完 effect.run 锁住 dirty，利用 effect 的 scheduler 的特性(effect 的 scheduler 回调执行，证明有依赖更新)，来重置 dirty
 *
 * 2. computed 中传入 options: { get, set } 配置
 *   - 在 1 的基础上添加 set value 方法来执行传入的 options.set 方法
 *
 */
