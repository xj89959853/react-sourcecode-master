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
