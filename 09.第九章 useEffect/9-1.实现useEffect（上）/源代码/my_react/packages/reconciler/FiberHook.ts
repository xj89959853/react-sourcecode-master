import { Fiber } from "./ReactInternalTypes";
import { scheduleUpdateOnFiber } from "./WorkLoop";
import { ReactSharedInternals } from "../react";
import { getRootForUpdateFiber } from "./WorkLoop";
import { PassiveEffect } from "./FiberFlags";
type HookFlags = number;
export const NoFlags = 0b0000;
export const HasEffect = 0b0001;
export type Hook={
    memoizedState:any,
    dispatch:any,
    next:Hook|null,
}
export type SimpleEffect={
    tag:HookFlags,
    deps:any[]|null,
    create:()=>(()=>void|void),
    destroy:(()=>void)|null,
}
// 当前正在渲染的fiber
let currentlyRenderingFiber:Fiber|null=null;
// 当前工作的hook
let workInProgressHook:Hook|null=null;
// current树上对应的当前的hook的hook
let currentHook:Hook|null=null;

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
    const fiberRoot = getRootForUpdateFiber(fiber)
    scheduleUpdateOnFiber(fiberRoot!);
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
    const current = currentlyRenderingFiber!.alternate;
    if(current){
        if(currentHook === null){
            currentHook = current.memoizedState;
        }else{
            currentHook = currentHook.next;
        }
    }
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
 * 创建effect对象
 * @param create 创建effect的函数
 * @param deps 依赖项
 * @returns effect对象
 */
function pushSimpleEffect(tag:HookFlags,create:()=>(()=>void|void),deps:any[]|null){
    const effect:SimpleEffect={
        tag,
        create,
        destroy:null,
        deps,
    }
    return effect;
}
/**
 * 判断依赖项是否相等
 * @param prevDeps 前一个依赖项
 * @param nextDeps 后一个依赖项
 * @returns 是否相等
 */
function areHookInputsEqual(prevDeps:any[]|null,nextDeps:any[]|null){
    if(prevDeps === null || nextDeps === null){
        return false;
    }
    for(let i=0;i<prevDeps.length;i++){
        if(prevDeps[i] !== nextDeps[i]){
            return false;
        }
    }
    return true;
}

/**
 * 首次构建时effect的hook
 * 1、创建一个hook
 * 2、修改fiber的flags
 * 3、设置memoizedState为effect对象
 * @param create 创建effect的函数
 * @param createDeps 依赖项
 */
export function mountEffect(create:()=>(()=>void|void),createDeps?:any[]){
    const hook = mountWorkInProgressHook(null);
    const deps = createDeps === undefined ? null : createDeps;
    currentlyRenderingFiber!.flags |= PassiveEffect;
    hook.memoizedState = pushSimpleEffect(HasEffect,create,deps);
}
/**
 * 更新时effect的hook
 * 1、获取当前hook
 * 2、设置fiber的flags
 * 3、设置memoizedState为effect对象
 * @param create 创建effect的函数
 * @param createDeps 依赖项
 */
export function updateEffect(create:()=>(()=>void|void),createDeps?:any[]){
    const hook = updateWorkInProgressHook();
    const nextDeps = createDeps === undefined ? null : createDeps;
    if(currentHook){
        if(nextDeps){
            const prevDeps = currentHook!.memoizedState.deps;
            if(areHookInputsEqual(prevDeps,nextDeps)){
                hook!.memoizedState = pushSimpleEffect(NoFlags,create,nextDeps);
                return;
            }
        }
    }
    currentlyRenderingFiber!.flags |= PassiveEffect;
    hook!.memoizedState = pushSimpleEffect(HasEffect,create,nextDeps);
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
        ReactSharedInternals.H = {useState:mountState,useEffect:mountEffect};
    }else{ 
        ReactSharedInternals.H = {useState:updateState,useEffect:updateEffect};
    }
    const result = Component();
    workInProgressHook = null;
    return result;
}


