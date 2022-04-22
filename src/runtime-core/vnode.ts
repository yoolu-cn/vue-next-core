import { isObject, isString } from '../shared';
import { ShapeFlags } from '../shared/shapeFlags';
import { Data } from './component';

export type VNodeTypes = string | VNode;
export type VNodeProps = Data;
type VNodeChildAtom = VNode | string | number | boolean | null | undefined | void;
export type VNodeArrayChildren = Array<VNodeArrayChildren | VNodeChildAtom>;
export type VNodeNormalizedChildren = string | VNodeArrayChildren | null;

export interface VNode<ExtraProps = { [key: string]: any }> {
    type: VNodeTypes;
    props: (VNodeProps & ExtraProps) | null;
    children: VNodeNormalizedChildren;

    // optimization only
    shapeFlag: number;
}

export function createVNode(type: any, props?: any, children?: any) {
    const vnode = {
        type,
        props,
        children,
        shapeFlag: getShapeFlag(type),
    } as VNode;

    vnode.shapeFlag |= isString(children) ? ShapeFlags.TEXT_CHILDREN : ShapeFlags.ARRAY_CHILDREN;

    if (vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
        if (isObject(vnode.children)) {
            vnode.shapeFlag |= ShapeFlags.SLOTS_CHILDREN;
        }
    }
    return vnode;
}

function getShapeFlag(type: any) {
    return isString(type) ? ShapeFlags.ELEMENT : ShapeFlags.STATEFUL_COMPONENT;
}
