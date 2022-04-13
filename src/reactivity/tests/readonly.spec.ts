import { isProxy, isReactive, isReadonly, readonly } from '../src/reactive';

describe('reactivity/readonly', () => {
    it('should make nested values readonly', () => {
        const original = { foo: 1, bar: { baz: 2 } };
        const wrapped = readonly(original);
        expect(wrapped).not.toBe(original);
        expect(isProxy(wrapped)).toBe(true);
        expect(isReactive(wrapped)).toBe(false);
        expect(isReadonly(wrapped)).toBe(true);
        expect(isReactive(original)).toBe(false);
        expect(isReadonly(original)).toBe(false);
        expect(isReactive(wrapped.bar)).toBe(false);
        expect(isReadonly(wrapped.bar)).toBe(true);
        expect(isReactive(original.bar)).toBe(false);
        expect(isReadonly(original.bar)).toBe(false);
        // get
        expect(wrapped.foo).toBe(1);
        // has
        expect('foo' in wrapped).toBe(true);
        // ownKeys
        expect(Object.keys(wrapped)).toEqual(['foo', 'bar']);
    });

    it('warn then call set', () => {
        console.warn = jest.fn();

        const user = readonly({
            age: 10,
        });

        user.age = 11;

        expect(console.warn).toBeCalled();
    });

    it('nested reactive', () => {
        const original = {
            nested: {
                foo: 1,
            },
            array: [
                {
                    bar: 2,
                },
            ],
        };

        const observed = readonly(original);

        expect(isReadonly(observed.nested)).toBe(true);
        expect(isReadonly(observed.array)).toBe(true);
        expect(isReadonly(observed.array[0])).toBe(true);
    });
});
