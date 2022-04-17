type EventValue = Function | Function[];

interface Invoker extends EventListener {
    value: EventValue;
    attached: number;
}
export function addEventListener(
    el: Element,
    event: string,
    handler: EventListener,
    options?: EventListenerOptions
) {
    el.addEventListener(event, handler, options);
}

export function removeEventListener(
    el: Element,
    event: string,
    handler: EventListener,
    options?: EventListenerOptions
) {
    el.removeEventListener(event, handler, options);
}

export function patchEvent(
    el: Element & { _vei?: Record<string, Invoker | undefined> },
    rawName: string,
    value: EventListener
) {
    addEventListener(el, rawName, value);
}
