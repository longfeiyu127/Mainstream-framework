import Dep from './Dep'

class Watcher {
  constructor(vm, expOrFn, cb) {
    this.depIds = {}; // 存储订阅者的id
    this.vm = vm; // vue实例
    this.expOrFn = expOrFn; // 订阅数据的key
    this.cb = cb; // 数据更新回调
    this.val = this.get();  // 首次实例收集依赖
  }
  get() {
    // 当前订阅者(Watcher)读取被订阅数据的值时，通知订阅者管理员收集当前订阅者
    Dep.target = this;
    const val = this.vm._data[this.expOrFn];
    Dep.target = null;
    return val
  }
  update() {
    this.run()
  }
  run () {
    const val = this.get();
    // 注意引用类型判断
    if (val !== this.val || isObject(val)) {
      this.val = val;
      this.cb.call(this.vm, val);
    }
  }
  addDep(dep) {
    if (!this.depIds.hasOwnProperty(dep.id)) {
      dep.addSub(this)
      this.depIds[dep.id] = dep;
    }
  }
}

function isObject (obj) {
  return obj !== null && typeof obj === 'object'
}

export default Watcher;
