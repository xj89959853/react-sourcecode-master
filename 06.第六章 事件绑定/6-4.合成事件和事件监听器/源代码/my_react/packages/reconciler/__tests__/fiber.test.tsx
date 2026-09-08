import {createFiber,createFiberFromTypeAndProps,createFiberFromElement} from '../Fiber';
import {HostComponent,FunctionComponent} from '../ReactInternalTypes';
import {ReactElement} from 'shared/ReactElementType';
import { Test } from './FCdata';

describe('Fiber测试',()=>{
  test('测试createFiber有key',()=>{
    const tag = HostComponent;
    const key = 'test-key';
    const fiber = createFiber(tag,key);
    expect(fiber.tag).toBe(tag);
    expect(fiber.key).toBe(key);
    expect(fiber.elementType).toBeNull();
    expect(fiber.type).toBeNull();
    expect(fiber.stateNode).toBeNull();
    expect(fiber.return).toBeNull();
    expect(fiber.child).toBeNull();
    expect(fiber.sibling).toBeNull();
    expect(fiber.ref).toBeNull();
    expect(fiber.memoizedState).toBeNull();
  })

  test('测试createFiber没有key',()=>{
    const tag = HostComponent;
    const fiber = createFiber(tag,null);
    expect(fiber.tag).toBe(tag);
    expect(fiber.key).toBeNull();
   
  })
  test('测试createFiberFromTypeAndProps',()=>{
    const type = 'div';
    const key = 'test-key';
    const props = null;
    const fiber = createFiberFromTypeAndProps(type,props,key);
    expect(fiber.tag).toBe(HostComponent);
    expect(fiber.key).toBe(key);
    expect(fiber.elementType).toBe(type);
    expect(fiber.type).toBe(type);
  })
  test('测试createFiberFromElement',()=>{
    const element:ReactElement = {
      $$typeof:Symbol.for('du1React'),
      type:'div',
      key:'test-key',
      props:{},
      ref:null
    }
    const fiber = createFiberFromElement(element);
    expect(fiber.tag).toBe(HostComponent);
    expect(fiber.key).toBe(element.key);
    expect(fiber.elementType).toBe(element.type);
    expect(fiber.type).toBe(element.type);
  })
  test('测试函数组件',()=>{
    const fiber = createFiberFromElement(<Test/>);
    expect(fiber.tag).toBe(FunctionComponent);
    expect(fiber.type).toBe(Test);
  })
})
