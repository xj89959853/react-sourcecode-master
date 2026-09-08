import { appendChild, removeChild } from "packages/react-dom-binding/FiberConfigDOM";
import { FunctionComponent, HostComponent,HostRoot,HostText, type Fiber } from "./ReactInternalTypes";
import { MutationMask } from "./FiberFlags";

// 最近的宿主父节点
let hostParent:HTMLElement|null = null;
// 最近的宿主父节点是不是容器
let hostParentIsContainer:Boolean = false;

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
 * 提交节点的突变副作用
 * 处理当前 Fiber 节点的“mutation”副作用——对单一fiber的处理
 * @param finishedWork fiber
 */
function commitMutationEffectsOnFiber(finishedWork:Fiber){
    recursivelyTraversMutationEffects(finishedWork)
}

/**
 * 提交之突变副作用
 * 更新dom树
 * @param finishedWork fiber
 */
export function commitMutationEffects(finishedWork:Fiber){
    commitMutationEffectsOnFiber(finishedWork)
}
