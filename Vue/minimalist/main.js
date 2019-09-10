const obj = {};

const inputDom = document.querySelector('#input');
const spanDom = document.querySelector('#span');

Object.defineProperty(obj, 'txt', {
  get() {},
  set(newVal) {
    inputDom.value = newVal;
    spanDom.innerHTML = newVal;
  }
})

inputDom.addEventListener('input', (e) => {
  obj.txt = e.target.value
})

