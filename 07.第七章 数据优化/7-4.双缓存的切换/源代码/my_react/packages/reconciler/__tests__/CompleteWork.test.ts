import { completeWork } from "../CompleteWork";
import { beginWork } from "../BeginWork";
import { createFiberFromElement } from "../Fiber";
import { MULTIPLE_ELEMENTS } from "./data";

describe('completeWork测试',()=>{
    const root_fiber = createFiberFromElement(MULTIPLE_ELEMENTS);
    const h1_fiber = beginWork(root_fiber);
    const p_fiber = h1_fiber!.sibling!;
    beginWork(p_fiber!);
    test('h1元素测试',()=>{
        completeWork(h1_fiber!);
        expect(h1_fiber?.stateNode).not.toBeNull();
        expect(h1_fiber?.stateNode?.tagName).toBe('H1');
        expect(h1_fiber?.stateNode?.textContent).toBe('Hello,my react!!!');
    })
    test('p元素测试',()=>{
        completeWork(p_fiber!.child!);
        expect(p_fiber?.child?.stateNode).not.toBeNull();
        expect(p_fiber?.child?.stateNode?.tagName).toBeUndefined();
        expect(p_fiber?.child?.stateNode?.nodeType).toBe(3);
        expect(p_fiber?.child?.stateNode?.textContent).toBe('du1 react ');
        completeWork(p_fiber!.child!.sibling!);
        expect(p_fiber?.child?.sibling?.stateNode).not.toBeNull();
        expect(p_fiber?.child?.sibling?.stateNode?.tagName).toBe('SPAN');
        expect(p_fiber?.child?.sibling?.stateNode?.textContent).toBe('span text');
        completeWork(p_fiber!);
        expect(p_fiber?.stateNode).not.toBeNull();
        expect(p_fiber?.stateNode?.tagName).toBe('P');
        expect(p_fiber?.stateNode?.childNodes.length).toBe(2);
    })
})
