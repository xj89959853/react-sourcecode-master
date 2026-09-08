import { Fiber } from "./ReactInternalTypes";
import { updateOnFiber } from "./WorkLoop";
import { ReactSharedInternals } from "../react";

export type Hook={
    memoizedState:any,
    dispatch:any,
    next:Hook|null,
}
// 当前正在渲染的fiber
let currentlyRenderingFiber:Fiber|null=null;
// 当前工作的hook
let workInProgressHook:Hook|null=null;


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
 * mount阶段创建hook对象
 * @param initialState 初始状态
 * @returns hook对象
 */
function mountWorkInProgressHook(initialState:any){
    const hook:Hook={
        memoizedState:initialState,
        dispatch:null,
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
        ReactSharedInternals.H = mountState;
    }else{ 
        ReactSharedInternals.H = updateState;
    }
    const result = Component();
    workInProgressHook = null;
    return result;
}


