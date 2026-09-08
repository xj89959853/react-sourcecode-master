# 初探HostRootFiber和FiberRoot

### 思考部分：

1、我们之前的操作都是基于ReactElement对象，但页面中还有一个元素一直游离在Fiber结构之外，是什么？就是root的dom

2、root的dom对应哪个Fiber呢？就是之前提到过的HostRootFiber，一个描述DOM根节点的Fiber，注意，他还是一个Fiber类型。

3、为什么不能存放在stateNode里？

- root早于Fiber存在

- root不是Fiber创建

- root不能直接被Fiber控制

4、那不放在fiber的stateNode里，那放在哪里？一个新的数据类型，FiberRoot，Fiber的根。

5、为什么不新建一个属性？根只有一个，为了一个结点的特殊性，单独创建属性划不来

6、FiberRoot当前需要的属性只有一个，就是containerInfo，就是存放dom实例的地方。



### 实操部分：

1、创建/packages/reconciler/FiberRoot.ts

```typescript
import { FiberRoot } from "./ReactInternalTypes";

export function createFiberRoot(containerInfo:HTMLElement):FiberRoot{
    const root:FiberRoot = {
        containerInfo,
    }
    return root;
}

```

2、更新/packages/reconciler/Fiber.ts

```typescript
// 创建HostRootFiber的方法
export function createHostRootFiber():Fiber{
    const fiber = createFiber(HostRoot,null);
    return fiber;
}
```

3、创建/packages/reconciler/FiberReconciler.ts

```typescript
import { createFiberRoot } from "./FiberRoot";
import { createHostRootFiber } from "./Fiber";
import { ReactElement } from "shared/ReactElementType";
import { Fiber } from "./ReactInternalTypes";
import { workLoop } from "./WorkLoop";
import { appendChild } from "./FiberConfigDOM";
import { createFiberFromElement } from "./Fiber";

/**
 * 创建FiberRoot,HostRootFiber,并建立关联
 * @param containerInfo 
 */
export function createContainer(containerInfo:HTMLElement){
    const root = createFiberRoot(containerInfo);
    const hostRootFiber = createHostRootFiber();
    hostRootFiber.stateNode = root;
    return hostRootFiber;
}

/**
 * 更新容器
 * 1.构建子fiber
 * 2.关联hostRootFiber和子fiber
 * 2.挂载子fiber到root dom上
 * @param element ReactElement
 * @param root 
 */
export function updateContainer(element:ReactElement,root:Fiber){
    // 1.构建子fiber
    const containerFiber = createFiberFromElement(element);
    workLoop(containerFiber);
    // 2.关联hostRootFiber和子fiber
    root.child = containerFiber;
    containerFiber.return = root;
    // 3.挂载子fiber到root dom上
    appendChild(root.stateNode.containerInfo,root.child?.stateNode);
}
```

4、创建/packages/reconciler/\_\_tests\_\_/FiberReconciler.test.ts

```typescript

```
