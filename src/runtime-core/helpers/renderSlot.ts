import { isFunction } from '../../shared';
import { Data } from '../component';
import { createVNode, Fragment } from '../vnode';

export function renderSlot(slots: any, name: string, props: Data) {
    const slot = slots[name];
    if (slot) {
        if (isFunction(slot)) {
            return createVNode(Fragment, {}, slot(props));
        }
    }
}
