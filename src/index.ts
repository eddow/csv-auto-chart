//Global variable used by plottable
declare var window: any
window.__VERSION__ = 'tested';

import 'plottable_css'
import 'semantic-ui/dist/semantic.min.css'
import 'd3-selection-multi'

import testChart from './test-chart/test-chart.vue'
import testLogbook from './test-logbook/test-logbook.vue'

const routes = [
	{ path: '/chart', component: testChart },
	{ path: '/logbook', component: testLogbook }
];

import VueRouter from 'vue-router'

const router = new VueRouter({
  routes
})
import App from './app/app.vue'
import Vue from 'vue';
Vue.use(VueRouter);
new App({
	router,
	el: 'app'
});
