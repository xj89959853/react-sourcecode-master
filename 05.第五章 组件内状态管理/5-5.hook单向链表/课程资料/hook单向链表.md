# hook单向链表

### 思考部分：

1、当有多个hook的时候，如何保存每个hook对象？使用链表的方式。不用数组是因为数组需要连续存储空间，而react框架并不能确定开发者在使用时会创建多少个hook和页面复杂度，所以使用数组结构风险更大

2、为什么是单向链表？符合函数执行逻辑，函数执行是顺序执行，函数内部定义的所有hook都会执行，只需要单向链表顺序从上到下执行一遍即可。对于hook对象本身来说，它是单向的。

3、什么时候构建链表结构？mount阶段，mount阶段会创建hook对象，而update阶段是使用已存在的hook

4、如何构建链表？参考workLoop，设置一个可以存储当前处理的hook的全局变量，根据这个变量是否有值来决定当前创建的hook放在什么位置。

### 实操部分：

1、修改FiberHook.ts

```typescript
export type Hook={
    memoizedState:any,
    next:Hook|null,
}

// 当前工作的hook
let workInProgressHook:Hook|null=null;

/**
 * mount阶段创建hook对象
 * @param initialState 初始状态
 * @returns hook对象
 */
function mountWorkInProgressHook(initialState:any){
    const hook:Hook={
        memoizedState:initialState,
        next:null,
    }
    if(workInProgressHook === null){
        currentlyRenderingFiber!.memoizedState = hook;
    }else{
        workInProgressHook!.next = hook;
    }
    workInProgressHook = hook;
    return hook;
}

/**
 * 首次构建时状态管理的hook
 * 1、创建一个hook
 * 2、返回状态和更新状态的方法
 * @param initialState 初始状态
 * @returns [state,setState]
 */
export function mountState(initialState:any){
    const hook=mountWorkInProgressHook(initialState);
    return [hook.memoizedState,setState];
}
```




