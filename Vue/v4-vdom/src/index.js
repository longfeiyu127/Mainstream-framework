import Vue from "./Vue/index.js"
let vm = new Vue({
  template: `
    <div>
      <input @input="input" type="text"/>
      <br />
      <label>值:<span>{{ txt }}</span></label>
      <br />
      <button @click="addArr">数组+1</button>
      <br />
      <label>数组:<span v-for="item in arr">{{ item }}</span></label>
      <br />
      <label v-if="txt">是:<span v-bind:data="111">{{txt}}</span></label>
      <label v-else>否</label>
    </div>`,
  el: '#app',
  data: {
    txt: '',
    arr: [1,2]
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

