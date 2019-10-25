import Watcher from './observer/Watcher'
import { observe } from './observer/Observer.js'
import { createCompiler } from './compiler/index'
import { initRender } from './vdom/render/index'
import { initUpdate } from './vdom/update/index'

class Vue {
  constructor(options = {}) {
    this.$options = options;
    this.el = options.el
    let data = (this._data = this.$options.data);
    let methods = (this._methods = this.$options.methods);
    // 将所有data/methods最外层属性代理到Vue实例上
    Object.keys(data).forEach(key => this._proxy(key));
    Object.keys(methods).forEach(key => this[key] = methods[key].bind(this));
    // 编译模版
    const code = createCompiler(this.$options.template || '<div></div>')
    this._ast = code.ast
    this._render = code.renderFn
    // this._renderString = code.render
    console.log('code:', code)
    // 监听数据
    observe(data);
    // 执行render
    initRender(this)
    initUpdate(this)
    this._update(this._render.call(this), false)
    console.log('$vnode', this._vnode)
    console.log(this)
    this.$mount(this)
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
