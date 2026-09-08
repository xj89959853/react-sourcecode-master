import sum from './index';

describe('sum',()=>{
    it('test sum result',()=>{
        expect(sum(1,2)).toBe(3);
    })
})