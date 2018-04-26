import Plottable, {
	Plots, Dataset, IScaleCallback, IAccessor,
	Scale, IRangeProjector, Point, Utils, Scales, Plot,
} from 'plottable'

import { DeferredRenderer } from "./deferredRenderer";

export class NotePlot<X> extends Plot {
  protected static _X_KEY = "x";

  private _autoAdjustXScaleDomain = false;
  private _adjustXDomainOnChangeFromYCallback: IScaleCallback<Scale<any, any>>;

  private _deferredRendering = false;
  private _deferredRenderer: DeferredRenderer<X>;

  /**
   * An NotePlot is a Plot that displays data along two primary directions, X and Y.
   *
   * @constructor
   * @param {Scale} xScale The x scale to use.
   */
  constructor() {
    super();
    this.addClass("note-plot");

    this._renderCallback = () => {
      if (this.deferredRendering()) {
        const scaleX = this.x() && this.x().scale;
        this._deferredRenderer.updateDomains(scaleX);
      } else {
        this.render();
      }
    };

    this._deferredRenderer = new DeferredRenderer<X>(() => this.render(), this._applyDeferredRenderingTransform);
  }

  public render() {
    if (this.deferredRendering()) {
      this._deferredRenderer.resetTransforms();
    }
    return super.render();
  }

  /**
   * Returns the whether or not the rendering is deferred for performance boost.
   *
   * @return {boolean} The deferred rendering option
   */
  public deferredRendering(): boolean;
  /**
   * Sets / unsets the deferred rendering option Activating this option improves
   * the performance of plot interaction (pan / zoom) by performing lazy
   * renders, only after the interaction has stopped. Because re-rendering is no
   * longer performed during the interaction, the zooming might experience a
   * small resolution degradation, before the lazy re-render is performed.
   *
   * This option is intended for cases where performance is an issue.
   */
  public deferredRendering(deferredRendering: boolean): this;
  public deferredRendering(deferredRendering?: boolean): any {
    if (deferredRendering == null) {
      return this._deferredRendering;
    }

    if (deferredRendering) {
      const scaleX = this.x() && this.x().scale;
      this._deferredRenderer.setDomains(scaleX);
    }

    this._deferredRendering = deferredRendering;
    return this;
  }

  /**
   * Gets the TransformableAccessorScaleBinding for X.
   */
  public x()/*: ITransformableAccessorScaleBinding<X, number>*/;
  /**
   * Sets X to a constant number or the result of an Accessor<number>.
   *
   * @param {number|Accessor<number>} x
   * @returns {NotePlot} The calling NotePlot.
   */
  public x(x: number | IAccessor<number>): this;
  /**
   * Sets X to a scaled constant value or scaled result of an Accessor.
   * The provided Scale will account for the values when autoDomain()-ing.
   *
   * @param {X|Accessor<X>} x
   * @param {Scale<X, number>} xScale
   * @returns {NotePlot} The calling NotePlot.
   */
  public x(x: X | IAccessor<X>, xScale: Scale<X, number>, postScale?: IRangeProjector<number>): this;
  public x(x?: number | IAccessor<number> | X | IAccessor<X>, xScale?: Scale<X, number>, postScale?: IRangeProjector<number>): any {
    if (x == null) {
      return this._propertyBindings.get(NotePlot._X_KEY);
    }

    this._bindProperty(NotePlot._X_KEY, x, xScale, postScale);

    const width = this.width();
    if (xScale != null && width != null) {
      xScale.range([0, width]);
    }

    this.render();
    return this;
  }

  /*protected _filterForProperty(property: string): IAccessor<boolean> {
    if (property === "x" && this._autoAdjustXScaleDomain) {
      return this._makeFilterByProperty("y");
    } else if (property === "y" && this._autoAdjustYScaleDomain) {
      return this._makeFilterByProperty("x");
    }
    return null;
  }*/

  private _makeFilterByProperty(property: string) {
    const binding = this._propertyBindings.get(property);
    if (binding != null) {
      const accessor = binding.accessor;
      const scale = binding.scale;
      if (scale != null) {
        return (datum: any, index: number, dataset: Dataset) => {
          const range = scale.range();
          return Utils.Math.inRange(scale.scale(accessor(datum, index, dataset)), range[0], range[1]);
        };
      }
    }
    return null;
  }

  private _applyDeferredRenderingTransform = (tx: number, sx: number) => {
    if (!this._isAnchored) {
      return;
    }
    if (this._renderArea != null) {
      this._renderArea.attr("transform", `translate(${tx}, 0) scale(${sx}, 1)`);
    }
    if (this._canvas != null) {
      this._canvas.style("transform", `translate(${tx}px, 0px) scale(${sx}, 1)`);
    }
  }

  public destroy() {
		super.destroy();
    return this;
  }

  /**
   * Gets the automatic domain adjustment mode for visible points.
   */
  public autorangeMode(): string;
  /**
   * Sets the automatic domain adjustment mode for visible points to operate against the X Scale, Y Scale, or neither.
   * If "x" or "y" is specified the adjustment is immediately performed.
   *
   * @param {string} autorangeMode One of "x"/"y"/"none".
   *   "x" will adjust the x Scale in relation to changes in the y domain.
   *   "y" will adjust the y Scale in relation to changes in the x domain.
   *   "none" means neither Scale will change automatically.
   * @returns {NotePlot} The calling NotePlot.
   */
  public autorangeMode(autorangeMode: string): this;
  public autorangeMode(autorangeMode?: string): any {
    if (autorangeMode == null) {
      if (this._autoAdjustXScaleDomain) {
        return "x";
      }
      return "none";
    }
    switch (autorangeMode) {
      case "x":
        this._autoAdjustXScaleDomain = true;
        break;
      case "y":
        this._autoAdjustXScaleDomain = false;
        break;
      case "none":
        this._autoAdjustXScaleDomain = false;
        break;
      default:
        throw new Error("Invalid scale name '" + autorangeMode + "', must be 'x', 'y' or 'none'");
    }
    return this;
  }

  public computeLayout(origin?: Point, availableWidth?: number, availableHeight?: number) {
    super.computeLayout(origin, availableWidth, availableHeight);
    const xBinding = this.x();
    const xScale = xBinding && xBinding.scale;
    if (xScale != null) {
      xScale.range([0, this.width()]);
    }
    return this;
  }

  private _updateXExtentsAndAutodomain() {
    const xScale = this.x().scale;
    if (xScale != null) {
      xScale.autoDomain();
    }
  }

  /**
   * Adjusts the domains of both X and Y scales to show all data.
   * This call does not override the autorange() behavior.
   *
   * @returns {NotePlot} The calling NotePlot.
   */
  public showAllData() {
    this._updateXExtentsAndAutodomain();
    return this;
  }

  protected _projectorsReady() {
    const xBinding = this.x();
    return xBinding != null &&
      xBinding.accessor != null;
  }

  protected _pixelPoint(datum: any, index: number, dataset: Dataset): Point {
    const xProjector = Plot._scaledAccessor(this.x());
    const yProjector = Plot._scaledAccessor(this.y());
    return { x: xProjector(datum, index, dataset), y: yProjector(datum, index, dataset) };
  }

  protected _getDataToDraw(): Utils.Map<Dataset, any[]> {
    const dataToDraw: Utils.Map<Dataset, any[]> = super._getDataToDraw();

    const definedFunction = (d: any, i: number, dataset: Dataset) => {
      const positionX = Plot._scaledAccessor(this.x())(d, i, dataset);
      const positionY = Plot._scaledAccessor(this.y())(d, i, dataset);
      return Utils.Math.isValidNumber(positionX) &&
        Utils.Math.isValidNumber(positionY);
    };

    this.datasets().forEach((dataset) => {
      dataToDraw.set(dataset, dataToDraw.get(dataset).filter((d, i) => definedFunction(d, i, dataset)));
    });
    return dataToDraw;
  }
}