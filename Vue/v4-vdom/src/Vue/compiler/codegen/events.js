const fnInvokeRE = /\([^)]*?\);*$/
const simplePathRE = /^[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*|\['[^']*?']|\["[^"]*?"]|\[\d+]|\[[A-Za-z_$][\w$]*])*$/

export function genHandlers (events) {
  const prefix = 'on:'
  let staticHandlers = ``
  for (const name in events) {
    const handlerCode = genHandler(events[name])
    staticHandlers += `"${name}":${handlerCode},`
  }
  staticHandlers = `{${staticHandlers.slice(0, -1)}}`
  return prefix + staticHandlers
}

function genHandler (handler) {
  if (!handler) {
    return 'function(){}'
  }

  if (Array.isArray(handler)) {
    return `[${handler.map(handler => genHandler(handler)).join(',')}]`
  }

  const isMethodPath = simplePathRE.test(handler.value)
  const isFunctionInvocation = simplePathRE.test(handler.value.replace(fnInvokeRE, ''))

  if (isMethodPath) {
    return handler.value
  }
  return `function($event){${
    isFunctionInvocation ? `return ${handler.value}` : handler.value
  }}`
}
