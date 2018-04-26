<template>
	<div id="logbook"></div>
</template>
<style>
#logbook {
	width: 1000px;
	height: 200px;
}
</style>
<script lang="ts">
import {Component} from 'vue-property-decorator'
import Vue from 'vue'
import * as Plottable from 'plottable'
import * as testData from './logbook.json'
import * as remarks from './remarks.json'
import CaLines from '../ext/ca-lines'
const stateNames = ['On duty', 'Driving', 'Sleeper', 'Off duty'];
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
		
		var yScale = new Plottable.Scales.Linear().domain([0.5, 4.5]);
		
		var xScale = new Plottable.Scales.Time().domain([dayTime('00:00'), dayTime('24:00')]);
		xScale.tickGenerator(()=> xScale.tickInterval('hour'));
		var topAxis = new Plottable.Axes.Time(xScale, "top");
		var btmAxis = new Plottable.Axes.Time(xScale, "bottom");

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
		//TODO: colliding annotations are hidden
		btmAxis.annotationsEnabled(true)
			.annotatedTicks(Object.keys(annotated).map(x=> new Date(+x)))
			.annotationFormatter((n=> {
				let note = annotated[+n];
				return note.city + '\n' + remarks[note.remark];
			}));

		var gridlines = new CaLines(xScale, stateScale);
		gridlines.betweenY(true);
		var group = new Plottable.Components.Group([linePlot, gridlines]);
		this.chart = new Plottable.Components.Table([
			[null, topAxis],
			[stateAxis, group],
			[null, btmAxis]
		]);
		this.chart.renderTo("#logbook");
	}
}
</script>