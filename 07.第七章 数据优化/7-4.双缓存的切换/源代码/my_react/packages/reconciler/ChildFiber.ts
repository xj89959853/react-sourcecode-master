import { Fiber } from "./ReactInternalTypes";
import { REACT_ELEMENT_TYPE } from "shared/ReactSymbols";
import { createFiberFromElement,createFiberFromText, createWorkInProgress } from "./Fiber";


// 创建数组中所有子节点并建立它们之间的联系，返回的是第一个子节点
function reconcileChildrenArray(returnFiber:Fiber,children:any):Fiber|null{
    // 第一个子节点
    let resultingFirstChild:Fiber | null = null;
    // 上一个新节点
    let previousNewFiber:Fiber | null = null;
    
    for(let i =0 ; i < children.length; i++){
        const newFiber = typeof children[i] ==='string'||typeof children[i] ==='number'?createFiberFromText(children[i]): createFiberFromElement(children[i]) ;
        newFiber.return = returnFiber;
        if(previousNewFiber === null){
            resultingFirstChild = newFiber;
        }else{
            previousNewFiber.sibling = newFiber;
        }
        previousNewFiber = newFiber;
        
    }
    

    return resultingFirstChild;
}
// 创建单一子节点，返回子节点
function reconcileSingleElement(returnFiber:Fiber,children:any):Fiber{
    if(returnFiber.alternate?.child){
        const existing = createWorkInProgress(returnFiber.alternate.child,children.props);
        existing.return = returnFiber;
        return existing;
    }
    const created = createFiberFromElement(children);
    created.return = returnFiber;
    return created;
}
// 创建多个子结点，
/**
 * 协调子节点，根据不同情况，调用不同逻辑，这个过程就叫协调
 * params:children
 * return:fiber
 */
export function reconcileChildFibers(fiber:Fiber,children:any):Fiber|null{
    // 单一子节点
    if(children.$$typeof === REACT_ELEMENT_TYPE){
        return reconcileSingleElement(fiber,children);
    }
    // 多个子节点
    if(Array.isArray(children)){
        return reconcileChildrenArray(fiber,children);
    }
    
    return null;
}   