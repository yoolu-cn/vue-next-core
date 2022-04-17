'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const extend = Object.assign;
const EMPTY_OBJ = {};
const hasOwnProperty = Object.prototype.hasOwnProperty;
const hasOwn = (val, key) => hasOwnProperty.call(val, key);
const isString = (val) => typeof val === 'string';
const onRE = /^on[^a-z]/; // 匹配以 on 开头并且 on 后首字符不为 a-z
const isOn = (key) => onRE.test(key);

const publicPropertiesMap = extend(Object.create(null), {
    $el: (i) => i.vnode.el,
});
const PublicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        const { setupState } = instance;
        if (hasOwn(setupState, key)) {
            return setupState[key];
        }
        const publicGetter = publicPropertiesMap[key];
        if (publicGetter) {
            return publicGetter(instance);
        }
    },
};

function createComponentInstance(vnode) {
    const instance = {
        vnode,
        type: vnode.type,
        setupState: EMPTY_OBJ,
        ctx: EMPTY_OBJ,
        effect: null,
        proxy: null,
        subTree: null,
        render: null,
    };
    instance.ctx = { _: instance };
    return instance;
}
function setupComponent(instance) {
    /**
     * @TODO
     * initProps
     * initSlots
     */
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    const Component = instance.type;
    instance.proxy = new Proxy(instance.ctx, PublicInstanceProxyHandlers);
    const { setup } = Component;
    if (setup) {
        // function Object
        const setupResult = setup();
        handleSetupResult(instance, setupResult);
    }
}
function handleSetupResult(instance, setupResult) {
    // function Object
    // TODO  function
    if (typeof setupResult === 'object') {
        instance.setupState = setupResult;
    }
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    const Component = instance.type;
    if (Component.render) {
        instance.render = Component.render;
    }
}

function addEventListener(el, event, handler, options) {
    el.addEventListener(event, handler, options);
}
function patchEvent(el, rawName, value) {
    addEventListener(el, rawName, value);
}

function render(vnode, container) {
    // patch
    patch(vnode, container);
}
function patch(vnode, container) {
    /**
     * 判断 vnode 是不是一个 element， 区别处理 element 和 component
     */
    const { shapeFlag } = vnode;
    if (shapeFlag & 1 /* ELEMENT */) {
        // 处理 element
        processElement(vnode, container);
    }
    else if (shapeFlag & 4 /* STATEFUL_COMPONENT */) {
        // 处理组件
        processComponent(vnode, container);
    }
}
function processElement(vnode, container) {
    mountElement(vnode, container);
}
function processComponent(vnode, container) {
    mountComponent(vnode, container);
}
function mountElement(vnode, container) {
    const el = (vnode.el = document.createElement(vnode.type));
    const { props, children, shapeFlag } = vnode;
    if (shapeFlag & 8 /* TEXT_CHILDREN */) {
        el.textContent = children;
    }
    else if (shapeFlag & 16 /* ARRAY_CHILDREN */) {
        mountChildren(children, el);
    }
    for (let key in props) {
        const val = props[key];
        if (isOn(key)) {
            const event = key.slice(2).toLowerCase();
            patchEvent(el, event, val);
        }
        else {
            el.setAttribute(key, val);
        }
    }
    container.append(el);
}
function mountChildren(children, el) {
    children.forEach((vnode) => {
        patch(vnode, el);
    });
}
function mountComponent(vnode, container) {
    const instance = createComponentInstance(vnode);
    setupComponent(instance);
    setupRenderEffect(instance, vnode, container);
}
function setupRenderEffect(instance, vnode, container) {
    const { proxy } = instance;
    const subTree = instance.render.call(proxy);
    patch(subTree, container);
    vnode.el = subTree.el;
}

function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        children,
        shapeFlag: getShapeFlag(type),
    };
    vnode.shapeFlag |= isString(children) ? 8 /* TEXT_CHILDREN */ : 16 /* ARRAY_CHILDREN */;
    return vnode;
}
function getShapeFlag(type) {
    return isString(type) ? 1 /* ELEMENT */ : 4 /* STATEFUL_COMPONENT */;
}

function createApp(rootComponent) {
    return {
        mount(rootContainer) {
            // 先将 rootComponent 转化为 vnode
            // 所有逻辑操作都基于 vnode
            const vnode = createVNode(rootComponent);
            render(vnode, rootContainer);
        },
    };
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

exports.createApp = createApp;
exports.h = h;
