import { extend } from '../shared';

export type EffectScheduler = (...args: any[]) => any;
export interface ReactiveEffectOptions {
    scheduler?: EffectScheduler;
    onStop?: () => void;
}

class ReactiveEffect<T = any> {
    deps = [];
    active = true;
    onStop?: () => void;
    constructor(public fn: () => T, public scheduler?: Function) {}

    run() {
        activeEffect = this;
        return this.fn();
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
let activeEffect: any;
const targetMap = new Map();
export function track(target: any, key: any) {
    let depsMap = targetMap.get(target);

    if (!depsMap) {
        depsMap = new Map();
        targetMap.set(target, depsMap);
    }

    let dep = depsMap.get(key);
    if (!dep) {
        dep = new Set();
        depsMap.set(key, dep);
    }

    if (!activeEffect) {
        return;
    }

    dep.add(activeEffect);
    activeEffect.deps.push(dep);
}

export function trigger(target: any, key: any) {
    const depsMap = targetMap.get(target);
    const dep = depsMap.get(key);

    for (let effect of dep) {
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
