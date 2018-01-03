import _ from 'lodash';
import QuickSettings from 'quicksettings';

import qsUtil from './util';

export default {
  panel : null,
	documentData : null,

	handleChange : function() {console.log("changed document")},
  handleChooseBackgroundImage : function(fileObject){console.log("selected background image", fileObject)},

	init(rootElem) {
    var panel = QuickSettings.create(5, 5, 'Layer', rootElem);

    var layersImgContainer = document.createElement("div");
		layersImgContainer.id = "layers-img";
    panel.addElement('', layersImgContainer);
    this.addLayers();

    panel.addDropDown(
      'Layer Select',
      ['Background', 'Background Graphic', 'Foreground', 'Foreground Graphic'],
      this.onSelectLayer.bind(this)
    ); 

    panel.addNumber('Width', 0, this.documentData !== null ? this.documentData.workspaceSize.x : 5000);
    panel.addNumber('Height', 0, this.documentData !== null ? this.documentData.workspaceSize.x : 2000);
    this.formatWidthHeightInputs();

    panel.addDropDown(
      'Background Color',
      ['Light blue', 'Pink', 'Grey', 'Green'],
      this.onSelectColor.bind(this)
    );
  },
  addLayers() {
    var parent = document.getElementById('layers-img');
    var layers = ['background', 'bg-graphic', 'foreground', 'fg-graphic'];
    layers.forEach((layer, index) => {
      var el = document.createElement("div");
      el.id = layer;
      el.classList = 'layer';
      if (index == 0) {
        el.className += ' selected';
      }
      parent.append(el)
    });
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
  setLayerImg(layer) {
    console.log('Set layer to', layer);
    var layerElems = document.getElementsByClassName('layer');
    console.log(layerElems)
    _.forEach(layerElems, (item => {
      item.classList = 'layer';
    }))
    document.getElementById(layer).classList += ' selected';
  },
  onSelectLayer(info) {
    console.log('Layer selected!', this.documentData);
    switch (info.value) {
      case 'Background':
        this.setLayerImg('background');
        break;
      case 'Background Graphic':
        this.setLayerImg('bg-graphic');
        break;
      case 'Foreground':
        this.setLayerImg('foreground');
        break;
      case 'Foreground Graphic':
        this.setLayerImg('fg-graphic');
        break;
      default:
        break;
    }    
  },
  onSelectColor(info) {
    console.log('Selected color', info.value);
  }
}
