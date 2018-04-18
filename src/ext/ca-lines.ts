import {Components, Scale} from 'plottable'

export default class CaLines extends Components.Gridlines {
	//Ugly but gridlines was not written to be extended
  private __xScale: Scale<any, any> | null;
  private __yScale: Scale<any, any> | null;
	
  constructor(xScale: Scale<any, any> | null, yScale: Scale<any, any> | null) {
		super(xScale, yScale);
    this.__xScale = xScale;
    this.__yScale = yScale;
	}
  public renderImmediately() {
		super.renderImmediately();
		if (this.__xScale && this.__yScale) {
			
		}
    return this;
  }
}