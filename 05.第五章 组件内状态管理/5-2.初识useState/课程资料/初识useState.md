# 初识useState

### 思考部分：

1、我们开发时使用useState得到的是什么？一个状态值，一个更改状态的方法

2、状态值存在哪儿？一个hook对象中，最终存到fiber的memoizedState属性中

3、hook是什么？官方解释是Hook 是框架或系统预留的**扩展点**，允许开发者在特定事件（如页面加载、数据保存）发生时插入自定义逻辑，从而**被动触发**代码。简单说就是你让一个人干一件事情，他不马上去做，而是等到他手头上的事情处理完了再去做

4、跟API的区别是什么？API同样也是调用一个方法执行一个逻辑，达到一个效果。区别就在于是否马上执行，hook是按照对方的生命周期特点在特定时间执行。

### 实操部分：

1、创建/package/reconciler/FiberHook.ts

```typescript
import { Fiber } from "./ReactInternalTypes";

export type Hook={
    memoizedState:any,
}
// 当前正在渲染的fiber
let currentlyRenderingFiber:Fiber|null=null;
// 改变状态值的方法
function setState(){}
/**
 * 创建一个状态管理的hook
 * 1、创建一个hook
 * 2、将hook挂载到fiber的memoizedState上
 * 3、返回状态和更新状态的方法
 * @param initialState 初始状态
 * @returns [state,setState]
 */
export function useState(initialState:any){
    const hook={
        memoizedState:initialState,
    }
    currentlyRenderingFiber!.memoizedState = hook;
    return [hook.memoizedState,setState];
}

/**
 * 渲染函数组件，考虑hooks，并返回组件的返回值
 * 1、设置当前正在渲染的fiber
 * 2、执行函数组件的函数
 * @param workInProgress 当前正在渲染的fiber
 * @param Component 函数组件
 * @returns 组件的返回值
 */
export function renderWithHooks(workInProgress:Fiber,Component:any){
    currentlyRenderingFiber = workInProgress;
    return Component();
}

```

2、修改BeginWork.ts

```typescript
        case FunctionComponent:
            const children = renderWithHooks(fiber,fiber.type);
            fiber.child = reconcileChildFibers(fiber,children);
            return fiber.child;
```

3、修改Fiber Reconciler.test.tsx

```typescript
    test('测试函数组件State Hook的创建',()=>{
        const root_dom = document.createElement('div');
        const hostRootFiber = createContainer(root_dom);
        updateContainer(<p><TestState/></p>,hostRootFiber);
        expect(hostRootFiber.child?.tag).toBe(HostComponent);
        expect(hostRootFiber.child?.child?.tag).toBe(FunctionComponent);
        expect(hostRootFiber.child?.child?.memoizedState).not.toBeNull();
        expect(hostRootFiber.child?.child?.child?.pendingProps.children).toBe(0);
    })
```

### 测试环境完善：

1、修改tsconfig.json

```json
{
    "compilerOptions":{
        "jsx": "react-jsx", 
        "jsxImportSource": "packages/react",
        "baseUrl": ".",
    },
    "include": ["packages/**/*","./global.d.ts"],
}
```

属性说明：

**jsx:** 控制 TypeScript 如何处理 JSX 语法

- "preserve": 保持 JSX 语法不变，输出 .jsx 文件

- "react": 将 JSX 转换为 React.createElement() 调用

- "react-jsx": 使用新的 JSX transform，转换为 _jsx() 调用

- "react-jsxdev": 同上，但包含更多开发时的检查

**jsxImportSource:** 指定从哪里导入 JSX runtime（jsx/jsxs 函数）。当 jsx: "react-jsx" 时，TypeScript 会自动从这个路径导入 jsx-runtime

**baseUrl:** 设置解析非相对模块导入的基准目录,影响模块解析的起点

1. 当我们设置 "jsxImportSource": "packages/react" 时，TypeScript 会尝试导入 packages/react/jsx-runtime

2. 没有 baseUrl 时，TypeScript 会将这个路径视为相对路径，从当前文件所在目录开始查找：`在 packages/reconciler/__tests__/fiber.test.tsx 中TypeScript 会尝试查找：packages/reconciler/__tests__/packages/react/jsx-runtime`

3. 设置 "baseUrl": "." 后，TypeScript 会从项目根目录开始查找非相对路径的导入：`TypeScript 会从项目根目录查找： <project_root>/packages/react/jsx-runtime`

2、创建global.d.ts

```typescript
declare namespace JSX {
  interface Element {
    $$typeof: symbol;
    type: any;
    key: string | null;
    props: any;
    ref: any;
  }
  interface IntrinsicElements {
    div: any;
    p: any;
    span: any;
  }
} 
```

说明：TypeScript 编译时会读取这个文件，这些类型告诉 TypeScript 如何理解和检查 JSX 语法，React 官方项目不需要这些声明是因为 @types/react 已经提供了，我们在实现自己的 React，所以需要自己定义这些类型

- JSX.Element 定义了 JSX 元素的结构

- JSX.IntrinsicElements 告诉 TypeScript 哪些 HTML 标签是合法的

3、修改jest.config.ts

```typescript
    testMatch:['**/?(*.)test.{ts,tsx}'],
    moduleNameMapper: {
        '^packages/react/(.*)$': '<rootDir>/packages/react/$1'
    }
```

告诉jest如何解析package/react模块路径
