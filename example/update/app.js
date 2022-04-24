import { h, ref } from '../../lib/guide-vue-next-core.esm.js';
export const App = {
    name: 'App',
    setup() {
        const count = ref(0);
        const onClick = () => {
            count.value++;
        };

        const props = ref({
            foo: 'foo',
            bar: 'bar',
        });

        const onChangePropsDemo1 = () => {
            props.value.foo = 'new-foo';
        };

        const onChangePropsDemo2 = () => {
            props.value.bar = undefined;
        };

        const onChangePropsDemo3 = () => {
            props.value = {
                foo: 'foo',
            };
        };
        const onChangePropsDemo4 = () => {
            props.value = {
                add: 'add',
                foo: 'foo',
            };
        };
        return {
            count,
            onClick,
            onChangePropsDemo1,
            onChangePropsDemo2,
            onChangePropsDemo3,
            onChangePropsDemo4,
            props,
        };
    },
    render() {
        return h(
            'div',
            {
                id: 'root',
                ...this.props,
            },
            [
                h('div', {}, 'count: ' + this.count),
                h('button', { onClick: this.onClick }, 'click'),
                h('button', { onClick: this.onChangePropsDemo1 }, 'changeProps - 值改变了 - 修改'),
                h(
                    'button',
                    { onClick: this.onChangePropsDemo2 },
                    'changeProps - 值变成了 undefined - 删除'
                ),
                h(
                    'button',
                    { onClick: this.onChangePropsDemo3 },
                    'changeProps - key 在新的里面没有了 - 删除'
                ),
                h(
                    'button',
                    { onClick: this.onChangePropsDemo4 },
                    'changeProps - 在demo3 基础上新增 add Key - 新增'
                ),
            ]
        );
    },
};
