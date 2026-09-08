export type WorkTag = 3|5|6;
export const HostRoot = 3;
export const HostComponent = 5;
export const HostText = 6;

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
    pendingProps:any
}