import {Components, Scale, SimpleSelection} from 'plottable'

function gridPositionFactory(
		scale: Scale<any, any>,
		between: boolean|number,
		coord: string,
		orderedTicks?: any[],
		adder?: number) {
	const previousTick: { [index: string]: string } = {};
	const nextTick: { [index: string]: string } = {};
	if (orderedTicks !== undefined) {
		for(let i = 0; i < orderedTicks.length; i ++) {
			const previous = orderedTicks[i - 1];
			const next = orderedTicks[i + 1];
			const current = orderedTicks[i];
			previousTick[current] = previous;
			nextTick[current] = next;
		}
	}
	
	return (tickVal: any) => {
		tickVal = tickVal[coord];
		const position = scale.scale(tickVal);

		let gridPosition: number = 0;
		let previousPosition = previousTick[tickVal] === undefined
			? undefined
			: scale.scale(previousTick[tickVal]);
		let nextPosition = nextTick[tickVal] === undefined
			? undefined
			: scale.scale(nextTick[tickVal]);
			if(previousPosition === undefined)
				previousPosition = position-(nextPosition-position);
			if(nextPosition === undefined)
				nextPosition = position-(previousPosition-position);

		if (!between) {
			gridPosition = position;
			if(adder !== undefined) {
				let range = scale.range();
				let mid = (range[0]+range[1])/2;
				gridPosition = 
					position > mid ?
					gridPosition * (1-adder) + previousPosition * adder:
					gridPosition * (1-adder) + nextPosition * adder;
			}
			return gridPosition;
		}
		
		if (previousPosition !== undefined) {
			if('boolean'=== typeof between)
				gridPosition = previousPosition + (position - previousPosition) / 2;
			else
				gridPosition = previousPosition*between + position * (1-between);
		}
		return gridPosition;
	};
}

function dot(a1: any[], a2: any[]): any[] {
	var rv = [];
	for(let i1 of a1) for(let i2 of a2)
		rv.push({x: i1, y: i2});
	return rv;
}
	
export default class CaLines extends Components.Gridlines {
	//Ugly but gridlines was not written to be extended
	private __xScale: Scale<any, any> | null;
	private __yScale: Scale<any, any> | null;
	private _caLinesContainer: SimpleSelection<void>;
	
	constructor(xScale: Scale<any, any> | null, yScale: Scale<any, any> | null) {
		super(xScale, yScale);
		this.__xScale = xScale;
		this.__yScale = yScale;
	}
	protected _setup() {
		super._setup();
		this._caLinesContainer = this.content().append("g").classed("ca-gridlines", true);
	}
	public renderImmediately() {
		super.renderImmediately();
		if (this.__xScale && this.__yScale) {
			const xTicks = this.__xScale.ticks().slice(1);
			const yTicks = this.__yScale.ticks();
			const caTicks = dot(xTicks, yTicks);
			const caLinesUpdate = this._caLinesContainer.selectAll("line").data(caTicks);
			const caLines = caLinesUpdate.enter();
			caLines.append("line").merge(caLinesUpdate)
				.attr("x1", gridPositionFactory(this.__xScale, .5, 'x', this.__xScale.ticks()))
				.attr("y1", gridPositionFactory(this.__yScale, false, 'y', this.__yScale.ticks(), 0))
				.attr("x2", gridPositionFactory(this.__xScale, .5, 'x', this.__xScale.ticks()))
				.attr("y2", gridPositionFactory(this.__yScale, false, 'y', this.__yScale.ticks(), .5))
				.classed("zeroline", (t: number) => t === 0);

			caLines.append("line").merge(caLinesUpdate)
				.attr("x1", gridPositionFactory(this.__xScale, .25, 'x', this.__xScale.ticks()))
				.attr("y1", gridPositionFactory(this.__yScale, false, 'y', this.__yScale.ticks(), .25))
				.attr("x2", gridPositionFactory(this.__xScale, .25, 'x', this.__xScale.ticks()))
				.attr("y2", gridPositionFactory(this.__yScale, false, 'y', this.__yScale.ticks(), .5))
				.classed("zeroline", (t: number) => t === 0);

			caLines.append("line").merge(caLinesUpdate)
				.attr("x1", gridPositionFactory(this.__xScale, .75, 'x', this.__xScale.ticks()))
				.attr("y1", gridPositionFactory(this.__yScale, false, 'y', this.__yScale.ticks(), .25))
				.attr("x2", gridPositionFactory(this.__xScale, .75, 'x', this.__xScale.ticks()))
				.attr("y2", gridPositionFactory(this.__yScale, false, 'y', this.__yScale.ticks(), .5))
				.classed("zeroline", (t: number) => t === 0);
			caLinesUpdate.exit().remove();
			
		}
		return this;
	}
}