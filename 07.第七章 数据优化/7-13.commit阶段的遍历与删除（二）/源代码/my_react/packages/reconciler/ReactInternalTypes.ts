import { Flags } from "./FiberFlags";
export type WorkTag = 0|3|5|6;
export const FunctionComponent = 0;
export const HostRoot = 3;
export const HostComponent = 5;
export const HostText = 6;

export type FiberRoot = {
    containerInfo:HTMLElement,
    current:Fiber|null,
}

export type Fiber = {
    tag:WorkTag,
    key:string|null,
    elementType:any,
    type:any,
    stateNode:any,
    return:Fiber|null,
    child:Fiber|null,
    sibling:Fiber|null,
    ref:any,
    pendingProps:any,
    memoizedState:any,
    alternate:Fiber|null,
    flags:Flags,
    subtreeFlags:Flags,
    deletions:Fiber[]|null,
    index:number,
}