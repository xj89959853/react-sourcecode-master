import type { Fiber, FiberRoot } from "./ReactInternalTypes";
import { beginWork } from "./BeginWork";
import { completeWork } from "./CompleteWork";
import { appendChild, removeChild } from "../react-dom-binding/FiberConfigDOM";
import { commitMutationEffects, commitPassiveUnmountEffects } from "./CommitWork";
import { createWorkInProgress } from "./Fiber";
import { ensureRootIsScheduled } from "./FiberRootScheduler";
import { shouldYield, getStartTime, setStartTime, getCurrentTime } from "./Scheduler";

// 当前正在处理的节点
let workInProgress:Fiber|null=null;

// 当前处理的fiber根节点
let workInProgressRoot:FiberRoot|null=null;

// 根节点的状态
let rootStatus = 0;
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
 * 1、我怎么知道我什么时候应该断开？——时间切片
 * 2、怎么断开？——并发渲染
 * @param fiber 
 * return
 */
export function workLoop() {
    while(workInProgress && !shouldYield()){
        // 向下的工作
        performUnitOfWork(workInProgress);
    }
    // 如果当前workInProgress为null，则为完成
    if(!workInProgress){
        rootStatus=1;
    }
}

/**
 * 向上获取hostRootFiber 
 * @param fiber 
 * @returns hostRootFiber
 */
export function getRootForUpdateFiber(fiber:Fiber):FiberRoot{
   let node = fiber;
   while(node.return){
    node = node.return;
   }
   return node.stateNode;
}
/**
 * 调度节点更新
 * @param fiber 
 */
export function scheduleUpdateOnFiber(fiberRoot:FiberRoot){
    if(!workInProgressRoot){
        workInProgressRoot=fiberRoot;
    }
    
    ensureRootIsScheduled();
    
}
/**
 * 执行根节点的工作
 */
export function performWorkOnRoot(){
    const fiberRoot=workInProgressRoot!;
    console.log('workLoop start')
    if(!workInProgress){
        workInProgress=createWorkInProgress(fiberRoot.current!,fiberRoot.current!.pendingProps);
    }
    if(getStartTime()<0){
        setStartTime(getCurrentTime());
    }
    workLoop();
    if(rootStatus===1){
        commitMutationEffects(fiberRoot.current!.alternate!);
        fiberRoot.current = fiberRoot.current!.alternate!;
        commitPassiveUnmountEffects(fiberRoot.current!);
        // 推出构建（临时）
        return;
    }
    
    console.log('workLoop end')
    ensureRootIsScheduled();
}
