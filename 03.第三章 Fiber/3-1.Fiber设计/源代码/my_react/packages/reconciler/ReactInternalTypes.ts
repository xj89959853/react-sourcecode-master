export type WorkTag = 3|5|6;
export const HostRoot = 3;
export const HostComponent = 5;
export const HostText = 6;

export type FiberNode = {
    tag:WorkTag,
    key:string|null,
    elementType:any,
    type:any,
    stateNode:any,
    return:FiberNode|null,
    child:FiberNode|null,
    sibling:FiberNode|null,
    ref:any
}