import { effect } from '../reactivity/src/effect';
import { createRendererOptions } from '../runtime-dom';
import { EMPTY_OBJ } from '../shared';
import { ShapeFlags } from '../shared/shapeFlags';
import { ComponentInternalInstance, createComponentInstance, setupComponent } from './component';
import { createAppAPI } from './createApp';
import { Fragment, Text } from './vnode';

export function createRenderer(options: createRendererOptions) {
    const {
        createElement: hostCreateElement,
        patchProp: hostPatchProp,
        insert: hostInsert,
        remove: hostRemove,
        setElementText: hostSetElementText,
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
                hostPatchProp(el, key, null, val);
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
        const el = (n2.el = n1.el);
        const oldProps = n1.props || EMPTY_OBJ;
        const newProps = n2.props || EMPTY_OBJ;
        patchChildren(n1, n2, el, parent);
        patchProps(el, oldProps, newProps);
    }

    function patchChildren(
        n1: any,
        n2: any,
        container: any,
        parent: ComponentInternalInstance | null
    ) {
        const prevShapeFlag = n1.shapeFlag;
        const { shapeFlag } = n2;
        const c1 = n1.children;
        const c2 = n2.children;
        if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
            if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
                // 清空老的 children
                unmountChildren(c1);
            }
            if (c1 !== c2) {
                // 设置 text
                hostSetElementText(container, c2);
            }
        } else {
            if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
                // 清空老的 Text
                hostSetElementText(container, '');
                mountChildren(c2, container, parent);
            } else {
                // 清空老的 children
                unmountChildren(c1);
                mountChildren(c2, container, parent);
            }
        }
    }

    function patchProps(el: any, oldProps: any, newProps: any) {
        /**
         * @todo 这里有bug 对象之前判断永远不相等 除非 oldProps 和 newProps 都为 EMPTY_OBJ
         */
        if (oldProps !== newProps) {
            for (const key in newProps) {
                const prevProp = oldProps[key];
                const nextProp = newProps[key];
                if (prevProp !== nextProp) {
                    hostPatchProp(el, key, prevProp, nextProp);
                }
            }
            if (oldProps == EMPTY_OBJ) {
                return;
            }

            for (const key in oldProps) {
                if (!(key in newProps)) {
                    hostPatchProp(el, key, oldProps[key], null);
                }
            }
        }
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

    function unmountChildren(children: any[]) {
        for (let i = 0, len = children.length; i < len; i++) {
            const el = children[i].el;
            hostRemove(el);
        }
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
