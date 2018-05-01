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
		if(!(this.data[0][this.xAxis] instanceof Date)) return;
		if(this.chart) this.chart.destroy();
		delete this.chart;

		var xScale = new Plottable.Scales.Time();

		var xAxis = new Plottable.Axes.Time(<Plottable.Scales.Time>xScale, "bottom");
		var yScale = new Plottable.Scales.Linear();
		var yAxis = new Plottable.Axes.Numeric(yScale, "left");
		(<Plottable.Axes.Time>xAxis).annotationsEnabled(true);

		var sparklineXScale = new Plottable.Scales.Time();
		var sparklineXAxis = new Plottable.Axes.Time(sparklineXScale, "bottom");
		var sparklineYScale = new Plottable.Scales.Linear();
		var sparkplots = new Plottable.Components.Group();

		var plots = new Plottable.Components.Group();
		var dataset = new Plottable.Dataset(this.data);
		function plot(xAttr, yAttr, color) {
			plots.append(new Plottable.Plots.Line()
				.addDataset(dataset)
				.x(d=> d[xAttr], xScale)
				.y(d=> d[yAttr], yScale)
				.attr("stroke", color)
				.attr("stroke-width", 1)
				.autorangeMode("y"));
			sparkplots.append(new Plottable.Plots.Line()
				.addDataset(dataset)
				.x(d=> d[xAttr], sparklineXScale)
				.y(d=> d[yAttr], sparklineYScale)
				.attr("stroke", color)
				.attr("stroke-width", 1));
		}
		for(let y of this.yAxes)
			plot(this.xAxis, y, this.colors[y]);
			
		var dragBox = new Plottable.Components.XDragBoxLayer();
		dragBox.resizable(true);
		dragBox.onDrag(function(bounds) {
			var min = sparklineXScale.invert(bounds.topLeft.x);
			var max = sparklineXScale.invert(bounds.bottomRight.x);
			xScale.domain([min, max]);
		});
		dragBox.onDragEnd(function(bounds) {
			if (bounds.topLeft.x === bounds.bottomRight.x) {
				xScale.domain(sparklineXScale.domain());
			}
		});
		xScale.onUpdate(function() {
			dragBox.boxVisible(true);
			var xDomain = xScale.domain();
			dragBox.bounds({
				topLeft: {x: sparklineXScale.scale(xDomain[0]), y: null},
				bottomRight: {x: sparklineXScale.scale(xDomain[1]), y: null}
			});
		});
		sparkplots.append(dragBox);

		new Plottable.Interactions.PanZoom(xScale, null).attachTo(plots);

		this.chart = new Plottable.Components.Table([
			[yAxis, plots],
			//[yAxis, (<any>plots)._components[0]],
			[null, xAxis],
			[null, sparkplots],
			[null, sparklineXAxis]
		]);
		this.chart.rowWeight(2, 0.2);
		this.chart.renderTo(<HTMLElement>this.$refs.chart);
	}
}
</script>