import * as d3 from "d3";

import Plottable, {Axis, Axes, AxisOrientation, Scale, Scales} from "plottable";
import NoteScale from './note-scale'

export default class NoteAxis extends Axes.Category {
	
  constructor(scale: Scales.Category, orientation: AxisOrientation = "bottom") {
    super(scale, orientation);
  }
  public renderImmediately() {
		super.renderImmediately();
		return this;
	}
}
