import { effect } from '../reactivity/src/effect';
import { createRendererOptions } from '../runtime-dom';
import { ShapeFlags } from '../shared/shapeFlags';
import { ComponentInternalInstance, createComponentInstance, setupComponent } from './component';
import { createAppAPI } from './createApp';
import { Fragment, Text } from './vnode';

export function createRenderer(options: createRendererOptions) {
    const {
        createElement: hostCreateElement,
        patchProp: hostPatchProp,
        insert: hostInsert,
    } = options;

    function render(vnode: any, container: any) {
        // patch
        patch(null, vnode, container, null);
    }

    function patch(n1: any, n2: any, container: any, parent: ComponentInternalInstance | null) {
        switch (n2.type) {
            case Fragment:
                processFragment(n1, n2, container, parent);
                break;
            case Text:
                processText(n1, n2, container);
                break;
            default:
                /**
                 * 判断 vnode 是不是一个 element， 区别处理 element 和 component
                 */
                const { shapeFlag } = n2;
                if (shapeFlag & ShapeFlags.ELEMENT) {
                    // 处理 element
                    processElement(n1, n2, container, parent);
                } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
                    // 处理组件
                    processComponent(n1, n2, container, parent);
                }
                break;
        }
    }
    function processElement(
        n1: any,
        n2: any,
        container: any,
        parent: ComponentInternalInstance | null
    ) {
        if (!n1) {
            mountElement(n2, container, parent);
        } else {
            patchElement(n1, n2, container, parent);
        }
    }

    function processComponent(
        n1: any,
        n2: any,
        container: any,
        parent: ComponentInternalInstance | null
    ) {
        mountComponent(n2, container, parent);
    }
    function processFragment(
        n1: any,
        n2: any,
        container: any,
        parent: ComponentInternalInstance | null
    ) {
        mountChildren(n2.children, container, parent);
    }
    function processText(n1: any, n2: any, container: any) {
        const el = (n2.el = document.createTextNode(n2.children));
        container.append(el);
    }
    function mountElement(vnode: any, container: any, parent: ComponentInternalInstance | null) {
        const el = (vnode.el = hostCreateElement(vnode.type));

        const { props, children, shapeFlag } = vnode;
        if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
            el.textContent = children;
        } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
            mountChildren(children, el, parent);
        }
        if (props) {
            for (const key in props) {
                const val = props[key];

                hostPatchProp(el, key, val);
            }
        }

        hostInsert(el, container);
    }
    function patchElement(
        n1: any,
        n2: any,
        container: any,
        parent: ComponentInternalInstance | null
    ) {
        console.log('update element');
        console.log('n1', n1);
        console.log('n2', n2);
    }
    function mountChildren(
        children: any[],
        el: HTMLElement,
        parent: ComponentInternalInstance | null
    ) {
        children.forEach((vnode: any) => {
            patch(null, vnode, el, parent);
        });
    }
    function mountComponent(vnode: any, container: any, parent: ComponentInternalInstance | null) {
        const instance = createComponentInstance(vnode, parent);
        setupComponent(instance);
        setupRenderEffect(instance, vnode, container);
    }
    function setupRenderEffect(instance: ComponentInternalInstance, vnode: any, container: any) {
        effect(() => {
            if (!instance.isMounted) {
                console.log('init');
                const { proxy } = instance;
                const subTree = (instance.subTree = instance.render.call(proxy));
                patch(null, subTree, container, instance);

                vnode.el = subTree.el;
                instance.isMounted = true;
            } else {
                console.log('update');
                const { proxy } = instance;
                const prevSubTree = instance.subTree;
                const subTree = (instance.subTree = instance.render.call(proxy));
                patch(prevSubTree, subTree, container, instance);

                vnode.el = subTree.el;
            }
        });
    }
    return {
        createApp: createAppAPI(render),
    };
}
