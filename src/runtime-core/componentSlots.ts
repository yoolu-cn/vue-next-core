import { isArray } from '../shared';
import { ShapeFlags } from '../shared/shapeFlags';
import { ComponentInternalInstance, Data } from './component';
import { VNode, VNodeNormalizedChildren } from './vnode';

export type Slot = (...args: any[]) => VNode[];

export type InternalSlots = {
    [name: string]: Slot | Array<Slot> | undefined;
};

export function initSlots(instance: ComponentInternalInstance, children: InternalSlots) {
    const { vnode } = instance;
    if (vnode.shapeFlag & ShapeFlags.SLOTS_CHILDREN) {
        normalizeObjectSlots(children, instance.slots);
    }
}

function normalizeObjectSlots(children: InternalSlots, slots: any) {
    for (let key in children) {
        const slot = children[key];
        slots[key] = (props: Data) => slot && normalizeSlotValue((slot as Function)(props));
    }
}

function normalizeSlotValue(value: Slot | Array<Slot>): Array<Slot> {
    return isArray(value) ? value : [value];
}
