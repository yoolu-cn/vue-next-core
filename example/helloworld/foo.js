import { h } from '../../lib/guide-vue-next-core.esm.js';

export const Foo = {
    setup(props) {
        // props.count
        console.log(props);

        // shallowReadonly
        props.count++;
        console.log(props);
    },
    render() {
        return h('div', {}, 'foo: ' + this.count);
    },
};
