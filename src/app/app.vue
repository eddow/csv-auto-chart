<template>
	<div>
		<div class="ui two item inverted menu">
			<router-link :class="itemClass('/chart')" to="/chart">Chart</router-link>
			<router-link :class="itemClass('/logbook')" to="/logbook">LogBook</router-link>
		</div>
		<router-view></router-view>
	</div>
</template>
<script lang="ts">
import {Component} from 'vue-property-decorator'
import Vue from 'vue'

export default class Menu extends Vue {
	itemClass(path: string): string[] {
		var rv = ['item'];
		if(this.$route.path === path)
			rv.push('active');
		return rv;
	}
}
</script>
