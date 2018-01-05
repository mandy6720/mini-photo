import _ from 'lodash';
import QuickSettings from 'quicksettings';

import qsUtil from './util';
import Palette from './palette';

export default {
  panel: null,
  swatchPickers : {},
  selectedSwatchGroup: null,
  documentData: null,

  handleChange : function() {console.log("changed document")},

  createLayer(panel, documentData) {
    this.panel = panel;
    this.documentData = documentData;
    this.selectedSwatchGroup = Palette.getSwatchGroupNames()[0];
    console.log('this.selectedSwatchGroup', Palette.getSwatchGroupNames())

    panel.addNumber('Width', 0, documentData !== null ? documentData.workspaceSize.x : 5000);
    panel.addNumber('Height', 0, documentData !== null ? documentData.workspaceSize.x : 2000);
    this.formatWidthHeightInputs();

    // panel.addDropDown(
    //   'Background Color',
    //   ['Light blue', 'Pink', 'Grey', 'Green'],
    //   this.onSelectColor.bind(this)
    // );

    var swatchGroupNames = Palette.getSwatchGroupNames();
    qsUtil.addCustomTitle(panel, "Choose Color Group", "Color Group_Title")
    panel.addDropDown("Color Group", swatchGroupNames, this.onSelectSwatchGroup.bind(this));
    panel.hideTitle("Color Group");

    _.each(swatchGroupNames, function(swatchGroupName) {
      var swatchPicker = qsUtil.createSwatchPicker(
      Palette.getSwatchesFor(swatchGroupName),
      this.onSelectSwatch.bind(this)
    );
    this.swatchPickers[swatchGroupName] = swatchPicker;
      panel.addElement(swatchGroupName, swatchPicker);

      panel.hideTitle(swatchGroupName);
      panel.hideControl(swatchGroupName);
    }.bind(this));

    panel.showControl(swatchGroupNames[0]);
    qsUtil.addSwatchHighlightByIndex(this.swatchPickers[swatchGroupNames[0]],0);
    this.selectedSwatchElem = this.swatchPickers[swatchGroupNames[0]].children[0];
  },
  formatWidthHeightInputs() {
    var inputsArr = document.getElementsByClassName('qs_container');
    var widthElem = inputsArr[2];
    var heightElem = inputsArr[3];
    widthElem.id = 'width';
    widthElem.classList += " half-width";
    heightElem.id = 'height';
    heightElem.classList += " half-width";
  },
  onSelectColor(info) {
    console.log('Selected color', info.value);
  },
  onSelectSwatchGroup(info) {
		// there's currently no way to edit dropdown contents at runtime
		// (without digging into private properties of the panel),
    // so we're just hiding & showing specific controls
    console.log(info, this.selectedSwatchGroup)
    var selection = info.value;
		this.panel.hideControl(this.selectedSwatchGroup);
		this.panel.showControl(selection);

		this.selectedSwatchGroup = selection;
		if (this.selectedSwatchElem) {
			qsUtil.removeSwatchHighlight(this.selectedSwatchElem);
		}
		qsUtil.addSwatchHighlightByIndex(this.swatchPickers[selection], 0);
		this.selectedSwatchElem = this.swatchPickers[selection].children[0];

		this.handleChange();
	},
	onSelectSwatch(swatch, elem) {
		if (this.selectedSwatchElem) {
			qsUtil.removeSwatchHighlight(this.selectedSwatchElem);
		}
		qsUtil.addSwatchHighlight(elem);
    this.selectedSwatchElem = elem;
    this.documentData.backgroundColor = swatch.color;
    this.handleChange();
    console.log(this.documentData, swatch)
  },
}
