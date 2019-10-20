import Watcher from '../../observer/Watcher'
import patch from "../patch/index";
import { isUndef, isFun } from "../../util";
const forAliasRE = /([\s\S]*?)\s+(?:in|of)\s+([\s\S]*)/

export function handleBind (node, vm, exp, dir) {
  const val = vm[exp];
  updateAttr(node, val);
  new Watcher(vm, exp, (value) => updateAttr(node, value));
}

const updateAttr = (node, attr, value) => node.setAttribute(attr, isUndef(value) ? '' : value);

export function handleEvent (node, vm, exp, dir) {
  const eventType = dir;
  const cb = isFun(exp) ? exp : vm[exp].bind(vm);
  if (eventType && cb) {
    node.addEventListener(eventType, e => cb(e), false);
  }
}

export function handleModel (node, vm, exp, dir) {
  let val = vm[exp];
  updateModel(node, val);
  new Watcher(vm, exp, (value) => updateModel(node, value));
  handleEvent(node, vm, (e) => {
    const newValue = e.target.value;
    if (val === newValue) return;
    vm[exp] = newValue;
    val = newValue;
  }, 'input')
}

const updateModel = (node, value) => node.value = isUndef(value) ? '' : value;

export function handleIf (node, vm, exp, dir) {
  const targetDisplay = node.style.display
  if (dir === 'v-if') {
    node.setAttribute('data-if', exp)
    let val = vm[exp];
    toggle(node, targetDisplay, val)
    new Watcher(vm, exp, (newValue) => {
      if (newValue == val) return
      toggle(node, targetDisplay, newValue)
      vm[exp] = newValue;
      val = newValue
    });
  } else {
    const preNode = node.previousElementSibling;
    const ifExp = preNode.getAttribute('data-if')
    let val = vm[ifExp];
    toggle(node, targetDisplay, !val)
    new Watcher(vm, ifExp, (newValue) => {
      if (newValue == val) return
      toggle(node, targetDisplay, !newValue)
      val = newValue
    });
  }
}

function toggle(node, display, flag) {
  node.style.display = flag ? display : 'none'
}

export function handleFor (node, vm, exp) {
  const inMatch = exp.match(forAliasRE)
  if (!inMatch) return;
  exp = inMatch[2].trim();
  const alias = inMatch[1].trim();
  const val = vm[exp];
  const oldIndex = getIndex(node);
  const parentNode = node.parentNode;
  parentNode.removeChild(node);
  node.removeAttribute('v-for');
  const templateNode = node.cloneNode(true);
  appendForNode(parentNode, templateNode, val, alias, oldIndex);
  new Watcher(vm, exp, (value) => appendForNode(parentNode, templateNode, val, alias, oldIndex));
}

function appendForNode(parentNode, node, arr, alias, oldIndex) {
  removeOldNode(parentNode, oldIndex)
  for (const key in arr) {
    const templateNode = node.cloneNode(true)
    const patchNode = patch(templateNode, {[alias]: arr[key]})
    patchNode.setAttribute('data-for', true)
    parentNode.appendChild(patchNode)
  }
}

function removeOldNode(parentNode, oldIndex) {
  let a = parentNode.childNodes
  const childNodes = parentNode.childNodes
  let oldNode = childNodes[oldIndex]
  while (oldNode && oldNode.getAttribute('data-for')) {
    const removeNode = oldNode
    oldNode = oldNode.nextSibling
    parentNode.removeChild(removeNode)
  }
}

function getIndex(node) {
  const childNodes = node.parentNode.childNodes
  for(let i = 0, l = childNodes.length;i < l; i++ ){
      if(node == childNodes[i]){
        return i;
    }
  }
  return -1
}

