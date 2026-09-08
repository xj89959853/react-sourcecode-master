import type { Fiber } from "../reconciler/ReactInternalTypes";
import { precacheFiberNode } from "./ReactDOMComponentTree";

export type Instance = HTMLElement;
export type TextInstance = Text;
/**
 * 创建文本节点
 * @param text 
 * @returns TextInstance
 */
export function createTextInstance(text:string){
    return document.createTextNode(text);
}
/**
 * 创建DOM节点
 * @param type 
 * @returns instance
 */
export function createInstance(type:string,fiber:Fiber){
    let domElement = document.createElement(type);
    precacheFiberNode(fiber,domElement);
    return domElement;
}

/**
 * 关联dom节点之间的关系
 * @param parent 父节点
 * @param child 子节点
 */
export function appendChild(parent:Instance,child:Instance){
    parent.appendChild(child);
}
/**
 * 删除dom节点
 * @param parent 父节点
 * @param child 子节点
 */
export function removeChild(parent:Instance,child:Instance){
    parent.removeChild(child);
}

/**
 * 设置属性
 * @param dom 
 * @param props 
 */
export function setInitialProps(dom:Instance,props:any){
    for(const prop in props){
        if(!props.hasOwnProperty(prop)){
            continue;
        }
        if(prop === 'children'){
            if(typeof props.children === 'string' || typeof props.children === 'number'){
                dom.textContent = props.children;
            }
             continue;
        }
        dom.setAttribute(prop,props[prop]);
    }
}
