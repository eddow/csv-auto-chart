<template>
    <div class="p-4 flex flex-col">
			<input type=file @change="processFile($event)" />
			<form>
				<table class="columns">
					<thead>
						<tr>
							<th>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</th>
							<th>X</th>
							<th>L</th>
							<th>R</th>
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
							<td>
								<input type="radio" name="rightAxis" :value="title" v-model="axis.right" @change="redraw" />
							</td>
						</tr>
					</tbody>
				</table>
				<div id="vis"></div>
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
#vis {
	width: 75%;
	display: inline-block;
}
</style>
<script>
var d3 = require('d3'),
	tauCharts = require('taucharts');

export default {
		name: 'ChartTest',

		props: {
		},

		data () {
			return {
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
				if(this.chart) this.chart.destroy();

				this.chart = new tauCharts.Chart({
					data: this.data.filter(x=> !isNaN(+x[this.axis.left])),
					type: 'line',
					x: this.axis.x,
					y: this.axis.left,
					guide: {
						showGridLines: 'xy',
						x: {
							label: this.axis.x,
							tickFormat: '%B %Y'
							/*tickFormat: "month-year"/*,
							"tickPeriod": "month"*/
						},
						y: {
							label: this.axis.left
						}
					}
				});
				this.chart.renderTo('#vis');
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
						me.data = data.slice(0, 200).map(x=> {

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
					}
					reader.onerror = function (evt) {
						alert('Error reading file');
					}
				}
			}
		}
}
</script>