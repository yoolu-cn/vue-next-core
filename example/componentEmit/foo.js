import { h } from '../../lib/guide-vue-next-core.esm.js';

export const Foo = {
    setup(props, { emit }) {
        console.log(props);
        const emitAdd = () => {
            console.log('emit add');
            emit('add', 1, 2);
            console.log('emit add-foo');
            emit('add-foo', 3, 4);
        };
        return {
            emitAdd,
        };
    },
    render() {
        const foo = h('p', {}, 'foo');
        const btn = h('button', { onClick: this.emitAdd }, 'emitAdd');
        return h('div', {}, [foo, btn]);
    },
};
