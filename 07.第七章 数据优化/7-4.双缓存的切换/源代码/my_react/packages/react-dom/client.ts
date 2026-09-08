import { createContainer,updateContainer } from "../reconciler/FiberReconciler";
import { Fiber, FiberRoot } from "../reconciler/ReactInternalTypes";
import { ReactElement } from "../shared/ReactElementType";

type ReactDOMRootType = {
    _internalRoot:FiberRoot;
    render:(element:ReactElement)=>void;
}
function ReactDOMRoot(fiberRoot:FiberRoot):ReactDOMRootType{
    return {
        _internalRoot:fiberRoot,
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
    const fiberRoot = createContainer(container);
    return ReactDOMRoot(fiberRoot);
}

export {createRoot};