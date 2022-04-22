import { h, renderSlot } from '../../lib/guide-vue-next-core.esm.js';

export const Foo = {
    setup() {
        return {};
    },

    render() {
        const foo = h('p', {}, 'foo');
        console.log(this.$slots);
        // 单个slot & 数组slot
        // return h('div', {}, [foo, renderSlot(this.$slots)]);
        // 具名插槽
        // return h('div', {}, [
        //     renderSlot(this.$slots, 'header'),
        //     foo,
        //     renderSlot(this.$slots, 'footer'),
        // ]);
        // 作用域插槽
        const number = 100;
        return h('div', {}, [
            renderSlot(this.$slots, 'header', { number }),
            foo,
            renderSlot(this.$slots, 'footer'),
        ]);
    },
};
