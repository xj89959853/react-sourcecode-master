import {ReactElementType} from 'shared/ReactElementType';

export function ReactElement(type:any,props:any,key:any,ref:any):ReactElementType{
    return {
        $$typeof:typeof Symbol === 'function' && Symbol.for?Symbol.for('du1React'):'du1React',
        type,
        props,
        key,
        ref,
    }
}