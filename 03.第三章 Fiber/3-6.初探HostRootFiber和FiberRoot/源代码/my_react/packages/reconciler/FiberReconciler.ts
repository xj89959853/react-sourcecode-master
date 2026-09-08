import { createFiberRoot } from "./FiberRoot";
import { createHostRootFiber } from "./Fiber";
import { ReactElement } from "shared/ReactElementType";
import { Fiber } from "./ReactInternalTypes";
import { workLoop } from "./WorkLoop";
import { appendChild } from "./FiberConfigDOM";
import { createFiberFromElement } from "./Fiber";

/**
 * 创建FiberRoot,HostRootFiber,并建立关联
 * @param containerInfo 
 */
export function createContainer(containerInfo:HTMLElement){
    const root = createFiberRoot(containerInfo);
    const hostRootFiber = createHostRootFiber();
    hostRootFiber.stateNode = root;
    return hostRootFiber;
}

/**
 * 更新容器
 * 1.构建子fiber
 * 2.关联hostRootFiber和子fiber
 * 2.挂载子fiber到root dom上
 * @param element ReactElement
 * @param root 
 */
export function updateContainer(element:ReactElement,root:Fiber){
    // 1.构建子fiber
    const containerFiber = createFiberFromElement(element);
    workLoop(containerFiber);
    // 2.关联hostRootFiber和子fiber
    root.child = containerFiber;
    containerFiber.return = root;
    // 3.挂载子fiber到root dom上
    appendChild(root.stateNode.containerInfo,root.child?.stateNode);
}