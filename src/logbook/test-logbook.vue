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
import NoteScale from '../ext/note-scale'
import NoteAxis from '../ext/note-axis'
const stateNames = ['Off duty', 'Sleeper', 'Driving', 'On duty'];
function dayTime(hhmm) {
	var hm = hhmm.split(':');
	return new Date(0, 0, 0, +hm[0], +hm[1]);
}
function n2(n) {
	return (n<10?'0':'')+n;
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
		var xAxis = new Plottable.Axes.Time(xScale, "top");

		var stateScale = new Plottable.Scales.Category().domain(stateNames.reverse());
		var stateAxis = new Plottable.Axes.Category(stateScale, "left");
		stateScale.innerPadding(0).outerPadding(0);

		var noScale = new Plottable.Scales.Linear();
		/*var noteScale = new NoteScale(xScale, x=> dayTime(x.time));
		//TODO: noteAxis*/

		var tiers = [];
		var newConfigs = [];
		tiers.push({
			formatter: Plottable.Formatters.time("%H"),
			interval: Plottable.TimeInterval.hour,
			step: 1
		});
		newConfigs.push(tiers);
		xAxis.axisConfigurations(newConfigs);

		var dataset = new Plottable.Dataset([].concat(this.data.states).concat([{
			"type": 2,
			"time": "24:00"
		}]));

		var linePlot = new Plottable.Plots.Line();
		linePlot
			.curve("stepAfter")
			.x(d=> dayTime(d.time), xScale)
			.y(d=> 5-d.type, yScale)
			.addDataset(dataset);

		var legendPlot = new Plottable.Plots.Scatter();
		legendPlot.x(d=> dayTime(d.time), xScale);
		legendPlot.y(d=> 0, noScale);
		legendPlot.addDataset(new Plottable.Dataset(this.data.states.filter(x=> !!x.note)));
		
		var annotated = {};
		for(let d of this.data.states)
			if(d.note) {
				var tParts = d.time.split(':'),
				t = Math.round(+tParts[0]*4 + +tParts[1]/15);
				annotated[t] = d.note;
			}
		var noteScale = new Plottable.Scales.Linear().domain([0, 24*4]);
		var noteAxis = new Plottable.Axes.Numeric(noteScale, "bottom");
		noteAxis.annotationsEnabled(true)
			.formatter(()=> '')
			.innerTickLength(0)
			.endTickLength(0)
			.annotatedTicks(Object.keys(annotated).map(x=> +x))
			.annotationFormatter((n=> {
				return annotated[n].city + '\n' + remarks[annotated[n].remark];
			}));

		var gridlines = new CaLines(xScale, stateScale);
		gridlines.betweenY(true);
		var group = new Plottable.Components.Group([linePlot, gridlines]);
		this.chart = new Plottable.Components.Table([
			[null, xAxis],
			[stateAxis, group],
			[null, noteAxis]/*,
			[null, legendPlot]*/
		]);
		this.chart.renderTo("#logbook");
	}
}
</script>