class ReactiveEffect<T = any> {
    private _fn: () => T;
    constructor(fn: () => T, public schedule?: any) {
        this._fn = fn;
    }

    run() {
        activeEffect = this;
        return this._fn();
    }
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

    dep.add(activeEffect);
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

export function effect<T = any>(fn: () => T, options: any = {}) {
    const _effect = new ReactiveEffect(fn, options.scheduler);

    _effect.run();
    return _effect.run.bind(_effect);
}
