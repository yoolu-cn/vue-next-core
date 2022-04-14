export function createComponentInstance(vnode: any) {
    const component = {
        vnode,
        type: vnode.type,
    };
    return component;
}

export function setupComponent(instance: any) {
    /**
     * @TODO
     * initProps
     * initSlots
     */

    setupStatefulComponent(instance);
}

function setupStatefulComponent(instance: any) {
    const Component = instance.vnode.type;

    const { setup } = Component;

    if (setup) {
        // function Object
        const setupResult = setup();

        handleSetupResult(instance, setupResult);
    }
}
function handleSetupResult(instance: any, setupResult: object | Function) {
    // function Object
    // TODO  function

    if (typeof setupResult === 'object') {
        instance.setupState = setupResult;
    }

    finishComponentSetup(instance);
}

function finishComponentSetup(instance: any) {
    const Component = instance.type;

    if (Component.render) {
        instance.render = Component.render;
    }
}
