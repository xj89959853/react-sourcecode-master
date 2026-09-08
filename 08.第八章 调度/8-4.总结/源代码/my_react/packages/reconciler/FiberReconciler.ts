import { createFiberRoot } from "./FiberRoot";
import { createHostRootFiber } from "./Fiber";
import { ReactElement } from "shared/ReactElementType";
import { Fiber, FiberRoot } from "./ReactInternalTypes";
import { scheduleUpdateOnFiber, workLoop } from "./WorkLoop";
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
    const fiberRoot = createFiberRoot(containerInfo);
    const hostRootFiber = createHostRootFiber();
    hostRootFiber.memoizedState = {element:null};
    hostRootFiber.stateNode = fiberRoot;
    fiberRoot.current = hostRootFiber;
    listenToAllSupportedEvents(fiberRoot.containerInfo);
    return fiberRoot;
}

/**
 * 更新容器
 * 1.构建Fiber树
 * 2.挂载子fiber到root dom上
 * @param element ReactElement
 * @param root 
 */
export function updateContainer(element:ReactElement,fiberRoot:FiberRoot){
    fiberRoot.current!.memoizedState.element = element;
    scheduleUpdateOnFiber(fiberRoot);
}