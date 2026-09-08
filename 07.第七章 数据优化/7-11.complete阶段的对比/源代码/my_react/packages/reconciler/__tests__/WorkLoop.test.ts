import { workLoop } from "../WorkLoop";
import { createFiberFromElement } from "../Fiber";
import { MULTIPLE_ELEMENTS } from "./data";

describe('workLoop测试',()=>{
    test('测试Fiber构建',()=>{
        const container_fiber = createFiberFromElement(MULTIPLE_ELEMENTS);
        workLoop(container_fiber);
        // 测试根节点
        expect(container_fiber.tag).toBe(5);
        expect(container_fiber.stateNode).not.toBeNull();
        expect(container_fiber.stateNode?.tagName).toBe('DIV');
        expect(container_fiber.stateNode?.childNodes.length).toBe(2);
        // 测试h1节点
        expect(container_fiber.child).not.toBeNull();
        expect(container_fiber.child?.tag).toBe(5);
        expect(container_fiber.child?.child).toBeNull();
        expect(container_fiber.child?.stateNode).not.toBeNull();
        expect(container_fiber.child?.stateNode?.tagName).toBe('H1');
        expect(container_fiber.child?.stateNode?.textContent).toBe('Hello,my react!!!');
        // 测试p节点
        expect(container_fiber.child?.sibling).not.toBeNull();
        expect(container_fiber.child?.sibling?.tag).toBe(5);
        expect(container_fiber.child?.sibling?.stateNode?.tagName).toBe('P');
        expect(container_fiber.child?.sibling?.stateNode?.childNodes.length).toBe(2);
        // 测试p节点中的第一个子节点
        expect(container_fiber.child?.sibling?.child).not.toBeNull();
        expect(container_fiber.child?.sibling?.child?.tag).toBe(6);
        expect(container_fiber.child?.sibling?.child?.stateNode?.tagName).toBeUndefined();
        expect(container_fiber.child?.sibling?.child?.stateNode?.textContent).toBe('du1 react ');
        // 测试p节点中的第二个子节点
        expect(container_fiber.child?.sibling?.child?.sibling).not.toBeNull();
        expect(container_fiber.child?.sibling?.child?.sibling?.tag).toBe(5);
        expect(container_fiber.child?.sibling?.child?.sibling?.stateNode?.tagName).toBe('SPAN');
        expect(container_fiber.child?.sibling?.child?.sibling?.stateNode?.textContent).toBe('span text');
        
    })
})
