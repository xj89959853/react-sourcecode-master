import { appendChild } from "packages/react-dom-binding/FiberConfigDOM";
import type { Fiber } from "./ReactInternalTypes";

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
            commitMutationEffectOnFiber(child);
            child = child.sibling
        }
    }
}

/**
 * 提交节点的突变副作用
 * 处理当前 Fiber 节点的“mutation”副作用——对单一fiber的处理
 * @param finishedWork fiber
 */
function commitMutationEffectOnFiber(finishedWork:Fiber){
    recursivelyTraversMutationEffects(finishedWork)
}

/**
 * 提交之突变副作用
 * 更新dom树
 * @param finishedWork fiber
 */
export function commitMutationEffects(finishedWork:Fiber){
    commitMutationEffectOnFiber(finishedWork)
}
