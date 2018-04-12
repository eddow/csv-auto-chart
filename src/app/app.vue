<template>
	<div>
		<div>
			<router-link to="/chart">Chart</router-link>
			<router-link to="/logbook">LogBook</router-link>
		</div>
		<router-view></router-view>
	</div>
</template>
<script lang="ts">
import {Component} from 'vue-property-decorator'
import Vue from 'vue'

export default class Menu extends Vue {
}
</script>
