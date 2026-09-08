# 关联DOM实例

### 思考部分：

1、我们创建Fiber的目的是什么？更新DOM树，让页面渲染

2、可不可以直接在beginWork里直接更新dom树？可以，但效率低，无法触发浏览器渲染优化。

3、怎么办？更新DOM树，就得先有DOM元素。有了DOM元素，是不是可以直接渲染？可以，但效率很低。所以需要存放到一个属性上

4、存在哪个属性上？stateNode

5、实现这段逻辑的功能放在哪儿？能不能放在beginWork里？可以，但不合适。创建DOM元素是为了能去改变真实的dom对象，也就是这个操作本身就是比较后置，如果过早实现，可能会产生资源浪费。还有一些别的原因，在之后优化部分涉及到了会再补充。

6、不放在beginWork，那放在哪儿呢？completeWork。树的遍历一定是有一个回到父元素的过程，在这个过程中要做的工作就叫做completeWork。也就是当前节点以及之下的子节点所有工作都做完了，所以叫完成阶段工作

### 实操部分：

1、创建/packages/reconciler/CompleteWork.ts

```typescript
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

```

2、创建/packages/reconciler/FiberConfigDOM.ts

```typescript
export type Instance = HTMLElement;
export type TextInstance = Text;
/**
 * 创建文本节点
 * @param text 
 * @returns TextInstance
 */
export function createTextInstance(text:string){
    return document.createTextNode(text);
}
/**
 * 创建DOM节点
 * @param type 
 * @returns instance
 */
export function createInstance(type:string){
    return document.createElement(type);
}

/**
 * 关联dom节点之间的关系
 * @param parent 父节点
 * @param child 子节点
 */
export function appendChild(parent:Instance,child:Instance){
    parent.appendChild(child);
}

/**
 * 设置属性
 * @param dom 
 * @param props 
 */
export function setInitialProps(dom:Instance,props:any){
    for(const prop in props){
        if(!props.hasOwnProperty(prop)){
            continue;
        }
        if(prop === 'children'){
            if(typeof props.children === 'string'){
                dom.textContent = props.children;
            }else{
                continue;
            }
        }
        dom.setAttribute(prop,props[prop]);
    }
}

```

3、创建/packages/reconciler/\_\_tests\_\_/CompleteWork.test.ts

```typescript

```
