import type { Fiber } from "../reconciler/ReactInternalTypes";
import type { Instance } from "./FiberConfigDOM";
/**
 * DOM和Fiber之间关联的工具类
 */

//属性的唯一性——随机字符串
let randomKey = Math.random().toString(36).slice(2);
export let internalInstanceKey = '__reactFiber$' + randomKey;

/**
 * 给dom元素添加属性并设置值
 * @param fiber
 * @param instance
 */
export function precacheFiberNode(fiber:Fiber,instance:Instance){
    (instance as any)[internalInstanceKey] = fiber;
}

/**
 * 删除dom元素对fiber的引用
 * @param dom 
 */
export function detachDeletedInstance(dom:Instance){
    delete (dom as any)[internalInstanceKey];
}
