import { createVNode } from './vnode';

export function createAppAPI(render: (vnode: any, container: any) => void) {
    return function createApp(rootComponent: any) {
        return {
            mount(rootContainer: any) {
                // 先将 rootComponent 转化为 vnode
                // 所有逻辑操作都基于 vnode

                const vnode = createVNode(rootComponent);

                render(vnode, rootContainer);
            },
        };
    };
}
