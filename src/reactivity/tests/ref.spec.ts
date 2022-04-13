import { effect } from '../src/effect';
import { reactive } from '../src/reactive';
import { isRef, proxyRefs, ref, unref } from '../src/ref';

describe('ref', () => {
    it('should be reactive', () => {
        const a = ref(1);
        let dummy;
        let calls = 0;
        effect(() => {
            calls++;
            dummy = a.value;
        });
        expect(calls).toBe(1);
        expect(dummy).toBe(1);
        a.value = 2;
        expect(calls).toBe(2);
        expect(dummy).toBe(2);
        // same value should not trigger
        a.value = 2;
        expect(calls).toBe(2);
        expect(dummy).toBe(2);
    });

    it('should make nested properties reactive', () => {
        const a = ref({
            count: 1,
        });
        let dummy;
        effect(() => {
            dummy = a.value.count;
        });
        expect(dummy).toBe(1);
        a.value.count = 2;
        expect(dummy).toBe(2);
    });

    it('proxyRefs', () => {
        const user = {
            age: ref(10),
            name: 'xiaohong',
        };
        const proxyUser = proxyRefs(user);
        expect(user.age.value).toBe(10);
        expect(proxyUser.age).toBe(10);
        expect(proxyUser.name).toBe('xiaohong');

        (proxyUser as any).age = 20;
        expect(proxyUser.age).toBe(20);
        expect(user.age.value).toBe(20);

        (proxyUser as any).age = ref(10);
        expect(proxyUser.age).toBe(10);
        expect(user.age.value).toBe(10);

        const user2 = reactive({
            age: ref(10),
            name: 'yaojing',
        });
        const proxyUser2 = proxyRefs(user2);
        (proxyUser2 as any).age = 20;
        expect(proxyUser2.age).toBe(20);
    });

    it('isRef', () => {
        const a = ref(1);
        const user = reactive({
            age: 1,
        });
        expect(isRef(a)).toBe(true);
        expect(isRef(1)).toBe(false);
        expect(isRef(user)).toBe(false);
    });

    it('unRef', () => {
        const a = ref(1);
        expect(unref(a)).toBe(1);
        expect(unref(1)).toBe(1);
    });
});
