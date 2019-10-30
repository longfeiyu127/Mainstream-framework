import Vue from "./Vue/index.js"

const inputDom = document.querySelector('#input');
const spanDom = document.querySelector('#span');
const span1Dom = document.querySelector('#span1');
const buttonDom = document.querySelector('#button');

let vm = new Vue({
  data: {
    txt: '',
    arr: []
  },
});

inputDom.addEventListener('input', e => vm.txt = e.target.value);

buttonDom.addEventListener('click', e => vm.arr.push(1));

vm.$watch('txt', txt => spanDom.innerHTML = txt);
vm.$watch('arr', arr => span1Dom.innerHTML = arr);
