<template>
	<div ref="chart"></div>
</template>
<script lang="ts">
import {Component, Prop, Watch} from 'vue-property-decorator'
import Vue from 'vue'
import * as Plottable from 'plottable'

@Component
export default class ChartTest extends Vue {
	chart: Plottable.Components.Table

	@Prop({required: true}) data: any[]
	@Prop({required: true}) columns: string[]
	@Prop({required: true}) xAxis: string
	@Prop({required: true}) yAxes: string[]
	@Prop({required: true}) colors: {[key: string]: string}

	//unsuitable for if data could be modified bit by bit
	@Watch('data', {deep: true})
	@Watch('xAxis')
	@Watch('yAxes', {deep: true})
	@Watch('colors', {deep: true})
	redraw() {
		if(!this.xAxis) return;
		if(!this.yAxes.length) return;
		if(this.chart) this.chart.destroy();
		delete this.chart;

		var xDate = this.data[0][this.xAxis] instanceof Date;
		var xScale = xDate?
			new Plottable.Scales.Time() :
			new Plottable.Scales.Linear();

		var xAxis = xDate?
			new Plottable.Axes.Time(<Plottable.Scales.Time>xScale, "bottom") :
			new Plottable.Axes.Numeric(<Plottable.Scales.Linear>xScale, "bottom");
		var yScale = new Plottable.Scales.Linear();
		var yAxis = new Plottable.Axes.Numeric(yScale, "left");
		if(xDate) {
			(<Plottable.Axes.Time>xAxis).annotationsEnabled(true);
		}

		var plots = new Plottable.Components.Group();

		function plot(data, xAttr, yAttr, color) {
			return new Plottable.Plots.Line()
				.addDataset(new Plottable.Dataset(data))
				.x(d=> d[xAttr], xScale)
				.y(d=> d[yAttr], yScale)
				.attr("stroke", color)
				.attr("stroke-width", 1)
		}
		for(let y of this.yAxes) {
			plots.append(plot(this.data, this.xAxis, y, this.colors[y]));
		}

		this.chart = new Plottable.Components.Table([
			[yAxis, plots],
			[null, xAxis]
		]);

		this.chart.renderTo(<HTMLElement>this.$refs.chart);
	}
}
</script>