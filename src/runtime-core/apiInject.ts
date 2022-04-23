import { isFunction } from '../shared';
import { getCurrentInstance } from './component';

export function provide(key: string, value: unknown) {
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

export function inject(key: string, defaultValue: unknown) {
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        const parentProvides = currentInstance.parent.provides;

        if (key in parentProvides) {
            return parentProvides[key];
        } else if (isFunction(defaultValue)) {
            return defaultValue();
        } else {
            return defaultValue;
        }
    }
}
