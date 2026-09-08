# Fiber,Run!!!

### 思考部分：

1、包的用途：

- react：给开发者提供的宿主环境无关的api

- react-dom：给开发者提供的开发浏览器环境页面的的API

- reconciler：react内部运行的

2、对象的说明：

- ReactDOM：react-dom的导出对象，用来调用导出的方法

- ReactDOMRoot：ReactDOM的方法生成的根节点对象，让开发者可以进行初始化和渲染操作的

### 实操部分：

1、初始化/packages/react-dom，修改package.json

```json
{
  "name": "react-dom",
  "version": "1.0.0",
  "description": "",
  "main": "client.js"
}
```

2、创建/packages/react-dom/client.ts

```typescript
import type { Fiber } from "../reconciler/ReactInternalTypes";
import { createContainer, updateContainer } from "../reconciler/FiberReconciler";
import { ReactElement } from "shared/ReactElementType";

// ReactDOMRoot类型
export type ReactDOMRootType = {
    _internalRoot:Fiber;
    render:(element:ReactElement)=>void;
}

// 构造方法
function ReactDOMRoot(root: Fiber):ReactDOMRootType {
    return {
        _internalRoot:root,
        render:function(element:ReactElement){
            updateContainer(element,this._internalRoot);
        }
    }
}
/**
 * 初始化react，创建根节点
 * @param container HTMLElement
 * @returns reactDomRoot ReactDOMRootType
 */
function createRoot(container:HTMLElement):ReactDOMRootType{
    const hostRootFiber = createContainer(container);
    const reactDomRoot = ReactDOMRoot(hostRootFiber);
    return reactDomRoot;
}

export {createRoot};
```

3、修改打包程序/scripts/rollup/build.js

```javascript
// packages部分
const packages=[
    {
        name:'react',
        input:'./packages/react/index.ts',
        output:[
           {
            file:'./dist/react/index.js',
            format:'umd',
            name:'react'
           }
        ],
        packageJson:{
            "name":"react",
            "version":"1.0.0",
            "main":"index.js"
        }
    },
    {
        name:'jsx-runtime',
        input:'./packages/react/jsx-runtime.ts',
        output:[
            {
                file:'./dist/react/jsx-runtime.js',
                format:'umd',
                name:'jsx-runtime'
            },
            {
                file:'./dist/react/jsx-dev-runtime.js',
                format:'umd',
                name:'jsx-dev-runtime'
            }
        ]
    },
    {
        name:'react-dom',
        input:'./packages/react-dom/client.ts',
        output:[
            {
                file:'./dist/react-dom/client.js',
                format:'umd',
                name:'react-dom'
            }
        ],
        packageJson:{
            "name":"react-dom",
            "version":"1.0.0",
            "main":"client.js"
        }
    }
]
// build方法
async function buld(){
    for(){
        if(pkg.packageJson){
            const reactDir = path.join('dist',pkg.packageJson.name);
            if(!fs.existsSync(reactDir)){
                fs.mkdirSync(reactDir,{recursive:true});
            }
            fs.writeFileSync(path.join(reactDir,'package.json'),JSON.stringify(pkg.packageJson,null,2));
        }
    }
}
```
