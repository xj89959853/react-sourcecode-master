# Reconciler初探

### 思考部分：

1、我们当前确实能根据父fiber创建子fiber了，但是它们有关联么？需要建立父子联系

2、我们当前只考虑了单一子节点的情况，还有三种情况我们没有考虑。`展示结构`，对于这三种情况React是怎么处理的呢？

- 纯文本节点：不做处理，在之后回溯阶段做处理，可以省去一层fiber

- 数组节点：循环创建所有子节点，并且做子节点之间的关联，返回第一个子节点

- 混合节点（文本+子节点）：创建文本节点，创建子节点，两个节点之间做关联

3、判断子节点以及对不同类型子节点进行创建的逻辑放在beginWork里可以么？不可以，beginWork还有别的工作去做，所以需要将创建子节点的功能抽出来
4、创建子节点，两个关键步骤？

- 判断类型

- 创建逻辑实现

### 实操部分：

1、修改/packages/reconciler/BeginWork.ts

```typescript
export function beginWork(fiber:Fiber):Fiber{
    fiber.child = createFiberFromElement(fiber.pendingProps.children);
    fiber.child.return = fiber;
    return fiber.child;
}
```

2、修改/pakcages/reconciler/\_\_tests\_\_/BeginWork.test.ts

```typescript
// 增加关联字段判断
expect(root_fiber.child).toBe(child_fiber);
expect(child_fiber.return).toBe(root_fiber);
```

3、创建/pacages/reconciler/ChildFiber.ts

```typescript
import { Fiber } from "./ReactInternalTypes";
import { REACT_ELEMENT_TYPE } from "shared/ReactSymbols";
import { createFiberFromElement,createFiberFromText } from "./Fiber";

// 创建数组中所有子节点并建立它们之间的联系，返回的是第一个子节点
function reconcileChildrenArray(returnFiber:Fiber,children:any):Fiber|null{
    // 第一个子节点
    let resultingFirstChild:Fiber | null = null;
    // 上一个新节点
    let previousNewFiber:Fiber | null = null;

    for(let i =0 ; i < children.length; i++){
        const newFiber = typeof children[i] ==='string'?createFiberFromText(children[i]): createFiberFromElement(children[i]) ;
        newFiber.return = returnFiber;
        if(previousNewFiber === null){
            resultingFirstChild = newFiber;
        }else{
            previousNewFiber.sibling = newFiber;
        }
        previousNewFiber = newFiber;
    }
    return resultingFirstChild;
}
// 创建单一子节点，返回子节点
function reconcileSingleElement(returnFiber:Fiber,children:any):Fiber{
    const created = createFiberFromElement(children);
    created.return = returnFiber;
    return created;
}
// 创建多个子结点，
/**
 * 协调子节点，根据不同情况，调用不同逻辑，这个过程就叫协调
 * params:children
 * return:fiber
 */
export function reconcileChildFibers(fiber:Fiber,children:any):Fiber|null{
    // 单一子节点
    if(children.$$typeof === REACT_ELEMENT_TYPE){
        return reconcileSingleElement(fiber,children);
    }
    // 多个子节点
    if(Array.isArray(children)){
        return reconcileChildrenArray(fiber,children);
    }

    return null;
}   
```

4、修改BeginWork.ts

```typescript
import type { Fiber
 } from "./ReactInternalTypes";
import { reconcileChildFibers } from "./ChildFiber";
 /**
  * 遍历开始阶段要做的工作
  * 给我一个父节点，我还你一个子节点
  * @param fiber 父节点
  * @returns 子节点
  */
export function beginWork(fiber:Fiber){
    // 纯文本节点
    if(typeof fiber.pendingProps.children === 'string'){
        return null;
    }
    // 1. 创建子节点
    fiber.child = reconcileChildFibers(fiber,fiber.pendingProps.children);
    return fiber.child;
    // 2.xxx
    // 3.xxx
    // 4.xxx
    // 5.xxx
    // 6.xxx
    // 7.xxx
    // 8.xxx
    // 8.xxx
}
```

5、增加多节点ReactElement在data.ts中

```typescript
export const MULTIPLE_ELEMENTS = {
    "$$typeof":REACT_ELEMENT_TYPE,
    "type": "div",
    "key": null,
    "props": {
        "id": "container",
        "children": [
            {
                "$$typeof":REACT_ELEMENT_TYPE,
                "type": "h1",
                "key": null,
                "props": {
                    "id": "title",
                    "children": "Hello,my react!!!"
                },
                "ref":null
            },
            {
                "$$typeof":REACT_ELEMENT_TYPE,
                "type": "p",
                "key": null,
                "props": {
                    "id": "title2",
                    "children": [
                        "du1 react ",
                        {
                            "$$typeof":REACT_ELEMENT_TYPE,
                            "type": "span",
                            "key": null,
                            "props": {
                                "children": "span text"
                            },
                            "ref":null
                        }
                    ]
                },
                "ref":null
            }
        ]
    },
    "ref":null
}
```

5、修改BeginWork.test.ts

```typescript
test('混合节点测试',()=>{
        const root_fiber = createFiberFromElement(MULTIPLE_ELEMENTS.props.children[1]);
        const child_fiber = beginWork(root_fiber);
        expect(child_fiber?.tag).toBe(6);
        expect(child_fiber?.type).toBeNull();
        expect(child_fiber?.return).toBe(root_fiber);
        expect(root_fiber.child).toBe(child_fiber);
        expect(child_fiber?.sibling?.tag).toBe(5);
        expect(child_fiber?.sibling?.type).toBe('span');
        expect(child_fiber?.sibling?.return).toBe(root_fiber);
    })
    test('多节点测试',()=>{
        const root_fiber = createFiberFromElement(MULTIPLE_ELEMENTS);
        const child_fiber = beginWork(root_fiber);
        expect(root_fiber.child).toBe(child_fiber);
        expect(child_fiber?.type).toBe('h1');
        expect(child_fiber?.child).toBeNull();
        expect(child_fiber?.return).toBe(root_fiber);
        expect(child_fiber?.sibling?.type).toBe('p');
        expect(child_fiber?.sibling?.return).toBe(root_fiber);
    })
```
