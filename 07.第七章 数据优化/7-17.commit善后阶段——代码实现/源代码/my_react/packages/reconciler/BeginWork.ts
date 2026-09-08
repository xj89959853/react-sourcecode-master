import type { Fiber
 } from "./ReactInternalTypes";
import { reconcileChildFibers } from "./ChildFiber";
import { HostText,FunctionComponent,HostComponent, HostRoot } from "./ReactInternalTypes";
import { renderWithHooks } from "./FiberHook";
 /**
  * 遍历开始阶段要做的工作
  * 给我一个父节点，我还你一个子节点
  * @param fiber 父节点
  * @returns 子节点
  */
export function beginWork(fiber:Fiber){
    // 纯文本节点
    if(typeof fiber.pendingProps?.children === 'string' || typeof fiber.pendingProps?.children === 'number'){
        return null;
    }
    switch(fiber.tag){
        case HostRoot:
            fiber.child = reconcileChildFibers(fiber,fiber.memoizedState.element);
            return fiber.child;
        case HostText:
            return null;
        case FunctionComponent:
            const children = renderWithHooks(fiber,fiber.type);
            fiber.child = reconcileChildFibers(fiber,children);
            return fiber.child;
        case HostComponent:
            fiber.child = reconcileChildFibers(fiber,fiber.pendingProps.children);
            return fiber.child;
        default:
            return null;
    }
    
    // 2.xxx
    // 3.xxx
    // 4.xxx
    // 5.xxx
    // 6.xxx
    // 7.xxx
    // 8.xxx
}