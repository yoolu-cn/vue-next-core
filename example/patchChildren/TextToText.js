import { ref, h } from '../../lib/guide-vue-next-core.esm.js';

const nextChildren = 'newChild';
const prevChildren = 'oldChild';

export default {
    name: 'TextToText',
    setup() {
        const isChange = ref(false);
        window.isChange = isChange;

        return {
            isChange,
        };
    },
    render() {
        const self = this;

        return self.isChange === true ? h('div', {}, nextChildren) : h('div', {}, prevChildren);
    },
};
