let uid = 0;

class Dep {
  constructor() {
    this.id = uid++;
    this.subs = [];
  }
  // 添加订阅者
  addSub(sub) {
    this.subs.push(sub)
  }
  // 通知订阅者更新
  notify() {
    this.subs.forEach(sub => sub.update())
  }
  // 
  depend() {
    Dep.target.addDep(this)
    // 若是新Dep，则会触发addSub重新添加订阅
  }
}

// Dep类的静态属性，运作时指向当前活跃的Watcher => 执行get 便于收集依赖时(排除不必要的依赖)
Dep.target = null;

export default Dep;
