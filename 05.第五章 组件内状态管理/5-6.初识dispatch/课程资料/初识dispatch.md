# 初识dispatch

### 思考部分：

1、既然hook已经是链表结构，也就代表着一个fiber上可能有多个hook，如何让useState返回的setState方法能修改正确的hook呢？就是在每次调用useState的时候，返回的setState都跟状态有关联，是对应hook的专属方法。也就是说，每次返回的setState都是一个新的方法，将一个方法与特定的数据绑定之后形成的新的方法，这个过程就是分发。

2、既然涉及到数据绑定，就需要知道要绑定什么数据。

- fiber：hook是存在fiber上，而且hook对象本身是无法访问所在fiber的，同时触发更新需要fiber

- hook：状态是在hook上，真正更改的其实是hook对象

3、状态是每次创建hook保存的变量，但setState是个方法，怎么实现用setState方法绑定数据再形成新的数据呢？bind方法。再创建hook的时候，获取的currentlyRenderingFiber和workInProgressHook是可以拿到当前的fiber和当前的hook对象，就可以通过bind方法进行分发并且实现数据绑定。



### 实操部分：

1、修改FiberHook.ts

```typescript
/**
 * 分发更新对应状态值的方法
 * 1、更改状态值
 * 2、重新渲染组件
 * @param Fiber hook所在的fiber
 * @param hook 当前的hook
 * @param newState 新的状态值
 */
function dispatchSetState(fiber:Fiber,hook:Hook,newState:any){
    hook.memoizedState = newState;
    updateOnFiber(fiber!);
}
/**
 * update阶段获取当前的hook
 * @returns 当前的hook
 */
function updateWorkInProgressHook(){
    if(workInProgressHook === null){
        workInProgressHook = currentlyRenderingFiber!.memoizedState;
    }else{
        workInProgressHook = workInProgressHook!.next;
    }
    return workInProgressHook;
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
    const dispatch = dispatchSetState.bind(null,currentlyRenderingFiber!,hook);
    hook.dispatch = dispatch;
    return [hook.memoizedState,dispatch];
}
/**
 * 更新时状态管理的hook
 * 1、获取当前fiber的hook
 * 2、返回状态和更新状态的方法
 * @param 
 * @returns [state,setState]
 */
export function updateState(){
    const hook = updateWorkInProgressHook();
    return [hook!.memoizedState,hook!.dispatch];
} 



```
