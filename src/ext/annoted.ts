import {Axes, Utils, SimpleSelection} from 'plottable'
import * as d3 from "d3"
import * as Typesettable from "typesettable"

export default class AnnotedAxis extends Axes.Time {
	private _annotationShearAngle = 45
	/**
	 * Gets the tick label shear angle in degrees.
	 */
	public annotationShearAngle(): number;
	/**
	 * Sets the annotation shear angle in degrees.
	 * Only angles between -80 and 80 are supported.
	 *
	 * @param {number} angle
	 * @returns {Category} The calling Category Axis.
	 */
	public annotationShearAngle(angle: number): this;
	public annotationShearAngle(angle?: number): any {
		if (angle == null) {
			return this._annotationShearAngle;
		}
		if (angle < -80 || angle > 80) {
			throw new Error("Angle " + angle + " not supported; Must be between [-80, 80]");
		}
		this._annotationShearAngle = angle;
		this.redraw();
		return this;
	}
	protected _setup() {
		super._setup();
		(<any>this)._annotationContainer.append("g").classed("annotation-oblique-container", true);
	}
	protected _drawAnnotations() {

		const dx = Math.cos(Math.PI/180*this._annotationShearAngle);
		const dy = Math.sin(Math.PI/180*this._annotationShearAngle);

		const labelPadding = (<any>AnnotedAxis)._ANNOTATION_LABEL_PADDING;
		const measurements = new Utils.Map<Date, Typesettable.IDimensions>();
		const annotatedTicks = (<any>this)._annotatedTicksToRender();
		annotatedTicks.forEach((annotatedTick) => {
			const measurement = (<any>this)._annotationMeasurer.measure(this.annotationFormatter()(annotatedTick));
			const paddedMeasurement = {
				width: measurement.width + 2 * labelPadding,
				height: measurement.height + 2 * labelPadding,
			};
			measurements.set(annotatedTick, paddedMeasurement);
		});

		const tierHeight = (<any>this)._annotationMeasurer.measure().height + 2 * labelPadding;

		const hiddenAnnotations = new Utils.Set<any>();
		const axisHeight = this.isHorizontal() ? this.height() : this.width();
		const axisHeightWithoutMarginAndAnnotations = this._coreSize();
		const numTiers = Math.min(this.annotationTierCount(), Math.floor((axisHeight - axisHeightWithoutMarginAndAnnotations) / tierHeight));

		const bindElements = (selection: SimpleSelection<any>, elementName: string, className: string) => {
			const elementsUpdate = selection.selectAll(`.${className}`).data(annotatedTicks);
			const elements =
				elementsUpdate
					.enter()
					.append(elementName)
						.classed(className, true)
					.merge(elementsUpdate);
			elementsUpdate.exit().remove();
			return <any>elements;	//attrs is added by d3-selection-multi, but not in the types so this file raises ts-lint errors
		};
		const offsetF = (d: Date) => {
			switch (this.orientation()) {
				case "bottom":
					return axisHeightWithoutMarginAndAnnotations;
				case "top":
					return axisHeight - axisHeightWithoutMarginAndAnnotations;
			}
		};
		const positionF = (d: Date) => this._scale.scale(d);
		function positionB(mult) {
			return (d: Date) => positionF(d) - mult*measurements.get(d).width;
		}
		const visibilityF = (d: Date) => hiddenAnnotations.has(d) ? "hidden" : "visible";

		let secondaryPosition: number;
		switch (this.orientation()) {
			case "bottom":
				secondaryPosition = 0;
				break;
			case "top":
				secondaryPosition = this.height();
				break;
		}
		const lineOffset = (d)=> offsetF(d) + measurements.get(d).height/2;
		const isHorizontal = this.isHorizontal();
		bindElements((<any>this)._annotationContainer.select(".annotation-line-container"), "line", (<any>AnnotedAxis).ANNOTATION_LINE_CLASS)
			.attrs({
				"x1": isHorizontal ? positionF : secondaryPosition,
				"x2": isHorizontal ? positionF : offsetF,
				"y1": isHorizontal ? secondaryPosition : positionF,
				"y2": isHorizontal ? lineOffset : positionF,
				visibility: visibilityF,
			});

		bindElements((<any>this)._annotationContainer.select(".annotation-oblique-container"), "line", (<any>AnnotedAxis).ANNOTATION_LINE_CLASS)
			.attrs({
				"x1": isHorizontal ? positionF : offsetF,
				"x2": isHorizontal ? positionB(dx) : offsetF,
				"y1": isHorizontal ? lineOffset : positionF,
				"y2": isHorizontal ? (d)=> lineOffset(d) + dy*measurements.get(d).width : positionF,
				visibility: visibilityF,
			});
			
		bindElements((<any>this)._annotationContainer.select(".annotation-circle-container"), "circle", (<any>AnnotedAxis).ANNOTATION_CIRCLE_CLASS)
			.attrs({
				cx: isHorizontal ? positionF : secondaryPosition,
				cy: isHorizontal ? secondaryPosition : positionF,
				r: 3,
			});

		const rectangleOffsetF = (d: Date) => {
			switch (this.orientation()) {
				case "bottom":
					return offsetF(d);
				case "top":
					return offsetF(d) - measurements.get(d).height;
			}
		};

		const annotationWriter = (<any>this)._annotationWriter;
		const annotationFormatter = this.annotationFormatter();
		const annotationLabels = bindElements((<any>this)._annotationContainer.select(".annotation-label-container"), "g", (<any>AnnotedAxis).ANNOTATION_LABEL_CLASS);
		annotationLabels.selectAll(".text-container").remove();
		annotationLabels.attrs({
			transform: (d) => {
				const xTranslate = isHorizontal ?
					positionB(dx)(d) - dy*measurements.get(d).height/2 :
					rectangleOffsetF(d);
				const yTranslate = isHorizontal ?
					rectangleOffsetF(d) + dy*measurements.get(d).width + (1-dx)*measurements.get(d).height/2 :
					positionF(d);
				return `translate(${xTranslate},${yTranslate}) rotate(-${this._annotationShearAngle})`;
			},
			visibility: visibilityF,
		})
			.each(function (annotationLabel) {
				annotationWriter.write(annotationFormatter(annotationLabel),
					isHorizontal ? measurements.get(annotationLabel).width : measurements.get(annotationLabel).height,
					isHorizontal ? measurements.get(annotationLabel).height : measurements.get(annotationLabel).width,
					{
						xAlign: "center",
						yAlign: "center",
						textRotation: isHorizontal ? 0 : 90,
					},
					d3.select(this).node());
			});
	}
}