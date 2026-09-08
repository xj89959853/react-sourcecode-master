import { appendChild, Instance, removeChild, insertBefore,commitTextUpdate,setProp } from "packages/react-dom-binding/FiberConfigDOM";
import { FunctionComponent, HostComponent,HostRoot,HostText, type Fiber } from "./ReactInternalTypes";
import { Flags,MutationMask, Placement, Update,ChildDeletion } from "./FiberFlags";
import { detachDeletedInstance } from "packages/react-dom-binding/ReactDOMComponentTree";
// 最近的宿主父节点
let hostParent:HTMLElement|null = null;
// 最近的宿主父节点是不是容器
let hostParentIsContainer:Boolean = false;

// 下一个副作用——相当于workLoop中的workInProgress
let nextEffect:Fiber|null = null;


/**
 * 判断父节点是否是宿主
 * @param parent Fiber
 * @returns boolean
 */
function isHostParent(parent:Fiber):boolean{
    return parent.tag === HostComponent || parent.tag === HostRoot;
}
/**
 * 获取最近的宿主父节点
 * @param finishedWork Fiber
 * @returns hostParent Fiber
 */
function getHostParentFiber(finishedWork:Fiber){
    let parent = finishedWork.return;
    while(parent){
        if(isHostParent(parent)){
            return parent;
        }
        parent = parent.return;
    }
    return null;
}
/**
 * 从父结点中删除host
 * @param deletedFiber Fiber
 */
function commitHostRemoveChild(deletedFiber:Fiber){
    removeChild(hostParent!,deletedFiber.stateNode);
}
/**
 * 从容器中删除host
 * @param deletedFiber Fiber
 */
function commitHostRemoveChildFromContainer(deletedFiber:Fiber){
    let parent = null;
    if(hostParent!.nodeName === "HTML"){
        parent = hostParent!.ownerDocument.body;
    }else{
        parent = hostParent;
    }
    removeChild(parent!,deletedFiber.stateNode);
}
/**
 * 插入dom节点到容器中
 * @param parent 父节点
 * @param child 子节点
 * @param before 兄弟节点
 */
function insertInContainerBefore(parent:Instance,child:Instance,before:Instance){
    if(parent.nodeName === "HTML"){
        insertBefore(parent.ownerDocument.body,child,before);
    }else{
        insertBefore(parent,child,before);
    }
}
/**
 * 追加dom节点到容器中
 * @param parent 父节点
 * @param child 子节点
 */
function appendChildToContainer(parent:Instance,child:Instance){
    if(parent.nodeName === "HTML"){
        appendChild(parent.ownerDocument.body,child);
    }else{
        appendChild(parent,child);
    }
}
/**
 * 断开节点突变
 * 断开retrun
 * @param deletedFiber Fiber
 */
function detachFiberMutation(deletedFiber:Fiber){
    deletedFiber.return = null;
    if(deletedFiber.alternate){
        deletedFiber.alternate.return = null;
    }
}
/**
 * 递归遍历删除子树
 * @param deletedFiber Fiber
 */
function recursivelyTraverseDeletionEffects(deletedFiber:Fiber){
    let child = deletedFiber.child;
    while(child){
        commitDeletionEffectsOnFiber(child);
        child = child.sibling;
    }
}
/**
 * 提交单一节点的删除副作用
 * 根据节点的类型不同，进行不同的删除逻辑
 * @param deletedFiber Fiber
 */
function commitDeletionEffectsOnFiber(deletedFiber:Fiber){
    switch(deletedFiber.tag){
        case HostRoot:
            // 递归遍历删除子树
            recursivelyTraverseDeletionEffects(deletedFiber);
            return;
        case FunctionComponent:
            // 递归遍历删除子树
            recursivelyTraverseDeletionEffects(deletedFiber);
            return;
        case HostComponent:
            // 临时存储最近的宿主父节点
            const prevHostParent = hostParent;
            hostParent = null;
            // 递归遍历删除子树
            recursivelyTraverseDeletionEffects(deletedFiber);
            // 恢复最近的宿主父节点
            hostParent = prevHostParent;
            // 判断宿主父节点是否存在
            if(hostParent){
                // 删除dom节点
                if(hostParentIsContainer){
                    //从容器中删除host
                    commitHostRemoveChildFromContainer(deletedFiber);
                }else{
                    // 从父节点中删除host
                    commitHostRemoveChild(deletedFiber);
                }
            }
            
            return;
        case HostText:
            // 删除dom节点
            if(hostParentIsContainer){
                //从容器中删除host
                commitHostRemoveChildFromContainer(deletedFiber);
            }else{
                // 从父节点中删除host
                commitHostRemoveChild(deletedFiber);
            }
            return;
    }
}
/**
 * 提交删除副作用
 * 1、找到最近的宿主父节点——dom父节点
 * 2、递归处理被删除的子树
 * 3、断开被删除节点与Fiber树的连接——将return置空
 * @param finishedWork Fiber
 * @param deletedFiber Fiber
 */
function commitDeletionEffects(finishedWork:Fiber,deletedFiber:Fiber){
    let parent : null|Fiber = finishedWork;
    // 找到最近宿主
    findParent:while(parent){
        switch (parent.tag){
            case HostComponent:{
                hostParent = parent.stateNode;
                hostParentIsContainer = false;
                break findParent;
            }
            case HostRoot:{
                hostParent = parent.stateNode.containerInfo;
                hostParentIsContainer = true;
                break findParent;
            }
        }
        parent = parent.return;
    }

    // 对节点处理删除标记
    commitDeletionEffectsOnFiber(deletedFiber);

    // 重制全局变量
    hostParent = null;
    hostParentIsContainer = false;

    // 断开return
    detachFiberMutation(deletedFiber);
}
/**
 * 递归遍历突变副作用
 * 1、如果当前节点有需要删除的子节点，进行删除处理
 * 2、递归遍历Fiber子树，处理所有子节点的mutation副作用
 * @param finishedWork Fiber
 */
function recursivelyTraversMutationEffects(finishedWork:Fiber){
    // 删除当前子节点
    const deletions = finishedWork.deletions;
    if(deletions!== null){
        for(let i = 0 ; i< deletions.length;i++){
            // 调用删除的操作
            commitDeletionEffects(finishedWork,deletions[i]);
        }
    }
    // 递归遍历Fiber子树，处理mutation
    if(finishedWork.subtreeFlags & MutationMask){
        let child = finishedWork.child;
        while(child){
            commitMutationEffectsOnFiber(child);
            child = child.sibling
        }
    }
}
/**
 * 获取host兄弟节点——获取下一个稳定的兄弟节点
 * 先尝试横向，再向上，再横向，再向下，右上右下
 * @param fiber Fiber 当前节点
 * @returns Instance|null 兄弟节点
 */
function getHostSibling(fiber:Fiber):Instance|null{
    let node:Fiber = fiber;
    sibling: while(true){
        // 情况一：没有兄弟节点,往上找，根据父元素类型决定是否继续向上或返回null
        while(!node.sibling){
            if(isHostParent(node.return!)){
                return null;
            }
            node = node.return!;
        }
        node = node.sibling;
        // 情况二：有兄弟节点，根据兄弟节点本身的flag和本身的类型来去寻找
        while(node.tag!== HostComponent && node.tag!== HostText){
            // 兄弟节点不稳定
            if(node.flags & Placement){
                continue sibling;
            }
            // 兄弟节点稳定，判断有没有子节点
            if(!node.child){
                continue sibling;
            }else{
                node = node.child;
            }
        }
        if(!(node!.flags & Placement)){
            return node!.stateNode;
        }
    }
}
/**
 * 插入或追加节点
 * 当前节点的各种情况
 * @param node Fiber 当前节点
 * @param parent DOM 父节点
 * @param before DOM|null 兄弟节点
 */
function insertOrAppendPlacementNode(node:Fiber,parent:Instance,before:Instance|null){
    // host
    const {tag} = node;
    const isHost = tag === HostComponent || tag === HostText;
    if(isHost){
        const stateNode = node.stateNode;
        if(before){
            insertBefore(parent,stateNode,before);
        }else{
            appendChild(parent,stateNode);
        }
        return;
    }
    // 函数组件
    const child = node.child;
    if(child){
        insertOrAppendPlacementNode(child,parent,before);
        let sibling = child.sibling;
        while(sibling){
            insertOrAppendPlacementNode(sibling,parent,before);
            sibling = sibling.sibling;
        }
    }
}
/**
 * 插入或追加节点到容器中
 * @param node Fiber 当前节点
 * @param parent DOM 父节点
 * @param before DOM|null 兄弟节点
 */
function insertOrAppendPlacementNodeIntoContainer(node:Fiber,parent:Instance,before:Instance|null){
    // host
    const {tag} = node;
    const isHost = tag === HostComponent || tag === HostText;
    if(isHost){
        const stateNode = node.stateNode;
        if(before){
            insertInContainerBefore(parent,stateNode,before);
        }else{
            appendChildToContainer(parent,stateNode);
        }
        return;
    }
    // 函数组件
    const child = node.child;
    if(child){
        insertOrAppendPlacementNode(child,parent,before);
        let sibling = child.sibling;
        while(sibling){
            insertOrAppendPlacementNode(sibling,parent,before);
            sibling = sibling.sibling;
        }
    }
}
/**
 * 提交宿主位置——调整dom位置
 * @param finishedWork Fiber
 */
function commitHostPlacement(finishedWork:Fiber){
    const parentFiber = getHostParentFiber(finishedWork);
    // 判断使用append还是insert
    const before = getHostSibling(finishedWork);
    switch(parentFiber!.tag){
        case HostComponent:{
            const parent = parentFiber!.stateNode;
            insertOrAppendPlacementNode(finishedWork,parent,before);
            break;
        }
        case HostRoot:{
            const parent = parentFiber!.stateNode.containerInfo;
            insertOrAppendPlacementNodeIntoContainer(finishedWork,parent,before);
            break;
        }  
    }
}
/**
 * 提交宿主更新
 * @param dom DOM 节点
 * @param oldProps 旧属性
 * @param newProps 新属性
 */


function commitHostUpdate(dom:Instance,oldProps:any,newProps:any){
    // 删除不存在的旧属性
    for(const oldKey in oldProps){
        const oldValue = oldProps[oldKey];
        // 如果新属性中没有这个属性，则删除
        if(oldProps.hasOwnProperty(oldKey) && oldValue !== null && !newProps.hasOwnProperty(oldKey)){
            // 将属性值置空
            setProp(dom,oldKey,null);
        }
    }
    // 更新属性，更新新属性与旧属性不同的值
    for(const newKey in newProps){
        const newValue = newProps[newKey];
        const oldValue = oldProps[newKey];
        if(newProps.hasOwnProperty(newKey) && newValue !== oldValue && newValue !== null){
            // 设置属性值
            setProp(dom,newKey,newValue);
        }
    }
    
}
/**
 * 提交节点的突变副作用
 * 处理当前 Fiber 节点的“mutation”副作用——对单一fiber的处理
 * @param finishedWork fiber
 */
function commitMutationEffectsOnFiber(finishedWork:Fiber){
    let flags:Flags = finishedWork.flags;
    recursivelyTraversMutationEffects(finishedWork);
    // 处理placement
    if(flags & Placement){
        commitHostPlacement(finishedWork);
        // 清除Placement
        finishedWork.flags &= ~Placement;
    }
    switch(finishedWork.tag){
        case FunctionComponent:
            // 等待功能完善补充
            break;
        case HostRoot:
            break;
        case HostComponent:
            if(flags & Update){
                const dom:Instance = finishedWork.stateNode;
                if(dom){
                    const newProps = finishedWork.pendingProps;
                    const oldProps = finishedWork.alternate?.pendingProps;
                    commitHostUpdate(dom,oldProps,newProps);
                }
            }
            break;
        case HostText:{
            if(flags & Update){
                const newText = finishedWork.pendingProps;
                commitTextUpdate(finishedWork.stateNode,newText);
            }
        }
    }
}

/**
 * 提交之突变副作用
 * 更新dom树
 * @param finishedWork fiber
 */
export function commitMutationEffects(finishedWork:Fiber){
    commitMutationEffectsOnFiber(finishedWork)
}
/**
 * 断开alternate的兄弟节点——断开current上的兄弟节点和父节点的child
 * @param finishedWork 
 */
function detachAlternateSibling(finishedWork:Fiber){
    const previousFiber = finishedWork.alternate;
    if(previousFiber){
        let detachedChild = previousFiber.child;
        if(detachedChild){
            previousFiber.child = null;
            do{
                const sibling = detachedChild.sibling;
                detachedChild.sibling = null;
                detachedChild = sibling;
            }while(detachedChild);
        }
       
    }
}
/**
 * 断开当前节点的所有引用
 * @param fiber 
 */
function detachFiberAfterEffects(fiber:Fiber){
    // 指向自己的连接
    const alternate = fiber.alternate;
    if(alternate){
        fiber.alternate = null;
        detachFiberAfterEffects(alternate);
    }
    if(fiber.tag === HostComponent){
        const dom = fiber.stateNode;
        if(dom){
            detachDeletedInstance(dom)
        }
    }
    // 指向别人的链接
    fiber.child = null;
    fiber.sibling = null;
    fiber.deletions = null;
    fiber.stateNode = null;
    fiber.return = null;
}
/**
 * 提交删除子树内部副作用完成的方法
 * @param childToDelete     
 */
function commitPassiveUnmountEffectsInsideOfDeletedTree_complete(childToDelete:Fiber){
    while(nextEffect){
        const fiber = nextEffect;
        const sibling = fiber.sibling;
        const returnFiber = fiber.return;

        // 断开当前节点的所有引用
        detachFiberAfterEffects(fiber);

        // 如果当前处理的节点是删除子树的根节点，则将nextEffect置空
        if(fiber === childToDelete){
            nextEffect = null;
            return;
        }
        // 如果当前节点有兄弟节点，则将nextEffect指向兄弟节点
        if(sibling){
            nextEffect = sibling;
            return;
        }
        // 如果当前节点没有兄弟节点，则将nextEffect指向父节点
        nextEffect = returnFiber;
    }
}
/** 
 * 提交删除子树内部副作用开始的方法
 * @param childToDelete 
 */
function commitPassiveUnmountEffectsInsideOfDeletedTree_begin(childToDelete:Fiber){
    while(nextEffect){
        if(nextEffect.child){
            nextEffect = nextEffect.child;
        }else{
            commitPassiveUnmountEffectsInsideOfDeletedTree_complete(childToDelete);
        }
    }
}
/**
 * 递归遍历被动卸载副作用
 * @param finishedWork 
 */
function recursivelyTraversPassiveUnmountEffects(finishedWork:Fiber){
    // 断开节点的引用
    if(finishedWork.flags & ChildDeletion){
        const deletions = finishedWork.deletions;
        // 处理要删除的节点及其子树
        if(deletions){
            for(let i = 0;i< deletions.length;i++){
                const childToDelete = deletions[i];
                nextEffect = childToDelete;
                commitPassiveUnmountEffectsInsideOfDeletedTree_begin(childToDelete)
            }
        }
        //断开当前节点的兄弟节点的引用
        detachAlternateSibling(finishedWork);
        finishedWork.deletions = null;
    }
    // 如果subtreeflags有要删除的，递归处理
    if(finishedWork.subtreeFlags & ChildDeletion){
        let child = finishedWork.child;
        while(child){
            commitPassiveUnmountEffectsOnFiber(child);
            child = child.sibling;
        }
    }
}
/**
 * 针对节点提交被动卸载副作用
 * @param finishedWork 
 */
function commitPassiveUnmountEffectsOnFiber(finishedWork:Fiber){
    switch(finishedWork.tag){
        case FunctionComponent:
            recursivelyTraversPassiveUnmountEffects(finishedWork);
            // 等待功能完善补充
            break;
        case HostRoot:
            recursivelyTraversPassiveUnmountEffects(finishedWork);
            break;
        default:
            recursivelyTraversPassiveUnmountEffects(finishedWork);
            break;
    }
}
/**
 * 提交被动卸载副作用——异步进行善后工作（阶段）
 * @param finishedWork 
 */
export function commitPassiveUnmountEffects(finishedWork:Fiber){
    commitPassiveUnmountEffectsOnFiber(finishedWork);
}