/* @flow */

import { parseHTML } from './html-parser'
import { parseText } from './text-parser'
import { extend } from '../../util'

import {
  addAttr,
  addHandler,
  getBindingAttr,
  getAndRemoveAttr,
} from '../helpers'

export const onRE = /^@|^v-on:/
export const dirRE = /^v-|^@|^:|^#/
export const forAliasRE = /([\s\S]*?)\s+(?:in|of)\s+([\s\S]*)/
const stripParensRE = /^\(|\)$/g

export const bindRE = /^:|^\.|^v-bind:/

export const warn = msg => console.error(`vue err: ${msg}`)

export function createASTElement (
  tag,
  attrs,
  parent
) {
  return {
    type: 1,
    tag,
    attrsList: attrs,
    attrsMap: makeAttrsMap(attrs),
    rawAttrsMap: {},
    parent,
    children: []
  }
}

/**
 * 将模版字符串转换为AST
 */
export function parse (template) {
  const stack = []
  let root
  let currentParent

  function closeElement (element) {
    // 删除尾部空节点
    trimEndingWhitespace(element)
    element = processElement(element)
    if (currentParent) {
      // 判断else/else-if
      if (element.elseif || element.else) {
        processIfConditions(element, currentParent)
      } else {
        currentParent.children.push(element)
        element.parent = currentParent
      }
    }
    // 删除尾部空节点
    trimEndingWhitespace(element)
  }

  function trimEndingWhitespace (el) {
    let lastNode
    while (
      (lastNode = el.children[el.children.length - 1]) &&
      lastNode.type === 3 &&
      lastNode.text === ' '
    ) {
      el.children.pop()
    }
  }

  parseHTML(template, {
    start (tag, attrs, unary) {
      let element = createASTElement(tag, attrs, currentParent)
      processFor(element)
      processIf(element)

      if (!root) root = element

      if (!unary) {
        currentParent = element
        stack.push(element)
      } else {
        closeElement(element)
      }
    },

    end () {
      const element = stack[stack.length - 1]
      // pop stack
      stack.length -= 1
      currentParent = stack[stack.length - 1]
      closeElement(element)
    },

    chars (text) {
      if (!currentParent) {
        return
      }
      const children = currentParent.children
      if (!text.trim()) {
        if (!text.trim() && !children.length) {
          // 空节点
          text = ''
        } else {
          text = ' '
        }
      }
      if (text) {
        let res
        let child
        if (text !== ' ' && (res = parseText(text))) {
          // 表达式文本
          child = {
            type: 2,
            expression: res.expression,
            tokens: res.tokens,
            text
          }
        } else if (text !== ' ' || !children.length || children[children.length - 1].text !== ' ') {
          // 静态文本
          child = {
            type: 3,
            text
          }
        }
        if (child) {
          children.push(child)
        }
      }
    }
  })
  return root
}

export function processElement (element) {
  processKey(element)

  // 判断是否是为普通元素
  element.plain = (
    !element.key &&
    !element.attrsList.length
  )
  processAttrs(element)
  return element
}

function processKey (el) {
  const exp = getBindingAttr(el, 'key')
  if (exp) {
    el.key = exp
  }
}

export function processFor (el) {
  let exp
  if ((exp = getAndRemoveAttr(el, 'v-for'))) {
    const res = parseFor(exp)
    if (res) {
      extend(el, res)
    }
  }
}

export function parseFor (exp) {
  const inMatch = exp.match(forAliasRE)
  if (!inMatch) return
  const res = {}
  res.for = inMatch[2].trim()
  const alias = inMatch[1].trim().replace(stripParensRE, '')
  res.alias = alias
  return res
}

function processIf (el) {
  const exp = getAndRemoveAttr(el, 'v-if')
  if (exp) {
    el.if = exp
    addIfCondition(el, {
      exp: exp,
      block: el
    })
  } else {
    if (getAndRemoveAttr(el, 'v-else') != null) {
      el.else = true
    }
    const elseif = getAndRemoveAttr(el, 'v-else-if')
    if (elseif) {
      el.elseif = elseif
    }
  }
}

function processIfConditions (el, parent) {
  const prev = findPrevElement(parent.children)
  if (prev && prev.if) {
    addIfCondition(prev, {
      exp: el.elseif,
      block: el
    })
  }
}

function findPrevElement (children) {
  let i = children.length
  while (i--) {
    if (children[i].type === 1) {
      return children[i]
    } else {
      children.pop()
    }
  }
}

export function addIfCondition (el, condition) {
  if (!el.ifConditions) {
    el.ifConditions = []
  }
  el.ifConditions.push(condition)
}

function processAttrs (el) {
  const list = el.attrsList
  console.log('listlist', list)
  let i, l, name, value
  for (i = 0, l = list.length; i < l; i++) {
    name = list[i].name
    value = list[i].value
    if (dirRE.test(name)) {
      // 标记元素为动态
      el.hasBindings = true
      if (bindRE.test(name)) { // v-bind
        name = name.replace(bindRE, '')
        addAttr(el, name, value)
      } else if (onRE.test(name)) { // v-on
        name = name.replace(onRE, '')
        addHandler(el, name, value)
      } else {
        // 可以自定义指令
        // ...
      }
    } else {
      // 静态属性
      addAttr(el, name, JSON.stringify(value))
    }
  }
}

function makeAttrsMap (attrs) {
  const map = {}
  for (let i = 0, l = attrs.length; i < l; i++) {
    map[attrs[i].name] = attrs[i].value
  }
  return map
}
