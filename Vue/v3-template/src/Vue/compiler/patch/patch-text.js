import Watcher from '../../observer/Watcher'
import { isUndef } from "../../util";
const defaultTagRE = /\{\{(.*)\}\}/

export default function patchText(node, vm, text) {
  if (defaultTagRE.test(text)) {
    const exp = defaultTagRE.exec(text)[1]
    const initText = vm[exp];
    updateText(node, initText);
    new Watcher(vm, exp, (value) => updateText(node, value));
  }
}

function updateText(node, value) {
  node.textContent = isUndef(value) ? '' : value;
}
