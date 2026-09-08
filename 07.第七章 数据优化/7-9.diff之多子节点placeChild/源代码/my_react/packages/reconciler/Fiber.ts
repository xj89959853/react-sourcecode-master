import type { Fiber,WorkTag } from "./ReactInternalTypes";
import type { ReactElement } from "shared/ReactElementType";
import { FunctionComponent,HostComponent,HostText,HostRoot } from "./ReactInternalTypes";
import { NoFlags } from "./FiberFlags";

export function createFiber(tag:WorkTag,key:string|null,pendingProps:any):Fiber{
    const fiber:Fiber = {
        tag,
        key,
        elementType:null,
        type:null,
        stateNode:null,
        return:null,
        child:null,
        sibling:null,
        ref:null,
        pendingProps,
        memoizedState:null,
        alternate:null,
        flags:NoFlags,
        deletions:null,
        index:0,
    }
    return fiber;
}

export function createFiberFromTypeAndProps(type:any,pendingProps:any,key:string|null):Fiber{
    let fiberTag:WorkTag = typeof type === 'function' ? FunctionComponent : HostComponent;
    const fiber = createFiber(fiberTag,key,pendingProps);
    fiber.type = type;
    return fiber;

}
//ReactElement ->Fiber
export function createFiberFromElement(element:ReactElement):Fiber{
    const {type,props,key}=element;
    const fiber = createFiberFromTypeAndProps(type,props,key);
    return fiber;
}

// 创建纯文本fiber
export function createFiberFromText(text:string):Fiber{
    const fiber = createFiber(HostText,null,text);
    return fiber;
}

// 创建HostRootFiber的方法
export function createHostRootFiber():Fiber{
    const fiber = createFiber(HostRoot,null,null);
    return fiber;
}

/**
 * 创建工作中的fiber
 * 作用：根据已有节点，返回副本
 * @param current 当前的fiber
 * @param pendingProps props
 * @returns 工作中的fiber
 */
export function createWorkInProgress(current:Fiber,pendingProps:any):Fiber{
    let workInProgress = current.alternate;
    if(workInProgress === null){
        workInProgress = createFiber(current.tag,current.key,pendingProps);
        workInProgress.type = current.type;
        workInProgress.stateNode = current.stateNode;
        workInProgress.alternate = current;
        current.alternate = workInProgress;
    }else{
        workInProgress.pendingProps = pendingProps; 
    }
    workInProgress.memoizedState = current.memoizedState;
    return workInProgress;
} 

