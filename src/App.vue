<template>
    <div class="p-4 flex flex-col">
			<input type=file @change="processFile($event)" accept=".csv" />
			<form>
				<table class="columns">
					<thead>
						<tr>
							<th>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</th>
							<th>X</th>
							<th>Y</th>
							<!--th>R</th-->
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
							<!--td>
								<input type="radio" name="rightAxis" :value="title" v-model="axis.right" @change="redraw" />
							</td-->
						</tr>
					</tbody>
				</table>
				<div class="visuals">
					<div id="taucharts"></div>
					<svg id="plottable"></svg>
				</div>
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
.visuals {
	width: 75%;
	display: inline-block;
}
</style>
<script>
var d3 = require('d3'),
	tauCharts = require('taucharts'),
	Plottable = require('plottable');

export default {
		name: 'ChartTest',

		props: {
		},

		data () {
			return {
				charts: {},
				data: [],
				columns: [],
				axis: {
					x: null,
					left: null,
					right: null
				}
			}
		},

		computed: {
		},

		watch: {
		},

		mounted() {
		},

		methods: {
			redraw() {
				if(!this.axis.x) return;
				if(!this.axis.left) return;
				//just ignore exceptions for now
				try { this.redrawTaucharts(); } catch(x) {}
				try { this.redrawPlottable(); } catch(x) {}
			},
			redrawPlottable() {
				if(this.charts.plottable) this.charts.plottable.destroy();
				delete this.charts.plottable;

				var xDate = this.data[0][this.axis.x] instanceof Date;
				var xScale = xDate?
					new Plottable.Scales.Time() :
					new Plottable.Scales.Linear();
				var yScale = new Plottable.Scales.Linear();

				var xAxis = xDate?
					new Plottable.Axes.Time(xScale, "bottom") :
					new Plottable.Axes.Numeric(xScale, "bottom");
				var yAxis = new Plottable.Axes.Numeric(yScale, "left");
				if(xDate) {
					var tiers = [];
					var newConfigs = [];
					tiers.push({ formatter: new Plottable.Formatters.time("%Y"),
							interval: Plottable.TimeInterval.year,
							step: 1 });
					newConfigs.push(tiers);
					xAxis.axisConfigurations(newConfigs);
				}

				var plot = new Plottable.Plots.Line();
				plot.x(d=> d[this.axis.x], xScale);
				plot.y(d=> d[this.axis.left], yScale);

				var dataset = new Plottable.Dataset(this.data);
				plot.addDataset(dataset);

				this.charts.plottable = new Plottable.Components.Table([
					[yAxis, plot],
					[null, xAxis]
				]);

				this.charts.plottable.renderTo("#plottable");
			},
			redrawTaucharts() {
				if(this.charts.tau) this.charts.tau.destroy();
				delete this.charts.tau;

				this.charts.tau = new tauCharts.Chart({
					data: this.data.filter(x=> !isNaN(+x[this.axis.left])),
					type: 'line',
					x: this.axis.x,
					y: this.axis.left,
					guide: {
						showGridLines: 'xy',
						x: {
							label: this.axis.x,
							//tickFormat: '%B %Y'
							/*tickFormat: "month-year"/*,
							"tickPeriod": "month"*/
						},
						y: {
							label: this.axis.left
						}
					}
				});
				this.charts.tau.renderTo('#taucharts');
			},
			processFile($event) {
				var file = $event.target.files[0],
					me = this;
				if (file) {
					var reader = new FileReader();
					reader.readAsText(file, "UTF-8");
					reader.onload = function (evt) {
						var data = d3.csvParse(evt.target.result),
							parseTime = d3.timeParse('%m/%e/%Y');
						me.data = data//.slice(0, 200)
							.map(x=> {
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
}
</script>