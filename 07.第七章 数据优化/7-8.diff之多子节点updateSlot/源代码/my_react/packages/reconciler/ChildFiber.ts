import { Fiber, HostText } from "./ReactInternalTypes";
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

/**
 * 更新文本节点
 * @param returnFiber 
 * @param oldFiber 
 * @param textContent 
 * @returns Fiber
 */
function updateTextNode(returnFiber:Fiber,oldFiber:Fiber,textContent:string):Fiber{
    // 如果旧节点为空，或者就节点不是文本节点,创建，否则复用
    if(oldFiber === null || oldFiber.tag !== HostText){
        const created = createFiberFromText(textContent);
        created.return = returnFiber;
        return created;
    }else{
        const existing = createWorkInProgress(oldFiber,textContent);
        existing.return = returnFiber;
        return existing;
    }
}
/**
 * 更新ReactElement
 * @param returnFiber 
 * @param oldFiber 
 * @param element 
 * @returns Fiber
 */
function updateElement(returnFiber:Fiber,oldFiber:Fiber,element:any):Fiber{
    // 获取创建的元素类型
    const elementType = element.type;
    // 判断旧节点是否存在
    if(oldFiber !== null){
        // 判断旧节点是否可以复用
        if(oldFiber.elementType === elementType){
            // 更新元素节点
            const existing = createWorkInProgress(oldFiber,element.props);
            existing.return = returnFiber;
            return existing;
        }
    }
    // 创建新节点
    const created = createFiberFromElement(element);
    created.return = returnFiber;
    return created;
}

/**
 * 更新槽（更新投币口）——能否在当前位置进行元素更新
 * 判断我能否将构建的节点放到当前位置上，如果可以，就返回构建的节点，如果不行，就返回null
 * @param returnFiber 
 * @param olfFiber 
 * @param newChild
 * @returns Fiber | null
 */
function updateSlot(returnFiber:Fiber,oldFiber:Fiber,newChild:any):Fiber|null{
    // 获取旧节点的key
    const key = oldFiber.key;
    // 如果新节点是文本节点
    if(typeof newChild === 'string' || typeof newChild === 'number'){
        // 如果旧节点有key，则不能进行文本节点更新
        if(key !== null){
            return null;
        }
        // 更新文本节点
        return updateTextNode(returnFiber,oldFiber,newChild);
    }
    // 如果新的节点是对象
    if(typeof newChild === 'object' && newChild !== null){
        switch(newChild.$$typeof){
            case REACT_ELEMENT_TYPE:{
                // 如果新节点的key与旧节点的key相同，则可以进行更新，否则返回null
                if(newChild.key === key){
                    // 更新元素节点
                    return updateElement(returnFiber,oldFiber,newChild);
                }else{
                    return null;
                }
            }
        }
    }
}

// 创建数组中所有子节点并建立它们之间的联系，返回的是第一个子节点
function reconcileChildrenArray(returnFiber:Fiber,children:any):Fiber|null{
    // 第一个子节点
    let resultingFirstChild:Fiber | null = null;
    // 上一个新节点
    let previousNewFiber:Fiber | null = null;

    // current树上的第一个child
    let oldFiber:Fiber | null = returnFiber.alternate?.child || null;
    // 上一次插入的index
    let lastPlacedIndex = 0;
    // 新树的index
    let newIdx = 0;
    
    // 第一阶段：顺序比较，A->B->C => [A,B,C],位置相同，且元素相同
    for(;oldFiber !== null && newIdx < children.length; newIdx++){
        // 判断节点是否在当前位置可以复用，可以返回当前节点，不可以返回null
        const newFiber = updateSlot(returnFiber,oldFiber,children[newIdx]);
        // 如果不能复用，则跳出第一阶段
        if(newFiber === null){
            break;
        }
        // 如果可以复用，但key相同而type不同，则删除current树上的旧节点 A->B->C =>[A',B,C]
        if(oldFiber && newFiber.alternate === null){
            deleteChild(returnFiber,oldFiber);
        }
        
        // 打标记
        lastPlacedIndex = placeChild();

        // 构建新fiber链
        if(previousNewFiber === null){
            resultingFirstChild = newFiber;
        }else{
            previousNewFiber.sibling = newFiber;
        }
        // 移动指针
        previousNewFiber = newFiber;
        oldFiber = oldFiber?.sibling;
    }

    // 第二阶段：快速路径处理，新旧树长短不同，但同样的长度上的元素相同
    // 情况一：新树比旧树短，A->B->C=>[A,B],删除current树上其余子节点
    if(newIdx === children.length){
        deleteRemainingChildren(returnFiber,oldFiber);
        return resultingFirstChild;
    }
    // 情况二：新树比旧树长，A->B->C=>[A,B,C,D],剩余新树节点全部创建
    if(oldFiber === null){
        for(;newIdx < children.length; newIdx++){
            const newFiber = typeof children[newIdx] ==='string'||typeof children[newIdx] ==='number'?createFiberFromText(children[newIdx]): createFiberFromElement(children[newIdx]) ;
            newFiber.return = returnFiber;
            // 打标记
            lastPlacedIndex = placeChild();
            if(previousNewFiber === null){
                resultingFirstChild = newFiber;
            }else{
                previousNewFiber.sibling = newFiber;
            }
            previousNewFiber = newFiber;
        }
    }


    // 第三阶段：Map查找，前两个阶段无法处理的情况，都在这个阶段处理，位置不同或完全不存在，A->B->C=>[B,C,D,E]
    // 将旧树上剩余的fiber转成map
    const existingChildren = mapRemainingChildren(oldFiber);

    // 遍历剩余新树节点，在map中查找是否可以复用，可以复用则更新，否则创建
    for(;newIdx < children.length; newIdx++){
        // 从map获取节点
        const newFiber = updateFromMap();
        // 如果节点是复用的，就删除map中的节点
        if(newFiber.alternate !== null){
            existingChildren.delete(newFiber.key === null ? newIdx : newFiber.key);
        }
        // 打标记
        lastPlacedIndex = placeChild();
        // 构建新fiber链
        if(previousNewFiber === null){
            resultingFirstChild = newFiber;
        }else{
            previousNewFiber.sibling = newFiber;
        }
        // 移动指针
        previousNewFiber = newFiber;
    }

    // 对于map中剩余的fiber全部标记删除
    existingChildren.forEach((child:Fiber) => deleteChild(returnFiber,child));
   

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