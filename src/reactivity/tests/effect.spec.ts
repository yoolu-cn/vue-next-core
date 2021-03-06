import { effect, stop } from '../src/effect';
import { reactive } from '../src/reactive';

describe('reactivity/effect', () => {
    it('should observe basic properties', () => {
        const user = reactive({
            age: 10,
        });

        let nextAge;
        effect(() => {
            nextAge = user.age + 1;
        });

        expect(nextAge).toBe(11);

        // update
        user.age++;
        expect(nextAge).toBe(12);
    });

    it('should return runner when call effect', () => {
        /**
         * effect(fn) 返回一个 function runner
         * function runner 调用执行 fn 返回 return
         */
        let foo = 10;
        const runner = effect(() => {
            foo++;
            return 'foo';
        });

        expect(foo).toBe(11);
        let r = runner();
        expect(foo).toBe(12);
        expect(r).toBe('foo');
    });

    it('scheduler', () => {
        let run: any;
        let dummy;
        const scheduler = jest.fn(() => {
            run = runner;
        });
        const obj = reactive({ foo: 1 });
        const runner = effect(
            () => {
                dummy = obj.foo;
            },
            { scheduler }
        );

        expect(scheduler).not.toHaveBeenCalled();
        expect(dummy).toBe(1);
        // should be called on first trigger
        obj.foo++;

        expect(scheduler).toHaveBeenCalledTimes(1);

        // should not run yet
        expect(dummy).toBe(1);
        // manually run
        run();
        // should have run
        expect(dummy).toBe(2);
    });

    it('stop', () => {
        let dummy;
        const obj = reactive({ prop: 1 });
        const runner = effect(() => {
            dummy = obj.prop;
        });
        obj.prop = 2;
        expect(dummy).toBe(2);
        stop(runner);
        // set
        // obj.prop = 3;
        // get -> set
        obj.prop++;

        expect(dummy).toBe(2);

        // stopped effect should still be manually callable
        runner();
        expect(dummy).toBe(3);
    });

    it('onStop', () => {
        const obj = reactive({
            foo: 1,
        });

        const onStop = jest.fn();
        let dummy;

        const runner = effect(
            () => {
                dummy = obj.foo;
            },
            {
                onStop,
            }
        );

        stop(runner);

        expect(onStop).toBeCalledTimes(1);
    });

    // it('should observe delete operations', () => {
    //     let dummy;
    //     const obj = reactive({ prop: 'value' });
    //     effect(() => (dummy = obj.prop));

    //     expect(dummy).toBe('value');
    //     // @ts-ignore
    //     delete obj.prop;
    //     expect(dummy).toBe(undefined);
    // });

    it('should handle multiple effects', () => {
        let dummy1, dummy2;
        const counter = reactive({ num: 0 });
        effect(() => (dummy1 = counter.num));
        effect(() => (dummy2 = counter.num));

        expect(dummy1).toBe(0);
        expect(dummy2).toBe(0);
        counter.num++;
        expect(dummy1).toBe(1);
        expect(dummy2).toBe(1);
    });
});
