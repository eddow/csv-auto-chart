<template>
	<logbook :data="data" :remarks="remarks" class="logbook" />
</template>
<style>
.logbook {
	width: 800px;
	height: 200px;
}
</style>
<script lang="ts">
import {Component} from 'vue-property-decorator'
import Vue from 'vue'
import * as testData from './logbook.json'
import * as remarks from './remarks.json'
import logbook from '../logbook/logbook.vue'

@Component({components: {logbook}})
export default class LogBookTest extends Vue {
	data = testData
	remarks = remarks
}
</script>