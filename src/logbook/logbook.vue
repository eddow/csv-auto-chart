<template>
	<div ref="logbook"></div>
</template>
<script lang="ts">
import {Component, Prop} from 'vue-property-decorator'
import Vue from 'vue'
import * as Plottable from 'plottable'
import CaLines from '../ext/ca-lines'
import AnnotedAxis from '../ext/annoted'
const stateNames = ['On duty', 'Driving', 'Sleeper', 'Off duty'];
function dayTime(hhmm) {
	var hm = hhmm.split(':');
	return new Date(0, 0, 0, +hm[0], +hm[1]);
}

function pixelise(size: number|string) {
	return 'number'=== typeof size ? size + 'px' : size;
}

@Component
export default class LogBook extends Vue {
	chart: Plottable.Components.Table
	mounted() {
		this.redraw();
	}

	@Prop({required: true}) remarks: string[]
	@Prop({required: true}) data: any

	redraw() {
		if(this.chart) this.chart.destroy();
		delete this.chart;
		
		var yScale = new Plottable.Scales.Linear().domain([0.5, 4.5]);
		
		var xScale = new Plottable.Scales.Time().domain([dayTime('00:00'), dayTime('24:00')]);
		xScale.tickGenerator(()=> xScale.tickInterval('hour'));
		var topAxis = new Plottable.Axes.Time(xScale, "top");
		var btmAxis = new AnnotedAxis(xScale, "bottom");

		var stateScale = new Plottable.Scales.Category().domain(stateNames);
		var stateAxis = new Plottable.Axes.Category(stateScale, "left");
		stateScale.innerPadding(0).outerPadding(0);

		var hourTier = {
			formatter: Plottable.Formatters.time("%H"),
			interval: Plottable.TimeInterval.hour,
			step: 1
		};
		topAxis.axisConfigurations([[hourTier]]);
		btmAxis.axisConfigurations([[hourTier]]);

		var dataset = new Plottable.Dataset([].concat(this.data.states).concat([{
			"type": this.data.states[this.data.states.length-1].type,
			"time": "24:00"
		}]));

		var linePlot = new Plottable.Plots.Line();
		linePlot
			.curve("stepAfter")
			.x(d=> dayTime(d.time), xScale)
			.y(d=> d.type, yScale)
			.addDataset(dataset);

		var annotated = {}
		for(let d of this.data.states)
			if(d.note) {
				annotated[+dayTime(d.time)] = d.note;
			}
			
		btmAxis.annotationsEnabled(true)
			.annotatedTicks(Object.keys(annotated).map(x=> new Date(+x)))
			.annotationFormatter((n=> {
				let note = annotated[+n];
				return note.city + '\n' + this.remarks[note.remark];
			}));

		var gridlines = new CaLines(xScale, stateScale);
		gridlines.betweenY(true);
		var group = new Plottable.Components.Group([linePlot, gridlines]);
		this.chart = new Plottable.Components.Table([
			[null, topAxis],
			[stateAxis, group],
			[null, btmAxis]
		]);
		this.chart.renderTo(<HTMLElement>this.$refs.logbook);
	}
}
</script>