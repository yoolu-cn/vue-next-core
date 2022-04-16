import { ReactiveEffect } from '../reactivity/src/effect';
import { EMPTY_OBJ } from '../shared';
import { ComponentPublicInstance, PublicInstanceProxyHandlers } from './componentPublicInstance';

export type Data = Record<string, unknown>;
export interface ComponentInternalInstance {
    type: any;
    /**
     * Vnode representing this component in its parent's vdom tree
     */
    vnode: any;
    /**
     * Root vnode of this component's own vdom tree
     */
    subTree: any;
    /**
     * Render effect instance
     */
    effect: ReactiveEffect;
    /**
     * The render function that returns vdom tree.
     * @internal
     */
    render: any;
    /**
     * Resolved component registry, only for components with mixins or extends
     * @internal
     */
    // components: Record<string, ConcreteComponent> | null;
    proxy: ComponentPublicInstance | null;
    /**
     * This is the target for the public instance proxy. It also holds properties
     * injected by user options (computed, methods etc.) and user-attached
     * custom properties (via `this.x = ...`)
     * @internal
     */
    ctx: Data;
    /**
     * setup related
     * @internal
     */
    setupState: Data;
}
export function createComponentInstance(vnode: any) {
    const instance: ComponentInternalInstance = {
        vnode,
        type: vnode.type,
        setupState: EMPTY_OBJ,
        ctx: EMPTY_OBJ,
        effect: null!,
        proxy: null,
        subTree: null,
        render: null,
    };
    instance.ctx = { _: instance };
    return instance;
}

export function setupComponent(instance: any) {
    /**
     * @TODO
     * initProps
     * initSlots
     */

    setupStatefulComponent(instance);
}

function setupStatefulComponent(instance: any) {
    const Component = instance.type;
    instance.proxy = new Proxy(instance.ctx, PublicInstanceProxyHandlers);

    const { setup } = Component;

    if (setup) {
        // function Object
        const setupResult = setup();

        handleSetupResult(instance, setupResult);
    }
}
function handleSetupResult(instance: any, setupResult: object | Function) {
    // function Object
    // TODO  function

    if (typeof setupResult === 'object') {
        instance.setupState = setupResult;
    }

    finishComponentSetup(instance);
}

function finishComponentSetup(instance: any) {
    const Component = instance.type;

    if (Component.render) {
        instance.render = Component.render;
    }
}
