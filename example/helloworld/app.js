import { h } from '../../lib/guide-vue-next-core.esm.js';
export const App = {
    render() {
        return h('div', 'hi, ' + this.msg);
    },

    setup() {
        return {
            msg: 'vue-core',
        };
    },
};
