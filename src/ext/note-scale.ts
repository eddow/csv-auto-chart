import {Scale} from 'plottable'

export default class noteScale extends Scale<any, number> {
	//Ugly but gridlines was not written to be extended
  private _mirrorScale: Scale<any, any>;
  private _extract: (d: any)=> any;
	
  constructor(mirrorScale: Scale<any, any>, extract: (d: any)=> any) {
		super();
    this._mirrorScale = mirrorScale;
    this._extract = extract;
	}
	public scale(value: any): number {
		return this._mirrorScale.scale(this._extract(value));
  }
}