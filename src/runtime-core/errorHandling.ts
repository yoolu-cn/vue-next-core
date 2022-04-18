import { isFunction, isPromise } from '../shared';
import { ComponentInternalInstance } from './component';

export const enum ErrorCodes {
    SETUP_FUNCTION,
    RENDER_FUNCTION,
    WATCH_GETTER,
    WATCH_CALLBACK,
    WATCH_CLEANUP,
    NATIVE_EVENT_HANDLER,
    COMPONENT_EVENT_HANDLER,
    VNODE_HOOK,
    DIRECTIVE_HOOK,
    TRANSITION_HOOK,
    APP_ERROR_HANDLER,
    APP_WARN_HANDLER,
    FUNCTION_REF,
    ASYNC_COMPONENT_LOADER,
    SCHEDULER,
}

export const enum LifecycleHooks {
    BEFORE_CREATE = 'bc',
    CREATED = 'c',
    BEFORE_MOUNT = 'bm',
    MOUNTED = 'm',
    BEFORE_UPDATE = 'bu',
    UPDATED = 'u',
    BEFORE_UNMOUNT = 'bum',
    UNMOUNTED = 'um',
    DEACTIVATED = 'da',
    ACTIVATED = 'a',
    RENDER_TRIGGERED = 'rtg',
    RENDER_TRACKED = 'rtc',
    ERROR_CAPTURED = 'ec',
    SERVER_PREFETCH = 'sp',
}

type ErrorTypes = LifecycleHooks | ErrorCodes;

export function callWithErrorHandling(
    fn: Function,
    instance: ComponentInternalInstance | null,
    type: ErrorTypes,
    args?: unknown[]
) {
    let res;
    try {
        res = args ? fn(...args) : fn();
    } catch (err) {
        // handleError(err, instance, type);
    }
    return res;
}

export function callWithAsyncErrorHandling(
    fn: Function | Function[],
    instance: ComponentInternalInstance | null,
    type: ErrorTypes,
    args?: unknown[]
): any[] {
    if (isFunction(fn)) {
        const res = callWithErrorHandling(fn, instance, type, args);
        if (res && isPromise(res)) {
            res.catch((err: any) => {
                // handleError(err, instance, type);
            });
        }
        return res;
    }

    const values = [];
    for (let i = 0; i < fn.length; i++) {
        values.push(callWithAsyncErrorHandling(fn[i], instance, type, args));
    }
    return values;
}
