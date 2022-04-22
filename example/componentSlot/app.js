import { h } from '../../lib/guide-vue-next-core.esm.js';
import { Foo } from './foo.js';
window.self = null;
export const App = {
    name: 'App',
    render() {
        const app = h('div', {}, 'App');
        // 1. 单个slot
        // const foo = h(Foo, {}, h('p', {}, '123'));
        // 2. 数组slot
        // const foo = h(Foo, {}, [h('p', {}, '123'), h('p', {}, '456')]);
        // 3. 具名插槽
        // const foo = h(
        //     Foo,
        //     {},
        //     {
        //         header: h('p', {}, 'header'),
        //         footer: h('p', {}, 'footer'),
        //     }
        // );
        // 4. 作用域插槽
        const foo = h(
            Foo,
            {},
            {
                header: ({ number }) => h('p', {}, 'header ' + number),
                footer: () => h('p', {}, 'footer'),
            }
        );

        return h('div', {}, [app, foo]);
    },

    setup() {
        return {};
    },
};
