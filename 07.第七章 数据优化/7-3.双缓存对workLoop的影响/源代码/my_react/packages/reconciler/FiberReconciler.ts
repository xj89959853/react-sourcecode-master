import { createFiberRoot } from "./FiberRoot";
import { createHostRootFiber } from "./Fiber";
import { ReactElement } from "shared/ReactElementType";
import { Fiber } from "./ReactInternalTypes";
import { updateOnFiber, workLoop } from "./WorkLoop";
import { appendChild } from "../react-dom-binding/FiberConfigDOM";
import { createFiberFromElement } from "./Fiber";
import { internalInstanceKey } from "../react-dom-binding/ReactDOMComponentTree";
import { accumulateSinglePhaseListeners, listenToAllSupportedEvents, processEventQueueItemsInOrder } from "../react-dom-binding/DOMPluginEventSystem";
import createSyntheticEvent from "../react-dom-binding/SyntheticEvent";
import { commitMutationEffects } from "./CommitWork";

/**
 * 创建FiberRoot,HostRootFiber,并建立关联
 * @param containerInfo 
 */
export function createContainer(containerInfo:HTMLElement){
    const root = createFiberRoot(containerInfo);
    const hostRootFiber = createHostRootFiber();
    hostRootFiber.memoizedState = {element:null};
    hostRootFiber.stateNode = root;
    root.current = hostRootFiber;
    listenToAllSupportedEvents(root.containerInfo);
    return hostRootFiber;
}

/**
 * 更新容器
 * 1.构建Fiber树
 * 2.挂载子fiber到root dom上
 * @param element ReactElement
 * @param root 
 */
export function updateContainer(element:ReactElement,root:Fiber){
    root.memoizedState.element = element;
    updateOnFiber(root);
}