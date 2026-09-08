// 开始时间
let startTime = -1;
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