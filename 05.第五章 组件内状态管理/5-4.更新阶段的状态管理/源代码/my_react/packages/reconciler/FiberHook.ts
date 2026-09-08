import { Fiber } from "./ReactInternalTypes";
import { updateOnFiber } from "./WorkLoop";

export type Hook={
    memoizedState:any,
}
// 当前正在渲染的fiber
let currentlyRenderingFiber:Fiber|null=null;
/**
 * 更新组件状态值
 * 1、更改状态值
 * 2、重新渲染组件
 * @param newState 新的状态值
 */
function setState(newState:any){
    const hook = currentlyRenderingFiber!.memoizedState;
    hook.memoizedState = newState;
    updateOnFiber(currentlyRenderingFiber!);
}

/**
 * 首次构建时状态管理的hook
 * 1、创建一个hook
 * 2、将hook挂载到fiber的memoizedState上
 * 3、返回状态和更新状态的方法
 * @param initialState 初始状态
 * @returns [state,setState]
 */
export function mountState(initialState:any){
    const hook={
        memoizedState:initialState,
    }
    currentlyRenderingFiber!.memoizedState = hook;
    return [hook.memoizedState,setState];
}

/**
 * 更新时状态管理的hook
 * 1、获取当前fiber的hook
 * 2、返回状态和更新状态的方法
 * @param 
 * @returns [state,setState]
 */
export function updateState(){
    const hook = currentlyRenderingFiber!.memoizedState;
    return [hook.memoizedState,setState];
} 
// 定义一个导出当前状态的hook
export let useState:any=null;
/**
 * 渲染函数组件，考虑hooks，并返回组件的返回值
 * 1、设置当前正在渲染的fiber
 * 2、执行函数组件的函数
 * @param workInProgress 当前正在渲染的fiber
 * @param Component 函数组件
 * @returns 组件的返回值
 */
export function renderWithHooks(workInProgress:Fiber, Component:any) {
    currentlyRenderingFiber = workInProgress;
    if(currentlyRenderingFiber!.memoizedState === null){
        useState = mountState;
    }else{
        useState = updateState;
    }
    return Component();
}
