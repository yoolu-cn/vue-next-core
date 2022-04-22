import { camelize, hyphenate, toHandlerKey } from '../shared';
import { callWithAsyncErrorHandling, ErrorCodes } from './errorHandling';

export function emit(instance: any, event: string, ...args: any) {
    console.log('active', event, ...args);
    const { props } = instance;

    // 1. 处理 add => onAdd
    // 2. 处理 add-foo => onAddFoo

    let handlerName;
    let handler =
        props[(handlerName = toHandlerKey(event))] ||
        props[(handlerName = toHandlerKey(camelize(event)))];

    if (!handler) {
        handler = props[(handlerName = toHandlerKey(hyphenate(event)))];
    }

    if (handler) {
        callWithAsyncErrorHandling(handler, instance, ErrorCodes.COMPONENT_EVENT_HANDLER, args);
    }
}
