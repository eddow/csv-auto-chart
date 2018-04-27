<template>
    <div class="ui grid">
			<form class="three wide column">
				<input type=file @change="processFile($event)" accept=".csv" />
				<table>
					<thead>
						<tr>
							<th>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</th>
							<th>X</th>
							<th>Y</th>
							<th>&nbsp;</th>
						</tr>
					</thead>
					<tbody>
						<tr v-for="(title, index) in columns" :key="index">
							<th>{{title}}</th>
							<td>
								<input type="radio" name="xAxis" :value="title" v-model="axes.x" />
							</td>
							<td>
								<input type="checkbox" name="yAxis" :value="title" v-model="axes.y" />
							</td>
							<td v-if="colors[title]" :style="{'background-color': colors[title]}">
								&nbsp;
							</td>
						</tr>
					</tbody>
				</table>
			</form>
			<div class="thirteen wide column">
				<chart :x-axis="axes.x" :y-axes="axes.y" :data="data" :columns="columns" :colors="colors" />
			</div>
    </div>
</template>
<style>
.columns td {
	text-align: center;
}
</style>
<script lang="ts">
import {Component} from 'vue-property-decorator'
import Vue from 'vue'
import * as d3 from 'd3'
import chart from '../chart/chart.vue'
import * as Plottable from 'plottable'

@Component({components: {chart}})
export default class ChartTest extends Vue {
	chart: Plottable.Components.Table

	data: any[] = []
	columns: string[] = []
	axes: any = {
		x: '',
		y: []
	}
	get colors() {
		var colors = {};
		var colorScale = new Plottable.Scales.Color();
		for(let v of this.axes.y)
			colors[v] = colorScale.scale(v);
		return colors;
	}

	processFile($event) {
		var file = $event.target.files[0],
			me = this;
		if (file) {
			var reader = new FileReader();
			reader.readAsText(file, "UTF-8");
			reader.onload = function (evt) {
				var data = d3.csvParse((<any>evt.target).result),
					parseTime = d3.timeParse('%m/%e/%Y');
				me.data = data//.slice(0, 200)
					.map((x: any)=> {
						for(let i in x)
							if('string'=== typeof x[i]) {
								if(!isNaN(x[i]))
									x[i] = +x[i];
								else if(/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(x[i]))
									x[i] = parseTime(x[i]);
							}
						return x;
					});
				me.columns = data.columns;
				if(~me.columns.indexOf('Date')) me.axes.x = 'Date';
			}
			reader.onerror = function (evt) {
				alert('Error reading file');
			}
		}
	}
}
</script>