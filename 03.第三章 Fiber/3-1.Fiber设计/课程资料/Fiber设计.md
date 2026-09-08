# Fiber的设计

### 思考部分：

1、react是不是直接将ReactElement对象渲染成DOM了呢？`展示初始化示例`

2、可以看到，ReactElement->Fiber->DOM，为什么需要fiber？fiber是react经过一段时间优化之后，决定创建的新的数据结构，在之后的课程中，会随着具体的优化点，补充fiber的必要性。本节课，只关注fiber与ReactElement的结构区别

3、ReactElement与Fiber的区别。`展示fiber和ReactElement的区别`

- fiber在任意节点上都能实现遍历整个树，ReactElement只能遍当前节点往下的数据。

4、总之，fiber是专注于react渲染工作的，ReactElement是专注与UI的。

5、我们今天只关注DOM结构相关的属性字段

- tag：WorkTag枚举值，标识Fiber节点的类型。
  
  - 0: FunctionComponent - 函数组件
  
  - 1: ClassComponent - 类组件
  
  - 3: HostRoot - 根节点
  
  - 5: HostComponent - 原生DOM元素
  
  - 6: HostText - 文本节点

- type：表示React元素的类型。
  
  - 对于函数组件，是函数本身
  
  - 对于类组件，是类本身
  
  - 对于DOM元素，是字符串(如'div', 'span')

- elementType：通常与type相同，但在使用React.memo、lazy等高阶组件时可能不同。

- return：指向父Fiber节点，构成树的向上链接。

- child：指向第一个子Fiber节点，是子树的入口点。

- sibling：指向同级的下一个Fiber节点，构成同级节点的链表。

- stateNode：存储与此Fiber关联的实际实例
  
  - 对于DOM元素，是DOM节点
  
  - 对于类组件，是组件实例
  
  - 对于HostRoot，是FiberRoot对象

- ref：存储React元素的ref引用，连接到DOM节点或组件实例。

### 实操部分：

1、创建/packages/react-reconciler目录，react的核心逻辑都在reconciler

2、初始化react-reconciler

3、创建/packages/react-reconciler/ReactInternalTypes.ts

```typescript
export type WorkTag = 3|5|6;
export type HostRoot = 3;
export type HostComponent = 5;
export type HostText = 6;

export type FiberNode = {
    tag: WorkTag;
    key: string | null;
    elementType: any;
    type: any;
    stateNode: any;
    return: FiberNode | null;
    child: FiberNode | null;
    sibling: FiberNode | null;
    ref: any;
}
```

4、创建/packages/react-reconciler/Fiber.ts

```typescript
import type { FiberNode, WorkTag} from "./ReactInternalTypes";
import { HostComponent } from "./ReactInternalTypes";
import { ReactElementType } from "shared/ReactElementType";

export function createFiber(tag: WorkTag, key: string | null):FiberNode{
    const fiber: FiberNode = {
        tag,
        key,
        elementType: null,
        type: null,
        stateNode: null,
        return: null,
        child: null,
        sibling: null,
        ref: null,
    }
    return fiber;
}

// 只处理子节点
export function createFiberFromTypeAndProps(type: any,  key: string | null):FiberNode{
    let fiberTag: WorkTag = HostComponent;
    if(typeof type === 'string'){
        fiberTag = HostComponent;
    }
    const fiber = createFiber(fiberTag, key);
    fiber.elementType = type;
    fiber.type = type;

    return fiber;
}

function createFiberFromElement(element: ReactElementType):FiberNode{
    const {type, key} = element;
    const fiber = createFiberFromTypeAndProps(type, key);
    return fiber;
}
```

5、创建/packages/reconciler/\_\_tests\_\_/fiber.test.ts

```typescript
import { createFiber, createFiberFromTypeAndProps, createFiberFromElement } from '../fiber';
import { HostComponent } from '../ReactInternalTypes';
import type { ReactElementType } from 'shared/ReactElementType';

describe('Fiber测试',()=>{
  test('测试createFiber方法参数齐全', () => {
    const tag = HostComponent;
    const key = 'test-key';

    const fiber = createFiber(tag, key);

    expect(fiber.tag).toBe(tag);
    expect(fiber.key).toBe(key);
    expect(fiber.elementType).toBeNull();
    expect(fiber.type).toBeNull();
    expect(fiber.stateNode).toBeNull();
    expect(fiber.return).toBeNull();
    expect(fiber.child).toBeNull();
    expect(fiber.sibling).toBeNull();
    expect(fiber.ref).toBeNull();
  });

  test('测试createFiber缺少key', () => {
    const tag = HostComponent;
    const key = null;

    const fiber = createFiber(tag, key);

    expect(fiber.tag).toBe(tag);
    expect(fiber.key).toBeNull();
  });

  test('测试createFiberFromTypeAndProps', () => {
    const type = 'div';
    const key = 'test-key';

    const fiber = createFiberFromTypeAndProps(type, key);

    expect(fiber.tag).toBe(HostComponent);
    expect(fiber.key).toBe(key);
    expect(fiber.elementType).toBe(type);
    expect(fiber.type).toBe(type);
  });

  test('测试createFiberFromElement', () => {
    const element: ReactElementType = {
      $$typeof: typeof Symbol === 'function' && Symbol.for ? Symbol.for('du1React') : 'du1React',
      type: 'div',
      key: 'test-key',
      props: {},
      ref: null
    };

    const fiber = createFiberFromElement(element);

    expect(fiber.tag).toBe(HostComponent);
    expect(fiber.key).toBe(element.key);
    expect(fiber.elementType).toBe(element.type);
    expect(fiber.type).toBe(element.type);
  });

})
```

### 补充部分：

1、示例结构代码

```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';

const root = ReactDOM.createRoot(document.getElementById('root'));
const element = <div id="container">
                  <h1 id="title">Hello,my react!!!</h1>
                  <ul id="list">
                    <li id="item1" key="1">1</li>
                    <li id="item2" key="2">2</li>
                    <li id="item3" key="3">3</li>
                  </ul>
                  <p id="title2">du1 react</p>
                </div>;
console.log('ReactElement:',element)
console.log('ReactElement FunctionComponent:',Child())
root.render(
  element
);
setTimeout(()=>{
  console.log('ReactFiber:',root._internalRoot.current.child);
},1000);
```
