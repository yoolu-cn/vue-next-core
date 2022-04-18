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
                onClick: () => {
                    console.log('click');
                },
                onMouseDown: () => {
                    console.log('MouseDown');
                },
            },
            [h('div', {}, 'hello, ' + this.msg), h(Foo, { count: 1 })]
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
