import { createContainer,updateContainer } from "../reconciler/FiberReconciler";
import { Fiber } from "../reconciler/ReactInternalTypes";
import { ReactElement } from "../shared/ReactElementType";

type ReactDOMRootType = {
    _internalRoot:Fiber;
    render:(element:ReactElement)=>void;
}
function ReactDOMRoot(hostRootFiber:Fiber):ReactDOMRootType{
    return {
        _internalRoot:hostRootFiber,
        render:function(element:ReactElement){
            updateContainer(element,this._internalRoot);
        }
    };
}
/**
 * 初始化react，创建根节点
 * @param container HTMLElment
 * @returns ReactDOMRoot
 */
function createRoot(container:HTMLElement){
    const hostRootFiber = createContainer(container);
    return ReactDOMRoot(hostRootFiber);
}

export {createRoot};