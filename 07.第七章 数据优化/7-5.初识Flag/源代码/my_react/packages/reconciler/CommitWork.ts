import { appendChild } from "packages/react-dom-binding/FiberConfigDOM";
import type { Fiber } from "./ReactInternalTypes";

/**
 * 提交之突变副作用——
 * 更新dom树
 * @param fiber hostRootFiber
 */
export function commitMutationEffects(fiber:Fiber){
    appendChild(fiber.stateNode.containerInfo,fiber.child?.stateNode);
}