import Vue from "./Vue/index.js"

let vm = new Vue({
  el: '#app',
  template: 
  `<div>
    <input v-model="txt" type="text"/>
    <input @input="input" type="text"/>
    <br />
    <label>值:<span>{{txt}}</span></label>
    <br />
    <button @click="addArr">数组+1</button>
    <br />
    <label>数组:<span v-for="item in arr">{{item}}</span></label>
    <br />
    <label v-if="txt">是:<span>{{txt}}</span></label>
    <label v-else="txt">否</label>
  </div>`,
  data: {
    txt: '',
    arr: [1, 2, 3]
  },
  methods: {
    input(e) {
      const newValue = e.target.value;
      if (this.txt === newValue) return;
      this.txt = newValue;
    },
    addArr() {
      this.arr.push(this.arr.length + 1)
    }
  }
});
