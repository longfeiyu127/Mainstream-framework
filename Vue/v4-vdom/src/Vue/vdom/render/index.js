import { createElement } from '../create-element'
import { createTextVNode } from '../vnode'
import { renderList } from './render-helpers/render-list'
import { toString } from '../../util'

export function initRender (vm) {
  vm._vnode = null
  vm._c = (tag, data, children) => createElement(vm, tag, data, children)
  vm._v = createTextVNode
  vm._l = renderList
  vm._s = toString
}

