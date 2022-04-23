import { isOn } from '../shared';
import { ShapeFlags } from '../shared/shapeFlags';
import { ComponentInternalInstance, createComponentInstance, setupComponent } from './component';
import { patchEvent } from './event';
import { Fragment, Text } from './vnode';

export function render(vnode: any, container: any) {
    // patch
    patch(vnode, container, null);
}

function patch(vnode: any, container: any, parent: ComponentInternalInstance | null) {
    switch (vnode.type) {
        case Fragment:
            processFragment(vnode, container, parent);
            break;
        case Text:
            processText(vnode, container);
            break;
        default:
            /**
             * 判断 vnode 是不是一个 element， 区别处理 element 和 component
             */
            const { shapeFlag } = vnode;
            if (shapeFlag & ShapeFlags.ELEMENT) {
                // 处理 element
                processElement(vnode, container, parent);
            } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
                // 处理组件
                processComponent(vnode, container, parent);
            }
            break;
    }
}
function processElement(vnode: any, container: any, parent: ComponentInternalInstance | null) {
    mountElement(vnode, container, parent);
}
function processComponent(vnode: any, container: any, parent: ComponentInternalInstance | null) {
    mountComponent(vnode, container, parent);
}
function processFragment(vnode: any, container: any, parent: ComponentInternalInstance | null) {
    mountChildren(vnode.children, container, parent);
}
function processText(vnode: any, container: any) {
    const el = (vnode.el = document.createTextNode(vnode.children));
    container.append(el);
}
function mountElement(vnode: any, container: any, parent: ComponentInternalInstance | null) {
    const el = (vnode.el = document.createElement(vnode.type));

    const { props, children, shapeFlag } = vnode;
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
        el.textContent = children;
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        mountChildren(children, el, parent);
    }
    for (let key in props) {
        const val = props[key];
        if (isOn(key)) {
            const event = key.slice(2).toLowerCase();
            patchEvent(el, event, val);
        } else {
            el.setAttribute(key, val);
        }
    }
    container.append(el);
}
function mountChildren(children: any[], el: HTMLElement, parent: ComponentInternalInstance | null) {
    children.forEach((vnode: any) => {
        patch(vnode, el, parent);
    });
}
function mountComponent(vnode: any, container: any, parent: ComponentInternalInstance | null) {
    const instance = createComponentInstance(vnode, parent);
    setupComponent(instance);
    setupRenderEffect(instance, vnode, container);
}
function setupRenderEffect(instance: ComponentInternalInstance, vnode: any, container: any) {
    const { proxy } = instance;
    const subTree = instance.render.call(proxy);

    patch(subTree, container, instance);

    vnode.el = subTree.el;
}
