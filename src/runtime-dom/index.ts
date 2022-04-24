import { patchEvent } from '../runtime-core/event';
import { createRenderer } from '../runtime-core/render';
import { isOn } from '../shared';

export interface createRendererOptions {
    createElement: (type: string) => HTMLElement;
    patchProp: (el: HTMLElement, key: string, prevProp: unknown, nextProp: unknown) => void;
    insert: (el: HTMLElement, parent: HTMLElement) => void;
}

function createElement(type: string): HTMLElement {
    return document.createElement(type);
}

function patchProp(el: HTMLElement, key: string, prevProp: unknown, nextProp: unknown): void {
    if (isOn(key)) {
        const event = key.slice(2).toLowerCase();
        patchEvent(el, event, nextProp as EventListener);
    } else {
        if (nextProp === undefined || nextProp === null) {
            el.removeAttribute(key);
        } else {
            el.setAttribute(key, nextProp as string);
        }
    }
}

function insert(el: HTMLElement, parent: HTMLElement): void {
    parent.append(el);
}

const renderer: any = createRenderer({
    createElement,
    patchProp,
    insert,
});

export function createApp(...args: any[]) {
    return renderer.createApp(...args);
}

export * from '../runtime-core';
