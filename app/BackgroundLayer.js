import _ from 'lodash';
import QuickSettings from 'quicksettings';

export default {
  createLayer(panel, documentData) {
    panel.addNumber('Width', 0, documentData !== null ? documentData.workspaceSize.x : 5000);
    panel.addNumber('Height', 0, documentData !== null ? documentData.workspaceSize.x : 2000);
    this.formatWidthHeightInputs();

    panel.addDropDown(
      'Background Color',
      ['Light blue', 'Pink', 'Grey', 'Green'],
      this.onSelectColor.bind(this)
    );
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
  }
}
