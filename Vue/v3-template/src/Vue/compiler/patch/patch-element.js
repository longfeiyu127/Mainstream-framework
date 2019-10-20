import { handleBind, handleEvent, handleModel, handleIf, handleFor } from "../directives/index";

const onRE = /^@|^v-on:/
const dirRE = /^v-|^@|^:|^#/
const forAliasRE = /([\s\S]*?)\s+(?:in|of)\s+([\s\S]*)/
const forIteratorRE = /,([^,\}\]]*)(?:,([^,\}\]]*))?$/

const bindRE = /^:|^\.|^v-bind:/
const modelRE = /^v-model$/
const forRE = /^v-for$/

const ifArr = ['v-if', 'v-else']

export default function patchElement(node, vm) {
  const nodeAttrs = node.attributes;
  const nodeAttrsArr = Array.from(nodeAttrs)
  nodeAttrsArr.forEach((attr) => {
    const { name, value } = attr;
    // 默认指令
    if (dirRE.test(name)) {
      if (bindRE.test(name)) {  // v-bind
        const dir = name.replace(bindRE, '')
        handleBind(node, vm, value, dir)
      } else if (modelRE.test(name)) {  // v-model
        const dir = name.replace(modelRE, '')
        handleModel(node, vm, value, dir)
      } else if (onRE.test(name)) {  // v-on/@
        const dir = name.replace(onRE, '')
        handleEvent(node, vm, value, dir)
      } else if (ifArr.includes(name)) {  // v-if/v-else/v-else-if
        handleIf(node, vm, value, name)
      } else if (forRE.test(name)) {  // for
        handleFor(node, vm, value)
      }
      node.removeAttribute(name);
    }
  })
  return node
};
