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