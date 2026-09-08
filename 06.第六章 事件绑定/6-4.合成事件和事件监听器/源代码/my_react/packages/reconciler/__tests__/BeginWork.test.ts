import { beginWork } from "../BeginWork";
import { SINGLE_ELEMENT,SINGLE_NUMBER_ELEMENT,MULTIPLE_ELEMENTS } from "./data";
import { createFiberFromElement } from "../Fiber";

describe('beginWork测试',()=>{
    test('单节点测试',()=>{
        const root_fiber = createFiberFromElement(SINGLE_ELEMENT);
        const child_fiber = beginWork(root_fiber);
        expect(child_fiber?.type).toBe('p');
        expect(root_fiber.pendingProps).not.toBeNull();
        expect(child_fiber?.pendingProps).not.toBeNull();
        expect(child_fiber?.return).toBe(root_fiber);
        expect(root_fiber.child).toBe(child_fiber);
    })
    test('单数字节点测试',()=>{
        const root_fiber = createFiberFromElement(SINGLE_NUMBER_ELEMENT);
        const child_fiber = beginWork(root_fiber);
        expect(child_fiber?.type).toBe('p');
        expect(root_fiber.pendingProps).not.toBeNull();
        expect(child_fiber?.pendingProps).not.toBeNull();
        expect(child_fiber?.return).toBe(root_fiber);
        expect(root_fiber.child).toBe(child_fiber);
    })
    test('混合节点测试',()=>{
        const root_fiber = createFiberFromElement(MULTIPLE_ELEMENTS.props.children[1]);
        const child_fiber = beginWork(root_fiber);
        expect(child_fiber?.tag).toBe(6);
        expect(child_fiber?.type).toBeNull();
        expect(child_fiber?.return).toBe(root_fiber);
        expect(root_fiber.child).toBe(child_fiber);
        expect(child_fiber?.sibling?.tag).toBe(5);
        expect(child_fiber?.sibling?.type).toBe('span');
        expect(child_fiber?.sibling?.return).toBe(root_fiber);
    })
    test('多节点测试',()=>{
        const root_fiber = createFiberFromElement(MULTIPLE_ELEMENTS);
        const child_fiber = beginWork(root_fiber);
        expect(root_fiber.child).toBe(child_fiber);
        expect(child_fiber?.type).toBe('h1');
        expect(child_fiber?.child).toBeNull();
        expect(child_fiber?.return).toBe(root_fiber);
        expect(child_fiber?.sibling?.type).toBe('p');
        expect(child_fiber?.sibling?.return).toBe(root_fiber);
    })
})