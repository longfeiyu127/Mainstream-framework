import parseHTML from "./parser/html-parser";
import patch from "./patch/index";

export function compiler(vm) {
  const {template, el} = vm.$options
  const node = parseHTML(template)
  patch(node, vm)
  const root = document.querySelector(el)
  root.appendChild(node)
}