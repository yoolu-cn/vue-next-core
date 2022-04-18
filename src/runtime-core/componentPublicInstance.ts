import { extend, hasOwn } from '../shared';
import { ComponentInternalInstance } from './component';

export type ComponentPublicInstance = {
    $el: any;
};

export type PublicPropertiesMap = Record<string, (i: ComponentInternalInstance) => any>;

export const publicPropertiesMap: PublicPropertiesMap = extend(Object.create(null), {
    $el: (i: any) => i.vnode.el,
});

export const PublicInstanceProxyHandlers: ProxyHandler<any> = {
    get({ _: instance }: any, key: string) {
        const { setupState, props } = instance;
        if (hasOwn(setupState, key)) {
            return setupState[key];
        } else if (hasOwn(props, key)) {
            return props[key];
        }

        const publicGetter = publicPropertiesMap[key];

        if (publicGetter) {
            return publicGetter(instance);
        }
    },
};
