'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function addEventListener(el, event, handler, options) {
    el.addEventListener(event, handler, options);
}
function patchEvent(el, rawName, value) {
    addEventListener(el, rawName, value);
}

const extend = Object.assign;
const isObject = (val) => val !== null && typeof val === 'object';
const isArray = Array.isArray;
const hasChanged = (value, oldValue) => !Object.is(value, oldValue);
const isFunction = (val) => typeof val === 'function';
const EMPTY_OBJ = {};
const hasOwnProperty = Object.prototype.hasOwnProperty;
const hasOwn = (val, key) => hasOwnProperty.call(val, key);
const isString = (val) => typeof val === 'string';
const isPromise = (val) => {
    return isObject(val) && isFunction(val.then) && isFunction(val.catch);
};
const onRE = /^on[^a-z]/; // 匹配以 on 开头并且 on 后首字符不为 a-z
const isOn = (key) => onRE.test(key);
const cacheStringFunction = (fn) => {
    const cache = Object.create(null);
    return ((str) => {
        const hit = cache[str];
        return hit || (cache[str] = fn(str));
    });
};
const camelizeRE = /-(\w)/g;
/**
 * @private
 */
const camelize = cacheStringFunction((str) => {
    return str.replace(camelizeRE, (_, c) => (c ? c.toUpperCase() : ''));
});
const hyphenateRE = /\B([A-Z])/g;
/**
 * @private
 */
const hyphenate = cacheStringFunction((str) => str.replace(hyphenateRE, '-$1').toLowerCase());
/**
 * @private
 */
const capitalize = cacheStringFunction((str) => str.charAt(0).toUpperCase() + str.slice(1));
/**
 * @private
 */
const toHandlerKey = cacheStringFunction((str) => str ? `on${capitalize(str)}` : ``);

const createDep = (effects) => {
    const dep = new Set(effects);
    dep.w = 0;
    dep.n = 0;
    return dep;
};

let activeEffect;
let shouldTrack;
const targetMap = new Map();
// const targetMap = new WeakMap();
class ReactiveEffect {
    constructor(fn, scheduler) {
        this.fn = fn;
        this.scheduler = scheduler;
        this.deps = [];
        this.active = true;
    }
    run() {
        // 会依赖收集
        // 使用 shouldTrack 来区分
        if (!this.active) {
            return this.fn();
        }
        shouldTrack = true;
        activeEffect = this;
        const result = this.fn();
        // 收集完依赖后 reset 全局变量
        shouldTrack = false;
        return result;
    }
    stop() {
        if (this.active) {
            clearupEffect(this);
            if (this.onStop) {
                this.onStop();
            }
            this.active = false;
        }
    }
}
function clearupEffect(effect) {
    effect.deps.forEach((dep) => {
        dep.delete(effect);
    });
}
function isTracking() {
    return shouldTrack && activeEffect !== undefined;
}
function track(target, key) {
    if (!isTracking()) {
        return;
    }
    let depsMap = targetMap.get(target);
    if (!depsMap) {
        targetMap.set(target, (depsMap = new Map()));
    }
    let dep = depsMap.get(key);
    if (!dep) {
        depsMap.set(key, (dep = createDep()));
    }
    trackEffects(dep);
}
function trackEffects(dep) {
    if (dep.has(activeEffect)) {
        return;
    }
    dep.add(activeEffect);
    activeEffect.deps.push(dep);
}
function trigger(target, key) {
    const depsMap = targetMap.get(target);
    if (!depsMap) {
        // never been tracked
        return;
    }
    const deps = depsMap.get(key);
    triggerEffects(deps);
}
function triggerEffects(dep) {
    for (let effect of isArray(dep) ? dep : [...dep]) {
        if (effect.scheduler) {
            effect.scheduler();
        }
        else {
            effect.run();
        }
    }
}
function effect(fn, options) {
    const _effect = new ReactiveEffect(fn);
    if (options) {
        extend(_effect, options);
    }
    _effect.run();
    const runner = _effect.run.bind(_effect);
    runner.effect = _effect;
    return runner;
}

const get = createGetter();
const readonlyGet = createGetter(true);
const shallowReactiveGet = createGetter(false, true);
const shallowReadonlyGet = createGetter(true, true);
const set = createSetter();
function createGetter(isReadonly = false, isShallow = false) {
    return function get(target, key) {
        if (key === "__v_isReactive" /* IS_REACTIVE */) {
            return !isReadonly;
        }
        else if (key === "__v_isReadonly" /* IS_READONLY */) {
            return isReadonly;
        }
        else if (key === "__v_isShallow" /* IS_SHALLOW */) {
            return isShallow;
        }
        const res = Reflect.get(target, key);
        if (isShallow) {
            return res;
        }
        if (!isReadonly) {
            // 依赖收集
            track(target, key);
        }
        if (isObject(res)) {
            return isReadonly ? readonly(res) : reactive(res);
        }
        return res;
    };
}
function createSetter() {
    return function set(target, key, value) {
        const res = Reflect.set(target, key, value);
        // 触发依赖
        trigger(target, key);
        return res;
    };
}
const mutableHandlers = {
    get,
    set,
};
const readonlyHandlers = {
    get: readonlyGet,
    set(target, key, value) {
        console.warn(`Set operation on key "${String(key)}" failed: target is readonly.`, target);
        return true;
    },
};
const shallowReadonlyHandlers = extend({}, readonlyHandlers, {
    get: shallowReadonlyGet,
});
const shallowReactiveHandlers = extend({}, mutableHandlers, {
    get: shallowReactiveGet,
});

function reactive(target) {
    return createReactiveObject(target, false, mutableHandlers);
}
function readonly(target) {
    return createReactiveObject(target, true, readonlyHandlers);
}
function shallowReactive(target) {
    return createReactiveObject(target, false, shallowReactiveHandlers);
}
function shallowReadonly(target) {
    return createReactiveObject(target, true, shallowReadonlyHandlers);
}
function createReactiveObject(target, isReadonly = false, baseHandlers) {
    return new Proxy(target, baseHandlers);
}
function isReadonly(value) {
    return !!(value && value["__v_isReadonly" /* IS_READONLY */]);
}
function isReactive(value) {
    return !!(value && value["__v_isReactive" /* IS_REACTIVE */]);
}
function isShallow(value) {
    return !!(value && value["__v_isShallow" /* IS_SHALLOW */]);
}
function isProxy(value) {
    return isReactive(value) || isReadonly(value);
}
function toReactive(value) {
    return isObject(value) ? reactive(value) : value;
}
function toRaw(observed) {
    const raw = observed && observed["__v_raw" /* RAW */];
    return raw ? toRaw(raw) : observed;
}

class RefImpl {
    constructor(value) {
        this.dep = undefined;
        this.__is_ref = true;
        this._value = toReactive(value);
        this._rawValue = value;
    }
    get value() {
        trackRefValue(this);
        return this._value;
    }
    set value(newVal) {
        if (hasChanged(newVal, this._rawValue)) {
            this._value = toReactive(newVal);
            this._rawValue = newVal;
            triggerRefValue(this);
        }
    }
}
function trackRefValue(ref) {
    if (isTracking()) {
        ref = toRaw(ref);
        trackEffects(ref.dep || (ref.dep = createDep()));
    }
}
function triggerRefValue(ref) {
    ref = toRaw(ref);
    triggerEffects(ref.dep || (ref.dep = createDep()));
}
function ref(value) {
    return new RefImpl(value);
}
function isRef(r) {
    return !!(r && r.__is_ref === true);
}
function unref(ref) {
    return isRef(ref) ? ref.value : ref;
}
const shallowUnwrapHandlers = {
    /**
     * 如果里面是一个 ref 类型，直接返回 .value
     * 如果不是一个 ref 类型，直接返回原 value
     */
    get: (target, key) => unref(Reflect.get(target, key)),
    /**
     * 如果初始值和新值都是 ref 类型， 直接替换ref
     * 如果初始值为 ref 新值不是 ref 类型, 则需要把新值 set 到初始值 ref 的 value
     */
    set(target, key, value) {
        const oldValue = target[key];
        if (isRef(oldValue) && !isRef(value)) {
            return (target[key].value = value);
        }
        else {
            return Reflect.set(target, key, value);
        }
    },
};
function proxyRefs(objectWithRefs) {
    return isReactive(objectWithRefs)
        ? objectWithRefs
        : new Proxy(objectWithRefs, shallowUnwrapHandlers);
}

function callWithErrorHandling(fn, instance, type, args) {
    let res;
    try {
        res = args ? fn(...args) : fn();
    }
    catch (err) {
        // handleError(err, instance, type);
    }
    return res;
}
function callWithAsyncErrorHandling(fn, instance, type, args) {
    if (isFunction(fn)) {
        const res = callWithErrorHandling(fn, instance, type, args);
        if (res && isPromise(res)) {
            res.catch((err) => {
                // handleError(err, instance, type);
            });
        }
        return res;
    }
    const values = [];
    for (let i = 0; i < fn.length; i++) {
        values.push(callWithAsyncErrorHandling(fn[i], instance, type, args));
    }
    return values;
}

function emit(instance, event, ...args) {
    console.log('active', event, ...args);
    const { props } = instance;
    let handler = props[(toHandlerKey(event))] ||
        props[(toHandlerKey(camelize(event)))];
    if (!handler) {
        handler = props[(toHandlerKey(hyphenate(event)))];
    }
    if (handler) {
        callWithAsyncErrorHandling(handler, instance, 6 /* COMPONENT_EVENT_HANDLER */, args);
    }
}

function initProps(instance, rawProps) {
    instance.props = rawProps || {};
}

const publicPropertiesMap = extend(Object.create(null), {
    $el: (i) => i.vnode.el,
    $slots: (i) => i.slots,
});
const PublicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        const { setupState, props } = instance;
        if (hasOwn(setupState, key)) {
            return setupState[key];
        }
        else if (hasOwn(props, key)) {
            return props[key];
        }
        const publicGetter = publicPropertiesMap[key];
        if (publicGetter) {
            return publicGetter(instance);
        }
    },
};

function initSlots(instance, children) {
    const { vnode } = instance;
    if (vnode.shapeFlag & 32 /* SLOTS_CHILDREN */) {
        normalizeObjectSlots(children, instance.slots);
    }
}
function normalizeObjectSlots(children, slots) {
    for (let key in children) {
        const slot = children[key];
        slots[key] = (props) => slot && normalizeSlotValue(slot(props));
    }
}
function normalizeSlotValue(value) {
    return isArray(value) ? value : [value];
}

let currentInstance = null;
function createComponentInstance(vnode, parent) {
    const instance = {
        vnode,
        type: vnode.type,
        setupState: {},
        ctx: {},
        effect: null,
        proxy: null,
        subTree: null,
        render: null,
        emit: null,
        slots: {},
        provides: parent ? parent.provides : {},
        parent,
        isMounted: false,
    };
    instance.ctx = { _: instance };
    instance.emit = emit.bind(null, instance);
    return instance;
}
function setupComponent(instance) {
    initProps(instance, instance.vnode.props);
    initSlots(instance, instance.vnode.children);
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    const Component = instance.type;
    instance.proxy = new Proxy(instance.ctx, PublicInstanceProxyHandlers);
    const { setup } = Component;
    if (setup) {
        setCurrentInstance(instance);
        // function Object
        const setupResult = setup(shallowReadonly(instance.props), {
            emit: instance.emit,
        });
        setCurrentInstance(null);
        handleSetupResult(instance, setupResult);
    }
}
function handleSetupResult(instance, setupResult) {
    // function Object
    // TODO  function
    if (typeof setupResult === 'object') {
        instance.setupState = proxyRefs(setupResult);
    }
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    const Component = instance.type;
    if (Component.render) {
        instance.render = Component.render;
    }
}
function getCurrentInstance() {
    return currentInstance;
}
function setCurrentInstance(instance) {
    currentInstance = instance;
}

const Fragment = Symbol('Fragment');
const Text = Symbol('Text');
function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        children,
        shapeFlag: getShapeFlag(type),
        el: null,
    };
    if (isString(children)) {
        vnode.shapeFlag |= 8 /* TEXT_CHILDREN */;
    }
    else if (isArray(children)) {
        vnode.shapeFlag |= 16 /* ARRAY_CHILDREN */;
    }
    if (vnode.shapeFlag & 4 /* STATEFUL_COMPONENT */) {
        if (isObject(children)) {
            vnode.shapeFlag |= 32 /* SLOTS_CHILDREN */;
        }
    }
    return vnode;
}
function getShapeFlag(type) {
    return isString(type) ? 1 /* ELEMENT */ : 4 /* STATEFUL_COMPONENT */;
}
function createTextVNode(value) {
    return createVNode(Text, {}, value);
}

function createAppAPI(render) {
    return function createApp(rootComponent) {
        return {
            mount(rootContainer) {
                // 先将 rootComponent 转化为 vnode
                // 所有逻辑操作都基于 vnode
                const vnode = createVNode(rootComponent);
                render(vnode, rootContainer);
            },
        };
    };
}

function createRenderer(options) {
    const { createElement: hostCreateElement, patchProp: hostPatchProp, insert: hostInsert, } = options;
    function render(vnode, container) {
        // patch
        patch(null, vnode, container, null);
    }
    function patch(n1, n2, container, parent) {
        switch (n2.type) {
            case Fragment:
                processFragment(n1, n2, container, parent);
                break;
            case Text:
                processText(n1, n2, container);
                break;
            default:
                /**
                 * 判断 vnode 是不是一个 element， 区别处理 element 和 component
                 */
                const { shapeFlag } = n2;
                if (shapeFlag & 1 /* ELEMENT */) {
                    // 处理 element
                    processElement(n1, n2, container, parent);
                }
                else if (shapeFlag & 4 /* STATEFUL_COMPONENT */) {
                    // 处理组件
                    processComponent(n1, n2, container, parent);
                }
                break;
        }
    }
    function processElement(n1, n2, container, parent) {
        if (!n1) {
            mountElement(n2, container, parent);
        }
        else {
            patchElement(n1, n2);
        }
    }
    function processComponent(n1, n2, container, parent) {
        mountComponent(n2, container, parent);
    }
    function processFragment(n1, n2, container, parent) {
        mountChildren(n2.children, container, parent);
    }
    function processText(n1, n2, container) {
        const el = (n2.el = document.createTextNode(n2.children));
        container.append(el);
    }
    function mountElement(vnode, container, parent) {
        const el = (vnode.el = hostCreateElement(vnode.type));
        const { props, children, shapeFlag } = vnode;
        if (shapeFlag & 8 /* TEXT_CHILDREN */) {
            el.textContent = children;
        }
        else if (shapeFlag & 16 /* ARRAY_CHILDREN */) {
            mountChildren(children, el, parent);
        }
        if (props) {
            for (const key in props) {
                const val = props[key];
                hostPatchProp(el, key, null, val);
            }
        }
        hostInsert(el, container);
    }
    function patchElement(n1, n2, container) {
        console.log('update element');
        console.log('n1', n1);
        console.log('n2', n2);
        const el = (n2.el = n1.el);
        const oldProps = n1.props || EMPTY_OBJ;
        const newProps = n2.props || EMPTY_OBJ;
        patchProps(el, oldProps, newProps);
    }
    function patchProps(el, oldProps, newProps) {
        /**
         * @todo 这里有bug 对象之前判断永远不相等 除非 oldProps 和 newProps 都为 EMPTY_OBJ
         */
        if (oldProps !== newProps) {
            for (const key in newProps) {
                const prevProp = oldProps[key];
                const nextProp = newProps[key];
                if (prevProp !== nextProp) {
                    hostPatchProp(el, key, prevProp, nextProp);
                }
            }
            if (oldProps == EMPTY_OBJ) {
                return;
            }
            for (const key in oldProps) {
                if (!(key in newProps)) {
                    hostPatchProp(el, key, oldProps[key], null);
                }
            }
        }
    }
    function mountChildren(children, el, parent) {
        children.forEach((vnode) => {
            patch(null, vnode, el, parent);
        });
    }
    function mountComponent(vnode, container, parent) {
        const instance = createComponentInstance(vnode, parent);
        setupComponent(instance);
        setupRenderEffect(instance, vnode, container);
    }
    function setupRenderEffect(instance, vnode, container) {
        effect(() => {
            if (!instance.isMounted) {
                console.log('init');
                const { proxy } = instance;
                const subTree = (instance.subTree = instance.render.call(proxy));
                patch(null, subTree, container, instance);
                vnode.el = subTree.el;
                instance.isMounted = true;
            }
            else {
                console.log('update');
                const { proxy } = instance;
                const prevSubTree = instance.subTree;
                const subTree = (instance.subTree = instance.render.call(proxy));
                patch(prevSubTree, subTree, container, instance);
                vnode.el = subTree.el;
            }
        });
    }
    return {
        createApp: createAppAPI(render),
    };
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

function renderSlot(slots, name, props) {
    const slot = slots[name];
    if (slot) {
        if (isFunction(slot)) {
            return createVNode(Fragment, {}, slot(props));
        }
    }
}

function provide(key, value) {
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        let { provides } = currentInstance;
        const parentProvides = currentInstance.parent.provides;
        /**
         * 继承父组件的 provides 只需要组件 init 的时候执行一次
         * 判断组件 init 的方法：
         * 1. component => createComponentInstance
         * 2. createComponentInstance 中 设置当前组件的 provides 为 parent.provides, 可以通过 provides === parent.provides 来判断
         */
        if (provides === parentProvides) {
            /**
             * 必须同时赋值给 provides 和 currentInstance.provides
             * provides 在定义时指向 currentInstance.provides，但是当赋值操作后，指向赋值的对象，之后 provides 的修改和 currentInstance.provides 无关
             * Object.create 知识点原型链
             */
            provides = currentInstance.provides = Object.create(parentProvides);
        }
        provides[key] = value;
    }
}
function inject(key, defaultValue) {
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        const parentProvides = currentInstance.parent.provides;
        if (key in parentProvides) {
            return parentProvides[key];
        }
        else if (isFunction(defaultValue)) {
            return defaultValue();
        }
        else {
            return defaultValue;
        }
    }
}

function createElement(type) {
    return document.createElement(type);
}
function patchProp(el, key, prevProp, nextProp) {
    if (isOn(key)) {
        const event = key.slice(2).toLowerCase();
        patchEvent(el, event, nextProp);
    }
    else {
        if (nextProp === undefined || nextProp === null) {
            el.removeAttribute(key);
        }
        else {
            el.setAttribute(key, nextProp);
        }
    }
}
function insert(el, parent) {
    parent.append(el);
}
const renderer = createRenderer({
    createElement,
    patchProp,
    insert,
});
function createApp(...args) {
    return renderer.createApp(...args);
}

exports.createApp = createApp;
exports.createRenderer = createRenderer;
exports.createTextVNode = createTextVNode;
exports.getCurrentInstance = getCurrentInstance;
exports.h = h;
exports.inject = inject;
exports.isProxy = isProxy;
exports.isReactive = isReactive;
exports.isReadonly = isReadonly;
exports.isShallow = isShallow;
exports.provide = provide;
exports.reactive = reactive;
exports.readonly = readonly;
exports.ref = ref;
exports.renderSlot = renderSlot;
exports.shallowReactive = shallowReactive;
exports.shallowReadonly = shallowReadonly;
exports.toRaw = toRaw;
exports.toReactive = toReactive;
