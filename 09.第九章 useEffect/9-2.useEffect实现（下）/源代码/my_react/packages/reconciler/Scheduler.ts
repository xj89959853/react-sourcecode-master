type Task = {
    callback:()=>void;//执行内容
    priority:number;//优先级，时常
    startTime:number;//开始时间
    expirationTime:number;//过期时间
}
// 任务队列
let taskQueue:Task[] = [];

// 开始时间
let startTime = -1;
// 当前任务
let currentTask:Task | null = null;
// 获取开始时间（临时）
export function getStartTime(){        
    return startTime;
}
// 设置开始时间（临时）
export function setStartTime(time:number){
    startTime = time;
}
// 获取当前时间
export function getCurrentTime(){
    return Date.now();
}
// 调度触发
let schedulePerformWokrUnitDeadline:()=>void;
if(typeof MessageChannel !== 'undefined'){
    const channel = new MessageChannel();
    const port = channel.port2;
    channel.port1.onmessage = performWorkUntilDeadline;
    schedulePerformWokrUnitDeadline = ()=>{
        port.postMessage(null);
    }
}else{
    schedulePerformWokrUnitDeadline = ()=>{
        setTimeout(performWorkUntilDeadline,0);
    }
}
/**
 * 时间切片——时间间隔
 * 根据时间间隔来决定是否要停止当前的workLoop
 * @retruns boolean
 */
export function shouldYield(){
    // 计算执行时间间隔
    const timeElapsed = getCurrentTime() - startTime;
    // 如果执行时间间隔小于规定时间间隔，则继续执行
    if(timeElapsed < 5){
        return false;
    }
    //重制开始时间（临时）
    startTime = getCurrentTime();
    return true;
}
/**
 * 结束时间执行任务
 * 
 */
function performWorkUntilDeadline(){
    const startTime = getCurrentTime();
    let hasMoreWork = true;
    try{
        hasMoreWork = workLoop(startTime);
    }finally{
        if(hasMoreWork){
            schedulePerformWokrUnitDeadline();
        }
    }
}
/**
 * 工作循环——遍历处理任务
 * @param 开始时间
 * @returns boolean 是否还有其他任务
 */
function workLoop(startTime:number){
    

    currentTask = taskQueue.shift()!;
   

    while(currentTask){
        currentTask.callback();
        currentTask = taskQueue[0];
        if(currentTask&& currentTask.expirationTime > startTime){
            break;
        }
    }
    if(currentTask){
        return true;
    }else{
        return false;
    }
}
/**
 * 调度回调
 * 原名：unstable_scheduleCallback
 * 1、先创建数据对象
 * 2、进行调度触发
 * @param callback 回调函数
 * @param priority 优先级
 */
export function scheduleCallback(callback:()=>void,priority = 5000){
    const startTime = getCurrentTime();
    const expirationTime = startTime + priority;
    const newTask:Task = {
        callback,
        priority,
        startTime,
        expirationTime
    }
    taskQueue.push(newTask);
    // 调度触发
    schedulePerformWokrUnitDeadline();
}