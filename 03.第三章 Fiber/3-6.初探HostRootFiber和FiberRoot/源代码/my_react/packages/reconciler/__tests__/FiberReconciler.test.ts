import { createContainer,updateContainer } from "../FiberReconciler";
import { MULTIPLE_ELEMENTS } from "./data";

describe('FiberReconciler',()=>{
    test('测试创建容器',()=>{
        const root_dom = document.createElement('div');
        const container = createContainer(root_dom);
        expect(container.stateNode).not.toBeNull();
        expect(container.tag).toBe(3);
        expect(container.stateNode?.containerInfo).toBe(root_dom);
    });
    test('测试更新容器',()=>{
        const root_dom = document.createElement('div');
        const hostRootFiber = createContainer(root_dom);
        updateContainer(MULTIPLE_ELEMENTS,hostRootFiber);
        expect(hostRootFiber.child?.tag).toBe(5);
        expect(hostRootFiber.child?.type).toBe('div');
        expect(hostRootFiber.child?.stateNode?.tagName).toBe('DIV');
        expect(hostRootFiber.child?.stateNode?.childNodes.length).toBe(2);
        expect(hostRootFiber.stateNode?.containerInfo.childNodes.length).toBe(1);
    })
});