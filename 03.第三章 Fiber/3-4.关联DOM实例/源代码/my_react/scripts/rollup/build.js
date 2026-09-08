const path = require('path');
const rollup = require('rollup');
const typescript = require('@rollup/plugin-typescript');
const {babel} = require('@rollup/plugin-babel');
const fs = require('fs');
// 输入
// 输出
//插件

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

async function build(){
    for(const pkg of packages){
        const config = {
            input:pkg.input,
            plugins:[
                babel({
                    presets:['@babel/preset-env'],
                }),
                typescript({
                    tsconfig:'./tsconfig.json',
                    exclude:['**/*.test.ts'],
                    
                })
            ]
        }

        const bundle = await rollup.rollup(config);
        for(const output of pkg.output){
            await bundle.write(output);
        }
    }
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

build();