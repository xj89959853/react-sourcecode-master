import { Fiber } from "./ReactInternalTypes";
import { REACT_ELEMENT_TYPE } from "shared/ReactSymbols";
import { createFiberFromElement,createFiberFromText, createWorkInProgress } from "./Fiber";
import { ChildDeletion, Placement } from "./FiberFlags";

/**
 * 删除当前元素
 * 1、打删除标记（首次）
 * 2、存储要删除的子节点
 * @param returnFiber 
 * @param childToDelete Fiber
 * @returns 
 */
function deleteChild(returnFiber:Fiber,childToDelete:Fiber){
    const deletions = returnFiber.deletions;
    if(deletions === null){
        returnFiber.deletions = [childToDelete];
        returnFiber.flags |= ChildDeletion;
    }else{
        deletions.push(childToDelete);
    }
}

/**
 * 删除其余元素
 * @param returnFiber 
 * @param childrenToDelete Fiber
 * @returns 
 */
function deleteRemainingChildren(returnFiber:Fiber,childrenToDelete:Fiber|null){
    let childToDelete = childrenToDelete;
    while(childToDelete !== null){
        deleteChild(returnFiber,childToDelete);
        childToDelete = childToDelete.sibling;
    }
    
}

/**
 * 给单一子节点打place标记
 * @param newFiber 
 * @returns newFiber
 */
function placeSingleChild(newFiber:Fiber){
    if(newFiber.alternate === null){
        newFiber.flags |= Placement;
    }
    return newFiber;
}

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
    const key = children.key;
    let child = returnFiber.alternate?.child;
    // 遍历旧节点，进行对比
    while(child){
        if(child.key === key){
            const elementType = children.type;
            if(elementType === child.type){
                const existing = createWorkInProgress(child,children.props);
                existing.return = returnFiber;
                // 删除其余元素
                deleteRemainingChildren(returnFiber,child.sibling);
                return existing;
            }else{
                // 删除其余元素
                deleteRemainingChildren(returnFiber,child);
                break;
            }
        }else{
            //删除当前元素
            deleteChild(returnFiber,child);
        }
        child = child.sibling;
    }
    // 创建新节点
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
        return placeSingleChild(reconcileSingleElement(fiber,children));
    }
    // 多个子节点
    if(Array.isArray(children)){
        return reconcileChildrenArray(fiber,children);
    }
    
    return null;
}   