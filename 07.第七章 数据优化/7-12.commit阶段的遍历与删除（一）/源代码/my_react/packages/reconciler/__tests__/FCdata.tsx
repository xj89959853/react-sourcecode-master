import { useState } from "../FiberHook";
export function Test(){
    const count = 0;
    return <p>{count}</p>
}

let timer = true;
export function TestState(){
    console.log('Component render')
    const [count,setCount] = useState(0);
    if(timer){
        timer = false;
        setTimeout(()=>{
            setCount(count+1);
        },1000)
    }
    return <p>{count}</p>
}