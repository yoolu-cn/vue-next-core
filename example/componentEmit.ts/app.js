import { h } from '../../lib/guide-vue-next-core.esm.js';
import { Foo } from './foo.js';
window.self = null;
export const App = {
    render() {
        window.self = this;
        return h(
            'div',
            {
                id: 'root',
                class: 'bg-gray',
            },
            [
                h('div', {}, 'hello, ' + this.msg),
                h(Foo, {
                    count: 1,
                    onAdd(a, b) {
                        console.log('on add', a, b);
                    },
                    async onAddFoo(a, b) {
                        const c = await new Promise((resolve, reject) => resolve(2));
                        console.log('on add-foo', a, b, c);
                    },
                }),
            ]
            // 'hello world'
            // [h('p', { class: 'red' }, 'hello'), h('p', { class: 'blue' }, 'world')]
        );
    },

    setup() {
        return {
            msg: 'vue-core',
        };
    },
};
