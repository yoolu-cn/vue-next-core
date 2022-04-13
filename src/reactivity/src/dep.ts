import { ReactiveEffect } from '../effectt';

export type Dep = Set<ReactiveEffect> & TrackedMarkers;

/**
 * wasTracked and newTracked maintain the status for several levels of effect
 * tracking recursion. One bit per level is used to define whether the dependency
 * was/is tracked.
 */
type TrackedMarkers = {
    /**
     * wasTracked
     */
    w: number;
    /**
     * newTracked
     */
    n: number;
};

export const createDep = (effects?: ReactiveEffect[]): Dep => {
    const dep = new Set<ReactiveEffect>(effects) as Dep;
    dep.w = 0;
    dep.n = 0;
    return dep;
};
