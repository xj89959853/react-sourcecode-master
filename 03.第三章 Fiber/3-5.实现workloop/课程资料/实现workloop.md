# 实现workLoop

### 思考部分：

1、实现了beginWork和completeWork，那接下来是不是我们就该把这两个工作单元串起来了？所以这节课就是实现Fiber的遍历。

2、遍历最简单和常用的方法，就是递归，那递归遍历的顺序呢？是深度优先还是广度优先呢？采用的是深度优先原则。深度代表完整性，广度代表全面性

3、为什么是深度优先原则？符合浏览器对DOM的构建和渲染。Fiber是为了更新DOM，不符合

4、使用递归方式根据深度优先原则实现Fiber遍历

5、递归的方式有什么问题么？爆栈

6、怎么解决？循环替代。遍历的核心是指针的移动——workInProgress（正在进行的工作），指向当前待处理的Fiber的指针。next，下一个要遍历的节点的指针（探路的）。

7、如何用循环替代递归？双重循环实现递阶段和归阶段，也就是performUnitWork（执行单元工作）和completeUnitWork（完成单元工作）。递阶段触发beginWork，归阶段触发completeWork。

8、都是work，所以叫workLoop。

### 实操部分

1、递归方式实现，创建/packages/reconciler/WrokLoop.ts

```typescript
import type { Fiber } from "./ReactInternalTypes";
import { beginWork } from "./BeginWork";
import { completeWork } from "./CompleteWork";

/**
 * 深度优先遍历Fiber树，执行工作
 * @param fiber 
 * return
 */
export function workLoop(fiber:Fiber) {
    let child = beginWork(fiber);
    if(child){
        workLoop(child);
    }
    completeWork(fiber);
    if(fiber.sibling){
        workLoop(fiber.sibling);
    }else{
        return;
    }
}
```

2、创建/packages/reconciler/\_\_tests\_\_/WorkLoop.test.ts

```typescript
import { workLoop } from "../WorkLoop";
import { Fiber } from "../ReactInternalTypes";
import { MULTIPLE_ELEMENTS } from "./data";
import { createFiberFromElement } from "../Fiber";

describe('workLoop测试',()=>{
    test('测试Fiber构建',()=>{
        const container_fiber = createFiberFromElement(MULTIPLE_ELEMENTS);
        workLoop(container_fiber);
        // 测试根节点
        expect(container_fiber.tag).toBe(5);
        expect(container_fiber.stateNode).not.toBeNull();
        expect(container_fiber.stateNode?.tagName).toBe('DIV');
        expect(container_fiber.stateNode?.childNodes.length).toBe(2);
        // 测试h1节点
        expect(container_fiber.child).not.toBeNull();
        expect(container_fiber.child?.tag).toBe(5);
        expect(container_fiber.child?.child).toBeNull();
        expect(container_fiber.child?.stateNode).not.toBeNull();
        expect(container_fiber.child?.stateNode?.tagName).toBe('H1');
        expect(container_fiber.child?.stateNode?.textContent).toBe('Hello,my react!!!');
        // 测试p节点
        expect(container_fiber.child?.sibling).not.toBeNull();
        expect(container_fiber.child?.sibling?.tag).toBe(5);
        expect(container_fiber.child?.sibling?.stateNode?.tagName).toBe('P');
        expect(container_fiber.child?.sibling?.stateNode?.childNodes.length).toBe(2);
        // 测试p节点中的第一个子节点
        expect(container_fiber.child?.sibling?.child).not.toBeNull();
        expect(container_fiber.child?.sibling?.child?.tag).toBe(6);
        expect(container_fiber.child?.sibling?.child?.stateNode?.tagName).toBeUndefined();
        expect(container_fiber.child?.sibling?.child?.stateNode?.textContent).toBe('du1 react ');
        // 测试p节点中的第二个子节点
        expect(container_fiber.child?.sibling?.child?.sibling).not.toBeNull();
        expect(container_fiber.child?.sibling?.child?.sibling?.tag).toBe(5);
        expect(container_fiber.child?.sibling?.child?.sibling?.stateNode?.tagName).toBe('SPAN');
        expect(container_fiber.child?.sibling?.child?.sibling?.stateNode?.textContent).toBe('span text');

    })
})
```

3、更改WorkLoop实现方式

```typescript
import { Fiber } from "./ReactInternalTypes";
import { beginWork } from "./BeginWork";
import { completeWork } from "./CompleteWork";

// 当前正在处理的节点
let workInProgress:Fiber | null = null;

/**
 * 完成单元工作，对节点进行回溯遍历，并触发完成工作
 * @param fiber 
 * @returns 
 */
function completeUnitOfWork(fiber:Fiber|null){
    // 已经完成的节点
    let completedFiber:Fiber | null = fiber;
    do{

        completeWork(completedFiber!);
        const siblingFiber = completedFiber!.sibling;
        if(siblingFiber){
            workInProgress = siblingFiber
            return
        }

        completedFiber = completedFiber!.return;
        workInProgress = completedFiber;
    }while(completedFiber)
}
/**
 * 执行单元工作，对当前节点进行向下遍历，并触发开始工作
 * @param fiber 
 * return
 */
function performUnitOfWork(fiber:Fiber){
    // 下一个节点指针
    let next:Fiber | null = beginWork(fiber!);
    if(next){
        workInProgress = next
    }else{
        // 回溯操作
        completeUnitOfWork(fiber)
    }
}

/**
 * 循环遍历，每次循环都执行一次工作。深度优先遍历Fiber树，执行工作
 * @param fiber 
 * return
 */
export function workLoop(container_fiber:Fiber){
    workInProgress = container_fiber;
    while(workInProgress){
        performUnitOfWork(workInProgress)
    }
}
```

# 
