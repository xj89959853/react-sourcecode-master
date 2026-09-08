# JSX的运行实现

### 思考部分：

1、怎么从jsx转成ReactElement？jsx->babel->jsx()->ReactElement->dom

2、jsx方法的关注点

- 包名

- 方法名

- 参数
  
  - type：同ReactElement的type，对象类型
  
  - config：所有属性
  
  - maybeKey：可能的key，如果直接写在标签里，就可以直接获取，如果使用展开运算符方式，就需要从config中获取

### 实操部分

1、创建/packages/react/jsx-runtime.ts

```typescript
import {ReactElementType} from 'shared/ReactElementType';
function ReactElement(type:any,props:any,key:any,ref:any):ReactElementType{
    return {
        $$typeof:typeof Symbol === 'function' && Symbol.for?Symbol.for('du1React'):'du1React',
        type,
        props,
        key,
        ref,
    }
}
export function jsx(type:any,config:any,maybeKey?:any){
    let key = null;
    if(maybeKey !== undefined){
        key = '' + maybeKey;
    }
    if(config.key !== undefined){
        key = '' + config.key;
    }

    const ref = config.ref?config.ref:null;

    let props = null;

    if(config.key){
        props = {} as any;
        for(const propName in config){
            if(propName !== 'key'){
                props[propName] = config[propName];
            }
        }
    }else{
        props = config;
    }

    return ReactElement(type,props,key,ref);
}

export const jsxDEV = jsx;
```

2、修改/packages/react/index.ts

```typescript
export const version = '1.0.0';
```

3、编写单元测试，创建/packages/react/\_\_tests\_\_/jsx-runtime.test.ts

```typescript
import { jsx } from '../jsx-runtime';

describe('jsx函数测',()=>{
    //标准的元素
    test('标准的元素',()=>{
        const element = jsx('div',{class:'container',id:'div1'},'key1');
        expect(element).toEqual({
            $$typeof:typeof Symbol === 'function' && Symbol.for ? Symbol.for('du1React') : 'du1React',
            type:'div',
            props:{class:'container',id:'div1'},
            key:'key1',
            ref:null,
        })
    })
    //没有key的情况
    test('没有key的情况',()=>{
        const element = jsx('span',{children:'hello'});
        expect(element.key).toBeNull();
        expect(element.type).toBe('span');
        expect(element.props).toEqual({children:'hello'});
    })

    //props中有key的情况
    test('props中有key的情况',()=>{
        const props = {id:'div1',key:'key1'};
        const element = jsx('div',{...props});
        expect(element.key).toBe('key1');
        expect(element.props).toEqual({id:'div1'});
    })

    //ref的情况
    test('ref的情况',()=>{
        const ref={};
        const element = jsx('div',{ref});
        expect(element.ref).toBe(ref);
    })
})

```

4、修改打包程序，/scripts/rollupo/build.js

```javascript
// 引入文件模块
const fs = require('fs');
// 修改package配置
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
        ]
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
    }
]  
//为build方法增加创建package.json的逻辑
async function build(){
    //...之前的逻辑
    const packageJson = {
        "name":"react",
        "version":"1.0.0",
        "main":"index.js"
    }
    const reactDir = path.join('dist','react');
    if(!fs.existsSync(reactDir)){
        fs.mkdirSync(reactDir,{recursive:true});
    }
    fs.writeFileSync(path.join(reactDir,'package.json'),JSON.stringify(packageJson,null,2));
}
```


