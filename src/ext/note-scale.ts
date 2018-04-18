import {Scale} from 'plottable'

export default class noteAxis extends Scale<any, number> {
	//Ugly but gridlines was not written to be extended
  private _mirrorScale: Scale<any, any>;
  private _position: (d: any)=> any;
  private _info: (d: any)=> any;
	private _data: any[];

  constructor(mirrorScale: Scale<any, any>, position: (d: any)=> any, info: (d: any)=> any) {
		super();
    this._mirrorScale = mirrorScale;
    this._position = position;
    this._info = info;
	}
	
  public domain(): any[];
  public domain(values: any[]): this;
  public domain(values?: any[]): any {
    return super.domain(values);
	}
	
  protected _backingScaleDomain(values?: any[]): any {
    if (values == null) {
      return this._data;
    } else {
      this._data = values;
      return this;
    }
  }
  public invertRange(range/*: [number, number] = this.range()*/): any[] {
		//TODO: Consider range?
		debugger;
		return this._data.filter(d=> !!this._info(d));
  }
	
	public scale(value: any): number {
		return this._mirrorScale.scale(this._position(value));
  }
}