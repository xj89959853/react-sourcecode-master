import { scheduleMicroTask } from "../react-dom-binding/FiberConfigDOM";
import { performWorkOnRoot } from "./WorkLoop";

// 是否已经调度了微任务
let didScheduleMicroTask=false;
/**
 * 立即调度根节点调度任务——触发一个根节点的微任务
 */
function scheduleImmediateRootScheduleTask(){
    scheduleMicroTask(()=>{ 
        didScheduleMicroTask=false;           
        performWorkOnRoot();
    })
}
/**
 * 确认FiberRoot被调度
 * 触发一个微任务
 */
export function ensureRootIsScheduled(){
    if(!didScheduleMicroTask){
        didScheduleMicroTask=true;
        scheduleImmediateRootScheduleTask()
    }
}