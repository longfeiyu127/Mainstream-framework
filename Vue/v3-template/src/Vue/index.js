import Watcher from './observer/Watcher'
import { observe } from './observer/Observer.js'
import { compiler } from "./compiler/index";

class Vue {
  constructor(options = {}) {
    this.$options = options;
    const data = (this._data = this.$options.data);
    const methods = (this._methods = this.$options.methods);
    // 将所有data/methods最外层属性代理到Vue实例上
    Object.keys(data).forEach(key => this._proxy(key, '_data'));
    Object.keys(methods).forEach(key => this._proxy(key, '_methods'));
    // 监听数据
    observe(data);
    // 编译模版
    compiler(this)
  }
  $watch(expOrFn, cb) {
    new Watcher(this, expOrFn, cb);
  }
  _proxy(key, attr) {
    Object.defineProperty(this, key, {
      configurable: true,
      enumerable: true,
      get: () => this[attr][key],
      set: val => this[attr][key] = val
    });
  }
}

export default Vue;
