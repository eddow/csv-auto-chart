import Plottable, {Plots} from 'plottable'

class NotePlot<X> extends Plots.Scatter<X, number> {
	protected _createDrawer(dataset: Plottable.Dataset) {
    return new Plottable.ProxyDrawer(
      () => new Plottable.Drawers.SymbolSVGDrawer(),
      (ctx) => null,	//canvas drawer factory
    );
  }
}