import { createComponentInstance, setupComponent } from './component';

export function render(vnode: any, container: any) {
    // patch
    patch(vnode, container);
}

function patch(vnode: any, container: any) {
    // 处理组件
    processComponent(vnode, container);
}
function processComponent(vnode: any, container: any) {
    mountComponent(vnode, container);
}
function mountComponent(vnode: any, container: any) {
    const instance = createComponentInstance(vnode);
    setupComponent(instance);
    setupRenderEffect(instance, container);
}
function setupRenderEffect(instance: { vnode: any; render?: any }, container: any) {
    const subTree = instance.render();

    patch(subTree, container);
}
