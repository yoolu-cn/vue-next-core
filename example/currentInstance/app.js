import { h, getCurrentInstance } from '../../lib/guide-vue-next-core.esm.js';
import { Foo } from './foo.js';

export const App = {
    name: 'App',
    render() {
        return h('div', {}, [h('div', {}, 'currentInstance demo'), h(Foo)]);
    },

    setup() {
        const instance = getCurrentInstance();
        console.log('APP: ', instance);
    },
};
