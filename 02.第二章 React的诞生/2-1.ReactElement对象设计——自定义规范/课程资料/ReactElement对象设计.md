# ReactElement的实现

### 思考部分：

1、今天起我们就开始学习React源码的实现。大家平时用react开发的时候，一般都写jsx或tsx，但浏览器渲染的时候是对dom对象，那怎么从jsx转成dom的呢？`react应用示例` ，可以看到，jsx转成了一个对象，这个对象就是ReactElement ，一个描述dom的自定义对象。

2、ReactElement核心属性：

- type：告诉react如何渲染此元素，string就是原生DOM，函数式组件就得执行，拿到返回值。决定渲染方式

- props：所有属性的集合，比如id，src的html属性，children子元素，以及自定义属性。决定渲染内容

3、ReactElement的优化属性：

- $$typeof：安全优化。标识合法的React元素。`有门禁卡的不一定合法，但没有门禁卡的大概率不合法`

- key：渲染优化。识别元素是否需要重新渲染。

- ref：使用优化。使用者可以访问DOM节点

4、开发环境下的内部属性：用于开放环境下的观察结构，调试定位等，对于react本身的渲染部分没有太大影响。

5、实现ReactElement

- 定义类型

- 定义生成对象的方法

### 实操部分：

1、packages下创建shared目录，并且使用`pnpm init`初始化

2、修改/packages/shared/package.json

```json
{
  "name": "shared",
  "version": "0.0.0",
  "private": true
}
```

3、创建packages/shared/ReactElementType.ts

```typescript
export type ReactELementKeyType = string|number|null,
export type ReactElementTypeType = symbol|string;
export type ReactElement = {
  $$typeof:symbol|string,
  type: string|function,
  props: any,
  ref:any,
  key:string|number|null
};
```

4、packages下创建react目录，并且使用`pnpm init`初始化

5、修改/packages/react/package.json

```json
{
  "name": "react",
  "version": "1.0.0",
  "description": "",
  "module": "index.ts"
}
```

6、创建/packages/react/ReactElement.ts文件

```javascript
import type {ReactElementKeyType,ReactElementTypeType ,ReactElement } from 'shared/ReactElementType';

function ReactElemnt(type:ReactElementTypeType ,key:ReactElementKeyType,):ReactElementType{
    
}
```
