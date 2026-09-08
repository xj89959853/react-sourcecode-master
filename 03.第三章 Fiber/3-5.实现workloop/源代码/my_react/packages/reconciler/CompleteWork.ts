import {createInstance,createTextInstance,appendChild,setInitialProps} from './FiberConfigDOM';
import type { Fiber } from './ReactInternalTypes';
import type { Instance } from './FiberConfigDOM';
import { HostText } from './ReactInternalTypes';

/**
 * 遍历当前节点的子节点，并将子节点的stateNode与当前节点的stateNode关联
 * @param parent 当前节点
 * @param child 子节点
 */
function appendAllChildren(parent:Instance,child:Fiber|null){
   let node:Fiber|null = child;
   while(node){
     appendChild(parent,node.stateNode);
     node = node.sibling;
   }
}
/**
 * 
 * 构建Fiber回溯阶段，节点完成状态要干的事情
 * 1. 创建真实DOM节点
 * 2. 设置stateNode
 * @param fiber 
 * return undefined
 */
export function completeWork(fiber:Fiber){
    if(fiber.tag === HostText){
        fiber.stateNode = createTextInstance(fiber.pendingProps);
    }else{
        // 1. 创建真实DOM节点
        const instance = createInstance(fiber.type)
        // 关联dom节点
        appendAllChildren(instance,fiber.child)
        // 设置属性
        setInitialProps(instance,fiber.pendingProps)
        // 2. 设置stateNode
        fiber.stateNode = instance;
    }
}
