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

    panel.addDropDown(
      'Layer Select',
      ['Background', 'Background Graphic', 'Foreground', 'Foreground Graphic'],
      this.onSelectLayer.bind(this)
    ); 
    
    this.addLayers();
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
  onSelectLayer(info) {
    console.log('Layer selected!', info.value);
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
  setLayerImg(layer) {
    console.log('Set layer to', layer);
    var layerElems = document.getElementsByClassName('layer');
    console.log(layerElems)
    _.forEach(layerElems, (item => {
      item.classList = 'layer';
    }))
    document.getElementById(layer).classList += ' selected';
  }
}
