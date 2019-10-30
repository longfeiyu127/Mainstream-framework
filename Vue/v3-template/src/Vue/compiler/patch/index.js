import patchElement from "./patch-element";
import patchText from "./patch-text";

export default function patch(el, vm) {
  const childNodes = el.childNodes;
  [].slice.call(childNodes).forEach(function(node) {
      const text = node.textContent;

      if (node.nodeType == 1) {  
        // 元素节点
        patchElement(node, vm);
      } else if (node.nodeType == 3) {
        // 文本节点
        patchText(node, vm, text);
      }

      if (node.childNodes && node.childNodes.length) {
        patch(node, vm);
      }
  });
  return el
}
