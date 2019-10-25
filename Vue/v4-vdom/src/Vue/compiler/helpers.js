export function addAttr (el, name, value) {
  const attrs = el.attrs || (el.attrs = [])
  attrs.push({ name, value })
  el.plain = false
}

export function addHandler (el, name, value) {
  let events = el.events || (el.events = {})
  const newHandler = { value: value.trim() }
  const handlers = events[name]
  if (Array.isArray(handlers)) {
    handlers.push(newHandler)
  } else if (handlers) {
    events[name] = [handlers, newHandler]
  } else {
    events[name] = newHandler
  }
  el.plain = false
}

export function getBindingAttr (el, name) {
  const staticValue = getAndRemoveAttr(el, name)
  if (staticValue != null) {
    return JSON.stringify(staticValue)
  }
}

export function getAndRemoveAttr (el, name, removeFromMap) {
  let val
  if ((val = el.attrsMap[name]) != null) {
    const list = el.attrsList
    for (let i = 0, l = list.length; i < l; i++) {
      if (list[i].name === name) {
        list.splice(i, 1)
        break
      }
    }
  }
  if (removeFromMap) {
    delete el.attrsMap[name]
  }
  return val
}
