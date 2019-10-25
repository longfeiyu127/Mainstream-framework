import VNode, { createEmptyVNode } from './vnode'

import { isDef } from '../util'

import { normalizeChildren } from './render/render-helpers/normalize-children'

export const ALWAYS_NORMALIZE = 2 // children存在v-for

export function createElement (
  context,
  tag,
  data,
  children
) {
  let normalizationType
  
  if (Array.isArray(data)) {
    normalizationType = children
    children = data
    data = undefined
  }
  const result = _createElement(context, tag, data, children, normalizationType)
  return result
}

export function _createElement (
  context,
  tag,
  data,
  children,
  normalizationType
) {
  if (isDef(data) && isDef((data).__ob__)) {
    return createEmptyVNode()
  }
  if (normalizationType === ALWAYS_NORMALIZE) {
    children = normalizeChildren(children)
  }
  let vnode
  if (typeof tag === 'string') {
    vnode = new VNode(
      tag, data, children,
      undefined, undefined, context
    )
  }
  if (isDef(vnode)) {
    return vnode
  } else {
    return createEmptyVNode()
  }
}
