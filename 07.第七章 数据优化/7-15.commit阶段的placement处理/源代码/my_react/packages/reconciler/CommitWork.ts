import { appendChild, Instance, removeChild, insertBefore } from "packages/react-dom-binding/FiberConfigDOM";
import { FunctionComponent, HostComponent,HostRoot,HostText, type Fiber } from "./ReactInternalTypes";
import { MutationMask, Placement } from "./FiberFlags";

// 最近的宿主父节点
let hostParent:HTMLElement|null = null;
// 最近的宿主父节点是不是容器
let hostParentIsContainer:Boolean = false;

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
    commitDeletionEffectsOnFiber();

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
            commitDeletionEffects()
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
 * 提交节点的突变副作用
 * 处理当前 Fiber 节点的“mutation”副作用——对单一fiber的处理
 * @param finishedWork fiber
 */
function commitMutationEffectsOnFiber(finishedWork:Fiber){
    recursivelyTraversMutationEffects(finishedWork);
    // 处理placement
    if(finishedWork.flags & Placement){
        commitHostPlacement(finishedWork);
        
        // 清除Placement
        finishedWork.flags &= ~Placement;
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
