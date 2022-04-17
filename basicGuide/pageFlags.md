# ShapeFlags 运用到的位运算

## 优化前

```javascript

// shapeFlag 标记 0 为 false, 1 为 true
const ShapeFlags = {
    element: 0,
    stateful_component: 0,
    text_children: 0,
    array_children: 0,
}

const vnode = {
    shapeFlag: ShapeFlags
}
// vnode.type 为 stateful_component 并且 vnode.children 为 array_children

// 设置
vnode.shapeFlag.stateful_component = 1;
vnode.shapeFlag.array_children = 1;
 
// 查找

if (vnode.shapeFlag.stateful_component) {}
if (vnode.shapeFlag.array_children) {}

```


## 优化后


```TypeScript
const enum ShapeFlags {
    ELEMENT = 1, // 0b00000001 => 1
    FUNCTIONAL_COMPONENT = 1 << 1, // 0b00000010 => 2
    STATEFUL_COMPONENT = 1 << 2, // 0b00000100 => 4
    TEXT_CHILDREN = 1 << 3, // 0b00001000 => 8
    ARRAY_CHILDREN = 1 << 4, // 0b00010000 => 16
}

// | (两位都为 0，才为 0)
// & (两位都为 1，才为 1)

// vnode.type 为 stateful_component 并且 vnode.children 为 array_children

const vnode = {
    shapeFlag: 0
}

// 设置
vnode.shapeFlag = ShapeFlags.STATEFUL_COMPONENT | ShapeFlags.ARRAY_CHILDREN;
// vnode.shapeFlag = 0b000100 | 0b010000 => 0b010100 => 20
 
// 查找
// 0b010100 & 0b000100 => 0b000100 => 4
if (vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {}
// 0b010100 & 0b010000 => ob010000 = > 16
if (vnode.shapeFlag & ShapeFlags.ARRAY_CHILDREN) {}
```


## 优化优缺点

优点： 高效
缺点： 代码可读性变差