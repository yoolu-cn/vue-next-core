import { isObject } from '../shared';
import { ShapeFlags } from '../shared/shapeFlags';
import { ComponentInternalInstance, createComponentInstance, setupComponent } from './component';

export function render(vnode: any, container: any) {
    // patch
    patch(vnode, container);
}

function patch(vnode: any, container: any) {
    /**
     * 判断 vnode 是不是一个 element， 区别处理 element 和 component
     */
    const { shapeFlag } = vnode;
    if (shapeFlag & ShapeFlags.ELEMENT) {
        // 处理 element
        processElement(vnode, container);
    } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
        // 处理组件
        processComponent(vnode, container);
    }
}
function processElement(vnode: any, container: any) {
    mountElement(vnode, container);
}
function processComponent(vnode: any, container: any) {
    mountComponent(vnode, container);
}
function mountElement(vnode: any, container: any) {
    const el = (vnode.el = document.createElement(vnode.type));

    const { props, children, shapeFlag } = vnode;
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
        el.textContent = children;
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        mountChildren(children, el);
    }
    for (let key in props) {
        const val = props[key];
        el.setAttribute(key, val);
    }
    container.append(el);
}
function mountChildren(children: any[], el: HTMLElement) {
    children.forEach((vnode: any) => {
        patch(vnode, el);
    });
}
function mountComponent(vnode: any, container: any) {
    const instance = createComponentInstance(vnode);
    setupComponent(instance);
    setupRenderEffect(instance, vnode, container);
}
function setupRenderEffect(instance: ComponentInternalInstance, vnode: any, container: any) {
    const { proxy } = instance;
    const subTree = instance.render.call(proxy);

    patch(subTree, container);

    vnode.el = subTree.el;
}
