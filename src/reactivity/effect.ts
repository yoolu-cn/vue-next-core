class ReactiveEffect<T = any> {
    private _fn: () => T;
    constructor(fn: () => T) {
        this._fn = fn;
    }

    run() {
        activeEffect = this;
        this._fn();
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

    for (let fn of dep) {
        fn.run();
    }
}

export function effect<T = any>(fn: () => T) {
    const _effect = new ReactiveEffect(fn);

    _effect.run();
}
