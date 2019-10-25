import { genHandlers } from './events'
import { ALWAYS_NORMALIZE } from '../../vdom/create-element'

export function generate (ast) {
  console.log('astastast', ast)
  const code = ast ? genElement(ast) : '_c("div")'
  return {
    render: `with(this){return ${code}}`
  }
}

export function genElement (el) {
  if (el.for && !el.forProcessed) {
    return genFor(el)
  } else if (el.if && !el.ifProcessed) {
    return genIf(el)
  } else {
    let code
    let data
    if (!el.plain) {
      data = genData(el)
    }

    const children = genChildren(el, true)
    code = `_c('${el.tag}'${
      data ? `,${data}` : '' // data
    }${
      children ? `,${children}` : '' // children
    })`
    return code
  }
}

export function genFor (el) {
  const exp = el.for
  const alias = el.alias

  el.forProcessed = true // 避免递归
  return `${'_l'}((${exp}),` +
    `function(${alias}){` +
      `return ${(genElement)(el)}` +
    '})'
}

export function genIf (el) {
  el.ifProcessed = true // 避免递归
  return genIfConditions(el.ifConditions.slice())
}

function genIfConditions (conditions) {
  if (!conditions.length) {
    return '_e()'
  }

  const condition = conditions.shift()
  if (condition.exp) {
    return `(${condition.exp})?${
      genTernaryExp(condition.block)
    }:${
      genIfConditions(conditions)
    }`
  } else {
    return `${genTernaryExp(condition.block)}`
  }

  function genTernaryExp (el) {
    return genElement(el)
  }
}

export function genChildren (el, checkSkip) {
  const children = el.children
  if (children.length) {
    const el = children[0]
    // optimize single v-for
    if (children.length === 1 && el.for) {
      const normalizationType = checkSkip
        ? `,0`
        : ``
      return `${(genElement)(el)}${normalizationType}`
    }
    const normalizationType = checkSkip
      ? getNormalizationType(children)
      : 0
    const gen = genNode
    return `[${children.map(c => gen(c)).join(',')}]${
      normalizationType ? `,${normalizationType}` : ''
    }`
  }
}

function getNormalizationType (children) {
  let res = 0
  for (let i = 0; i < children.length; i++) {
    const el = children[i]
    if (el.type !== 1) {
      continue
    }
    if (needsNormalization(el) || (el.ifConditions && el.ifConditions.some(c => needsNormalization(c.block)))) {
      res = ALWAYS_NORMALIZE
      break
    }
  }
  return res
}

function needsNormalization (el) {
  return el.for !== undefined
}

function genNode (node) {
  if (node.type === 1) {
    return genElement(node)
  } else if (node.type === 3 && node.isComment) {
    return genComment(node)
  } else {
    return genText(node)
  }
}

export function genText (text) {
  return `_v(${text.type === 2
    ? text.expression
    : transformSpecialNewlines(JSON.stringify(text.text))
  })`
}

export function genComment (comment) {
  return `_e(${JSON.stringify(comment.text)})`
}

function transformSpecialNewlines (text) {
  return text
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029')
}

export function genData (el) {
  let data = '{'

  if (el.refInFor) {
    data += `refInFor:true,`
  }

  // attributes
  if (el.attrs) {
    data += `attrs:${genProps(el.attrs)},`
  }
  // event handlers
  if (el.events) {
    data += `${genHandlers(el.events)},`
  }
  data = data.replace(/,$/, '') + '}'
  // v-bind data wrap
  if (el.wrapData) {
    data = el.wrapData(data)
  }
  // v-on data wrap
  if (el.wrapListeners) {
    data = el.wrapListeners(data)
  }
  return data
}

function genProps (props) {
  let staticProps = ``
  for (let i = 0; i < props.length; i++) {
    const prop = props[i]
    const value = transformSpecialNewlines(prop.value)
    staticProps += `"${prop.name}":${value},`
  }
  staticProps = `{${staticProps.slice(0, -1)}}`
  return staticProps
}

