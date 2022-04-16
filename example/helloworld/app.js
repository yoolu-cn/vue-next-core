import { h } from '../../lib/guide-vue-next-core.esm.js';
export const App = {
    render() {
        return h(
            'div',
            { id: 'root', class: 'bg-gray' },
            'hello, ' + this.msg
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
