import { FiberRoot } from "./ReactInternalTypes";

export function createFiberRoot(containerInfo:HTMLElement):FiberRoot{
    const root:FiberRoot = {
        containerInfo,
    }
    return root;
}

