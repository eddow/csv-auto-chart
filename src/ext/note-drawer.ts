import Plottable, {Drawers} from 'plottable'

export class SymbolSVGDrawer extends Drawers.SVGDrawer {
	constructor() {
			super("path", "note");
	}
}