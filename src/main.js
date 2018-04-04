
const $ = require('jquery')
window.jQuery = $
window.$ = $

import Vue from 'vue'

import App from './App.vue'
Vue.component('app', App)


new Vue({
}).$mount('#app')
