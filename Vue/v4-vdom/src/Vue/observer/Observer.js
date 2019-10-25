import { arrayMethods } from './array'
import Dep from './Dep'
import { def } from './util'

// 数据劫持
class Observer {
  constructor(value) {
    this.value = value
    this.dep = new Dep()
    def(value, '__ob__', this)
    if (Array.isArray(value)) {
      protoAugment(value, arrayMethods)
      this.observeArray(value)
    } else {
      this.walk(value)
    }
  }
  walk(value) {
    Object.keys(value).forEach(key => this.convert(key, value[key]))
  }
  convert(key, val) {
    defineReactive(this.value, key, val)
  }
  observeArray (items) {
    for (let i = 0, l = items.length; i < l; i++) {
      observe(items[i])
    }
  }
}

function defineReactive(obj, key, val) {
  const dep = new Dep();
  // 递归添加数据劫持
  let chlidOb = observe(val);
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get() {
      if (Dep.target) {
        dep.depend();
        if (chlidOb) {
          chlidOb.dep.depend()
          if (Array.isArray(val)) {
            dependArray(val)
          }
        }
      }
      return val
    },
    set(newVal) {
      if (newVal === val) return;
      val = newVal;
      chlidOb = observe(newVal);
      dep.notify()
    }
  })
}

function protoAugment (target, src) {
  target.__proto__ = src
}

function dependArray (value) {
  for (let e, i = 0, l = value.length; i < l; i++) {
    e = value[i]
    e && e.__ob__ && e.__ob__.dep.depend()
    if (Array.isArray(e)) {
      dependArray(e)
    }
  }
}


export function observe(value) {
  if (!value || typeof value !== 'object') {
    return;
  }
  return new Observer(value);
}
