
import Dep from './Dep'

// 数据劫持
class Observer {
  constructor(value) {
    this.value = value;
    this.walk(value)
  }
  walk(value) {
    Object.keys(value).forEach(key => this.convert(key, value[key]))
  }
  convert(key, val) {
    defineReactive(this.value, key, val)
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

export function observe(value) {
  if (!value || typeof value !== 'object') {
    return;
  }
  return new Observer(value);
}
