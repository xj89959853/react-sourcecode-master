// dom插件之事件系统
import type { Fiber } from "../reconciler/ReactInternalTypes";
import { HostComponent } from "../reconciler/ReactInternalTypes";


/**
 * 事件监听器
 * fiber (instance) Fiber
 * listener 方法
 * currentTarget 当前事件目标
 */
type DispatchListener = {
    listener:Function;
    currentTarget:EventTarget|null;
    fiber:Fiber|null;
}

/**
 * 创建事件监听器
 * @param fiber (instance) Fiber
 * @param listener 方法
 * @param currentTarget 当前事件目标
 * @returns 事件监听器
 */
function createDispatchListener(fiber:Fiber|null,listener:Function,currentTarget:EventTarget|null):DispatchListener{
    return {
        listener,
        currentTarget,
        fiber
    }
}
/**
 * 收集事件
 * 累计单相监听器
 * @param targetFiber (instance) Fiber 
 * @returns 方法的集合
 */
export function accumulateSinglePhaseListeners(targetFiber:Fiber):Array<any>{
    let fiber:Fiber|null = targetFiber;
    const listeners:Array<DispatchListener> = [];
    while(fiber){
        const {pendingProps,tag} = fiber;
        if(tag === HostComponent){
            const {onClick} = pendingProps;
            
            if(typeof onClick === 'function'){
                listeners.push(createDispatchListener(fiber,onClick,fiber.stateNode));
            }
        }
        fiber = fiber.return;
    }
    return listeners;
}

/**
 * 执行事件
 * 按顺序处理事件队列中的事件
 * @param event 事件
 * @param listeners 事件的集合
 */
export function processEventQueueItemsInOrder(event:any,listeners:Array<any>){

    for(let i = 0;i < listeners.length;i++){
        const {listener,currentTarget,fiber} = listeners[i];
        event.currentTarget=currentTarget;
        listener(event);
        event.currentTarget=null;
        if(event.isPropagationStopped()){
            return;
        }
    }
}

