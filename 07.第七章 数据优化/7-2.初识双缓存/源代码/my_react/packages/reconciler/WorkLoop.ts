import type { Fiber } from "./ReactInternalTypes";
import { beginWork } from "./BeginWork";
import { completeWork } from "./CompleteWork";
import { appendChild, removeChild } from "../react-dom-binding/FiberConfigDOM";
import { commitMutationEffects } from "./CommitWork";
// 当前正在处理的节点
let workInProgress:Fiber|null=null;

/**
 * 完成单元工作，对当前节点进行回溯阶段，并触发完成工作
 * @param fiber 
 */
function completeUnitOfWork(fiber:Fiber){
    let completedWork:Fiber|null=fiber;
    do{
        completeWork(completedWork);
        if(completedWork.sibling){
            workInProgress=completedWork.sibling;
            return;
        }
   
        completedWork=completedWork.return;
        workInProgress=completedWork;
    }while(completedWork);
}

/**
 * 执行单元工作，对当前节点进行向下遍历，并触发开始工作
 * @param fiber 
 */
function performUnitOfWork(fiber:Fiber){
    let next = beginWork(fiber);
    if(next){
        workInProgress=next;
    }else{
        completeUnitOfWork(fiber);
    }
}
/**
 * 深度优先遍历Fiber树，执行工作
 * @param fiber 
 * return
 */
export function workLoop(fiber:Fiber) {
    workInProgress=fiber;
    while(workInProgress){
        // 向下的工作
        performUnitOfWork(workInProgress);
    }
}

/**
 * 向上获取hostRootFiber 
 * @param fiber 
 * @returns hostRootFiber
 */
function getRootForUpdateFiber(fiber:Fiber):Fiber{
   let node = fiber;
   while(node.return){
    node = node.return;
   }
   return node;
}
/**
 * 更新Fiber树
 * @param fiber 
 */
export function updateOnFiber(fiber:Fiber){

    const hostRootFiber = getRootForUpdateFiber(fiber);
    removeChild(hostRootFiber.stateNode.containerInfo,hostRootFiber.child?.stateNode);
    workLoop(fiber);
    commitMutationEffects(hostRootFiber);
}
