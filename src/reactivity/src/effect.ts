import { extend } from '../../shared';
import { ComputedRefImpl } from './computed';
import { createDep } from './dep';

export type EffectScheduler = (...args: any[]) => any;
export interface ReactiveEffectOptions {
    scheduler?: EffectScheduler;
    onStop?: () => void;
}
export type Dep = Set<ReactiveEffect>;
type KeyToDepMap = Map<any, Dep>;

let activeEffect: ReactiveEffect | undefined;
let shouldTrack: boolean;

const targetMap = new Map<any, KeyToDepMap>();
// const targetMap = new WeakMap();

export class ReactiveEffect<T = any> {
    deps: Dep[] = [];
    active = true;
    onStop?: () => void;
    computed?: ComputedRefImpl<T>;
    constructor(public fn: () => T, public scheduler?: Function) {}

    run() {
        // 会依赖收集
        // 使用 shouldTrack 来区分
        if (!this.active) {
            return this.fn();
        }
        shouldTrack = true;
        activeEffect = this;

        const result = this.fn();
        // 收集完依赖后 reset 全局变量
        shouldTrack = false;

        return result;
    }

    stop() {
        if (this.active) {
            clearupEffect(this);
            if (this.onStop) {
                this.onStop();
            }
            this.active = false;
        }
    }
}

function clearupEffect(effect: ReactiveEffect) {
    effect.deps.forEach((dep: any) => {
        dep.delete(effect);
    });
}

export function isTracking(): boolean {
    return shouldTrack && activeEffect !== undefined;
}
export function track(target: any, key: any) {
    if (!isTracking()) {
        return;
    }

    let depsMap = targetMap.get(target);

    if (!depsMap) {
        targetMap.set(target, (depsMap = new Map()));
    }

    let dep = depsMap.get(key);
    if (!dep) {
        depsMap.set(key, (dep = createDep()));
    }

    trackEffects(dep);
}

export function trackEffects(dep: Dep) {
    if (dep.has(activeEffect!)) {
        return;
    }

    dep.add(activeEffect!);
    activeEffect!.deps.push(dep);
}

export function trigger(target: any, key: any) {
    const depsMap = targetMap.get(target);
    if (!depsMap) {
        // never been tracked
        return;
    }
    const deps = depsMap!.get(key);
    triggerEffects(deps!);
}

export function triggerEffects(dep: Dep) {
    for (let effect of dep!) {
        if (effect.scheduler) {
            effect.scheduler();
        } else {
            effect.run();
        }
    }
}

export interface ReactiveEffectRunner<T = any> {
    (): T;
    effect: ReactiveEffect;
}

export function effect<T = any>(
    fn: () => T,
    options?: ReactiveEffectOptions
): ReactiveEffectRunner {
    const _effect = new ReactiveEffect(fn);

    if (options) {
        extend(_effect, options);
    }

    _effect.run();
    const runner: any = _effect.run.bind(_effect) as ReactiveEffectRunner;
    runner.effect = _effect;
    return runner;
}

export function stop(runner: ReactiveEffectRunner) {
    runner.effect.stop();
}
