import { shallowReadonly } from '../reactivity/src';
import { ReactiveEffect } from '../reactivity/src/effect';
import { proxyRefs } from '../reactivity/src/ref';
import { EMPTY_OBJ } from '../shared';
import { emit } from './componentEmits';
import { initProps } from './componentProps';
import { ComponentPublicInstance, PublicInstanceProxyHandlers } from './componentPublicInstance';
import { initSlots, InternalSlots } from './componentSlots';

export type Data = Record<string, unknown>;

export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
    k: infer I
) => void
    ? I
    : never;

export type ObjectEmitsOptions = Record<string, ((...args: any[]) => any) | null>;

export type EmitFn<
    Options = ObjectEmitsOptions,
    Event extends keyof Options = keyof Options
> = Options extends Array<infer V>
    ? (event: V, ...args: any[]) => void
    : {} extends Options // if the emit is empty object (usually the default value for emit) should be converted to function
    ? (event: string, ...args: any[]) => void
    : UnionToIntersection<
          {
              [key in Event]: Options[key] extends (...args: infer Args) => any
                  ? (event: key, ...args: Args) => void
                  : (event: key, ...args: any[]) => void;
          }[Event]
      >;

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
    parent: ComponentInternalInstance | null;
    slots: InternalSlots;
    /**
     * Object containing values this component provides for its descendents
     * @internal
     */
    provides: Data;
    // lifecycle
    isMounted: boolean;

    emit: EmitFn;
}

let currentInstance: any = null;

export function createComponentInstance(vnode: any, parent: ComponentInternalInstance | null) {
    const instance: ComponentInternalInstance = {
        vnode,
        type: vnode.type,
        setupState: {},
        ctx: {},
        effect: null!,
        proxy: null,
        subTree: null,
        render: null,
        emit: null!,
        slots: {},
        provides: parent ? parent.provides : {},
        parent,
        isMounted: false,
    };
    instance.ctx = { _: instance };
    instance.emit = emit.bind(null, instance);

    return instance;
}

export function setupComponent(instance: any) {
    initProps(instance, instance.vnode.props);
    initSlots(instance, instance.vnode.children);
    setupStatefulComponent(instance);
}

function setupStatefulComponent(instance: any) {
    const Component = instance.type;
    instance.proxy = new Proxy(instance.ctx, PublicInstanceProxyHandlers);

    const { setup } = Component;

    if (setup) {
        setCurrentInstance(instance);
        // function Object
        const setupResult = setup(shallowReadonly(instance.props), {
            emit: instance.emit,
        });
        setCurrentInstance(null);

        handleSetupResult(instance, setupResult);
    }
}
function handleSetupResult(instance: any, setupResult: object | Function) {
    // function Object
    // TODO  function

    if (typeof setupResult === 'object') {
        instance.setupState = proxyRefs(setupResult);
    }

    finishComponentSetup(instance);
}

function finishComponentSetup(instance: any) {
    const Component = instance.type;

    if (Component.render) {
        instance.render = Component.render;
    }
}

export function getCurrentInstance(): any {
    return currentInstance;
}

export function setCurrentInstance(instance: any) {
    currentInstance = instance;
}
