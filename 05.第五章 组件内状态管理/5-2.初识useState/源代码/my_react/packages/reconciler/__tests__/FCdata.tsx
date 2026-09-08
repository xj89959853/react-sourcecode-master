import { useState } from "../FiberHook";
export function Test(){
    const count = 0;
    return <p>{count}</p>
}

export function TestState(){
    const [count,setCount] = useState(0);
    return <p>{count}</p>
}