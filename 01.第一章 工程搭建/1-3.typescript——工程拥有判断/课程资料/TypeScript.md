# TypeScript

### 思考部分：

1、已经配置了两个工具，都是文件管理层面的，那再代码开发过程中应该用什么工具呢？类型检查工具——typescript

2、为什么大部分开源框架都需要typescript呢？请看如下的例子

```javascript
//代码片段
function createContainer(containerInfo,tag){
    //...省略部分
    return fiber;
}

const root=createContainer(container,tag)
```

看起来一头雾水，我们只能知道传进去两个参数，返回了一个对象。参数类型和返回类型都不知道。一般读源码最主要的就是两点：

- 关心代码怎么用，参数列表，参数类型，返回类型

- 关心代码怎么实现，代码内容

```typescript
function createContainer(containerInfo:Element,tag:RootTag):Fiber{
    // ...省略部分
    return fiber;
}
```

所以ts可以帮助使用者快速了解如何使用某个方法。

3、这个用注释或者文档的形式不行么？可以，但是缺少强制性。

```javascript
//代码片段
function createContainer(containerInfo,tag){
    //...省略部分
    // 新增fiber属性
    fiber.my_prop = 'test';
    return fiber;
}

const root=createContainer(container,ConcurrentRoot)
```

新增的属性是干嘛的？不知道

```typescript
type iber={
   
}
function createContainer(containerInfo:Element,tag:RootTag):Fiber{
    // ...省略部分
    fiber.my_prop = 'test'
    return fiber;
}
```

会提示错误，需要在fiber类型定义中增加对应属性

4、但是每次变量类型发生变化都有去对应的创建和修改类型定义，感觉很麻烦。这里就需要明确一下我们的项目用途，我们的项目是为了给别的开发者使用，一次开发，多次使用。相比于使用时间和频次来说，开发时增加的书写类型的时间，占比就不是那么大了。

6、接下来我们就要实际配置typescript了。从操作上，其实配置typescript很简单，就三步。

- 安装依赖

- 书写配置项

- 测试

### 实操部分：

1、安装ts依赖

```bash
#安装ts
pnpm add typescript -D

#生成typescript默认配置
pnpm tsc --init
```

2、修改tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ESNext",//编译目标版本, 保持最新语法，由 Rollup + Babel 处理兼容性
    "strict": true,//严格类型检查 确保代码类型安全，避免运行时错误。
    "esModuleInterop": true,//模块兼容性 允许混合使用 ESM 和 CommonJS 模块（Rollup 需要此配置处理依赖）
    "skipLibCheck": true,// 跳过库类型检查（提升速度）
    "moduleResolution": "node",  // 模块解析策略
    "sourceMap": true // 生成 Sourcemap（与 Rollup 的 sourcemap 配合）
  },
  "include": ["packages/*"], //需要编译的目录
  "exclude":[],// 需要排除的目录
}
```

3、测试

```typescript
// packages/test.ts
type Person ={
    name:string;
    age:number;
}

function getPersonName(person:Person){
    console.log(person.name)
}

const person={name:'John',age:21}

getPersonName(person);
```

```bash
pnpm tsc
```
