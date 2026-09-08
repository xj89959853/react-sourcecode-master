import {createInstance,createTextInstance,appendChild,setInitialProps} from '../react-dom-binding/FiberConfigDOM';
import type { Fiber } from './ReactInternalTypes';
import type { Instance } from '../react-dom-binding/FiberConfigDOM';
import { HostText,FunctionComponent,HostComponent, HostRoot } from './ReactInternalTypes';
import { Flags, NoFlags, Update } from './FiberFlags';

/**
 * 遍历当前节点的子节点，并将子节点的stateNode与当前节点的stateNode关联
 * @param parent 当前节点
 * @param child 子节点
 */
function appendAllChildren(parent:Instance,child:Fiber|null){
   let node:Fiber|null = child;
   while(node){
     let childStateNode = node.tag === FunctionComponent?node.child!.stateNode:node.stateNode;
     appendChild(parent,childStateNode);
     node = node.sibling;
   }
}
/**
 * 冒泡属性——收集子节点的标记
 * @param workInProgress 
 */
function bubbleProperties(workInProgress:Fiber){
    // 实施救助——如果两棵树的子节点完全一样，则不需要更新，直接跳过
    const didBailout = workInProgress.alternate !== null && workInProgress.alternate.child === workInProgress.child;

    // 存放子节点标记
    let subtreeFlags = NoFlags;

    if(!didBailout){
        let child = workInProgress.child;
        while(child){
            // 收集子节点本身的标记
            subtreeFlags |= child.flags;
            // 收集子节点收集的标记
            subtreeFlags |= child.subtreeFlags;
            child = child.sibling;
        }
        workInProgress.subtreeFlags = subtreeFlags;
    }
}

/**
 * 打更新标记
 * @param workInProgress 
 */
function markUpdate(workInProgress:Fiber){
    workInProgress.flags |= Update;
}
/**
 * 更新HostComponent——如果组件的props发生变化，则打更新标记
 * @param workInProgress 
 * @param oldProps 
 * @param newProps 
 */
function updateHostComponent(workInProgress:Fiber,oldProps:any,newProps:any){
    if(oldProps !== newProps){
        markUpdate(workInProgress);
    }
}
/**
 * 更新HostText——如果文本内容发生变化，则打更新标记
 * @param workInProgress 
 * @param oldText 
 * @param newText 
 */
function updateHostText(workInProgress:Fiber,oldText:string,newText:string){
    if(oldText !== newText){
        markUpdate(workInProgress);
    }
}
/**
 * 
 * 构建Fiber回溯阶段，节点完成状态要干的事情
 * 1. 创建真实DOM节点
 * 2. 设置stateNode
 * @param workInProgress 
 * return undefined
 */
export function completeWork(workInProgress:Fiber){
    // 获取旧节点
    const current = workInProgress.alternate || null;

    // 获取新旧节点的属性
    const oldProps = current?.pendingProps || null;
    const newProps = workInProgress.pendingProps;

    switch(workInProgress.tag){
        case FunctionComponent:
        case HostRoot:
            // 冒泡属性——收集子节点的标记
            bubbleProperties(workInProgress);
            break;
        case HostComponent:
            // 判断是否复用，如果不复用，就离屏渲染
            if(current && workInProgress.stateNode != null){
                // 更新
                updateHostComponent(workInProgress,oldProps,newProps);
            }else{
                // 离屏渲染 
                // 1. 创建真实DOM节点
                const instance = createInstance(workInProgress.type,workInProgress)
                // 关联dom节点
                appendAllChildren(instance,workInProgress.child)
                // 设置属性
                setInitialProps(instance,workInProgress.pendingProps)
                
                // 2. 设置stateNode
                workInProgress.stateNode = instance;
            }
            bubbleProperties(workInProgress);
            break;
        case HostText:
            if(current && workInProgress.stateNode != null){
                updateHostText(workInProgress,oldProps,newProps);
            }else{
                workInProgress.stateNode = createTextInstance(workInProgress.pendingProps);

            }
            bubbleProperties(workInProgress);
            break;
        
        
            
    }
    
}
