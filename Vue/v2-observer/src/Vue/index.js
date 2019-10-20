import Watcher from './observer/Watcher'
import { observe } from './observer/Observer.js'

class Vue {
  constructor(options = {}) {
    this.$options = options;
    let data = (this._data = this.$options.data);
    // 将所有data最外层属性代理到Vue实例上
    Object.keys(data).forEach(key => this._proxy(key));
    // 监听数据
    observe(data);
  }
  $watch(expOrFn, cb) {
    new Watcher(this, expOrFn, cb);
  }
  _proxy(key) {
    Object.defineProperty(this, key, {
      configurable: true,
      enumerable: true,
      get: () => this._data[key],
      set: val => {
        this._data[key] = val;
      },
    });
  }
}

export default Vue;
