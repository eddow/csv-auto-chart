<template>
	<div id="logbook"></div>
</template>
<style>
#logbook {
	width: 1000px;
	height: 500px;
}
</style>
<script lang="ts">
import {Component} from 'vue-property-decorator'
import Vue from 'vue'
import * as Plottable from 'plottable'
import * as testData from './logbook.json'
const stateNames = ['Off duty', 'Sleeper', 'Driving', 'On duty'];
function dayTime(hhmm) {
	var hm = hhmm.split(':');
	return new Date(0, 0, 0, +hm[0], +hm[1]);
}
@Component
export default class LogBookTest extends Vue {
	chart: Plottable.Components.Table
	data: any = testData
	mounted() {
		this.redraw();
	}

	redraw() {
		//just ignore exceptions for now
		try { this.redrawPlottable(); } catch(x) { console.error(x.stack); }
	}
	redrawPlottable() {
		if(this.chart) this.chart.destroy();
		delete this.chart;
		
		var xScale = new Plottable.Scales.Time().domain([dayTime('00:00'), dayTime('24:00')]);
		//xScale.tickGenerator(()=> new Array(24).map((x,ndx)=> new Date(0, 0, 0, ndx)));
		var displacement = 0.15;
		var yScale = new Plottable.Scales.Linear().domain([displacement, 5-displacement]);
		yScale.tickGenerator(()=> [1.5, 2.5, 3.5]);
		
		var xAxis = new Plottable.Axes.Time(xScale, "top");
		var yAxis = new Plottable.Axes.Numeric(yScale, "left");
		var stateScale = new Plottable.Scales.Category().domain(stateNames);
		var stateAxis = new Plottable.Axes.Category(stateScale, "left");
		//stateScale.innerPadding(0).outerPadding(0);

		var tiers = [];
		var newConfigs = [];
		tiers.push({
			formatter: Plottable.Formatters.time("%H"),
			interval: Plottable.TimeInterval.hour,
			step: 1
		});
		newConfigs.push(tiers);
		xAxis.axisConfigurations(newConfigs);

		var doubledData = [].concat(this.data.states);
		for(let i=0; i<doubledData.length; i+=2) {
			doubledData.splice(i+1, 0, {
				type: doubledData[i].type,
				time: i+1<doubledData.length ? doubledData[i+1].time : '24:00'
			});
		}
		var dataset = new Plottable.Dataset(doubledData);

		var plot = new Plottable.Plots.Line();
		plot.x(d=> dayTime(d.time), xScale);
		plot.y(d=> 5-d.type, yScale);
		plot.addDataset(dataset);
		
		var gridlines = new Plottable.Components.Gridlines(xScale, yScale);
		var group = new Plottable.Components.Group([plot, gridlines]);
		this.chart = new Plottable.Components.Table([
			[null, xAxis],
			[stateAxis, group]
		]);
		this.chart.renderTo("#logbook");
	}
}
</script>