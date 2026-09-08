import { createFiberFromElement } from "./Fiber";
import type { Fiber
 } from "./ReactInternalTypes";
import { reconcileChildFibers } from "./ChildFiber";
 /**
  * 遍历开始阶段要做的工作
  * 给我一个父节点，我还你一个子节点
  * @param fiber 父节点
  * @returns 子节点
  */
export function beginWork(fiber:Fiber){
    // 纯文本节点
    if(typeof fiber.pendingProps.children === 'string'){
        return null;
    }
    // 1. 创建子节点
    fiber.child = reconcileChildFibers(fiber,fiber.pendingProps.children);
    return fiber.child;
    // 2.xxx
    // 3.xxx
    // 4.xxx
    // 5.xxx
    // 6.xxx
    // 7.xxx
    // 8.xxx
}