import { isDef } from '../../../util'

export function renderList (val, render) {
  let ret, i, l
  if (Array.isArray(val) || typeof val === 'string') {
    ret = new Array(val.length)
    for (i = 0, l = val.length; i < l; i++) {
      ret[i] = render(val[i], i)
    }
  } else if (typeof val === 'number') {
    ret = new Array(val)
    for (i = 0; i < val; i++) {
      ret[i] = render(i + 1, i)
    }
  }
  if (!isDef(ret)) {
    ret = []
  }
  (ret)._isVList = true
  return ret
}
