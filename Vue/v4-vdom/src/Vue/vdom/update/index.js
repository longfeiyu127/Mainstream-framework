import { patch } from './patch'
import Watcher from '../../observer/Watcher';
export function initUpdate (vm) {
  vm._update = function (vnode, hydrating) {
    const prevVnode = vm._vnode
    vm._vnode = vnode
    if (!prevVnode) {
      // initial
      vm.$el = patch(vm.$el, vnode, hydrating, false /* removeOnly */)
    } else {
      // updates
      vm.$el = patch(prevVnode, vnode)
    }
  }
  vm.$mount = function (vm) {
    // 更新时
    let updateComponent = () => {
      vm._update(vm._render(), true)
    }
    new Watcher(vm, updateComponent, ()=>{}, undefined, true)
  }
}
