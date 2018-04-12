<template>
    <div>
			<input type=file @change="processFile($event)" accept=".csv" />
			<form>
				<table class="columns">
					<thead>
						<tr>
							<th>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</th>
							<th>X</th>
							<th>Y</th>
						</tr>
					</thead>
					<tbody>
						<tr v-for="(title, index) in columns" :key="index">
							<th>{{title}}</th>
							<td>
								<input type="radio" name="xAxis" :value="title" v-model="axis.x" @change="redraw" />
							</td>
							<td>
								<input type="radio" name="leftAxis" :value="title" v-model="axis.left" @change="redraw" />
							</td>
						</tr>
					</tbody>
				</table>
				<div id="chart"></div>
			</form>
    </div>
</template>
<style>
.columns {
	width: 20%;
	display: inline-table;
}
.columns td {
	text-align: center;
}
#chart {
	width: 70%;
	height: 500px;
	display: inline-block;
}
</style>
<script lang="ts">
import {Component} from 'vue-property-decorator'
import Vue from 'vue'
import d3 from 'd3'
import Plottable from 'plottable'

@Component
export default class ChartTest extends Vue {
	chart: Plottable.Components.Table

	data: any[] = []
	columns: string[] = []
	axis: any = {
		x: null,
		left: null,
		right: null
	}

	redraw() {
		if(!this.axis.x) return;
		if(!this.axis.left) return;
		//just ignore exceptions for now
		try { this.redrawPlottable(); } catch(x) {}
	}
	redrawPlottable() {
		if(this.chart) this.chart.destroy();
		delete this.chart;

		var xDate = this.data[0][this.axis.x] instanceof Date;
		var xScale = xDate?
			new Plottable.Scales.Time() :
			new Plottable.Scales.Linear();

		var xAxis = xDate?
			new Plottable.Axes.Time(<Plottable.Scales.Time>xScale, "bottom") :
			new Plottable.Axes.Numeric(<Plottable.Scales.Linear>xScale, "bottom");
		var yScale = new Plottable.Scales.Linear();
		var yAxis = new Plottable.Axes.Numeric(yScale, "left");
		if(xDate) {
			var tiers = [];
			var newConfigs = [];
			tiers.push({ formatter: Plottable.Formatters.time("%Y"),
					interval: Plottable.TimeInterval.year,
					step: 1 });
			newConfigs.push(tiers);
			(<Plottable.Axes.Time>xAxis).axisConfigurations(newConfigs);
		}

		var plot = new Plottable.Plots.Line();
		plot.x(d=> d[this.axis.x], xScale);
		plot.y(d=> d[this.axis.left], yScale);

		var dataset = new Plottable.Dataset(this.data);
		plot.addDataset(dataset);

		this.chart = new Plottable.Components.Table([
			[yAxis, plot],
			[null, xAxis]
		]);

		this.chart.renderTo("#chart");
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
				if(~me.columns.indexOf('Date')) me.axis.x = 'Date';
			}
			reader.onerror = function (evt) {
				alert('Error reading file');
			}
		}
	}
}
</script>