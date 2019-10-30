import { createTextVNode } from '../../vnode'
import { isDef, isUndef } from '../../../util'

export function normalizeChildren (children) {
  return Array.isArray(children)
  ? normalizeArrayChildren(children)
  : undefined
}

function isTextNode (node) {
  return isDef(node) && isDef(node.text)
}

function normalizeArrayChildren (children, nestedIndex) {
  const res = []
  let i, c, lastIndex, last
  for (i = 0; i < children.length; i++) {
    c = children[i]
    if (isUndef(c) || typeof c === 'boolean') continue
    lastIndex = res.length - 1
    last = res[lastIndex]
    if (Array.isArray(c)) {
      if (c.length > 0) {
        c = normalizeArrayChildren(c, `${nestedIndex || ''}_${i}`)
        // 合并相邻的文本节点
        if (isTextNode(c[0]) && isTextNode(last)) {
          res[lastIndex] = createTextVNode(last.text + (c[0]).text)
          c.shift()
        }
        res.push.apply(res, c)
      }
    } else {
      if (isTextNode(c) && isTextNode(last)) {
        // 合并相邻的文本节点
        res[lastIndex] = createTextVNode(last.text + c.text)
      } else {
        if (children._isVList === true &&
          isDef(c.tag) &&
          isUndef(c.key) &&
          isDef(nestedIndex)) {
          // 嵌套数组子元素的默认键
          c.key = `__vlist${nestedIndex}_${i}__`
        }
        res.push(c)
      }
    }
  }
  return res
}
