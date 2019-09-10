import Vue from "./Vue/index.js"

const inputDom = document.querySelector('#input');
const spanDom = document.querySelector('#span');

let vm = new Vue({
  data: {
    txt: '',
  },
});

inputDom.addEventListener('input', (e) => {
  vm.txt = e.target.value;
});

vm.$watch('txt', txt => spanDom.innerHTML = txt);
