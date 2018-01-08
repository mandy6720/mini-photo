import _ from 'lodash';
import QuickSettings from 'quicksettings';

import qsUtil from './util';
import Background from './BackgroundLayer';
import Foreground from './ForegroundLayer';
import Graphic from './GraphicLayer';

export default {
  panel : null,
  documentData : null,
  selectedLayer: 'background',
  rootElem: null,
  
  handleChange : function() {console.log("changed document")},
  updateCanvas: function() {console.log("changed layer")},
  handleChooseBackgroundImage : function(fileObject){console.log("selected background image", fileObject)},

	init(rootElem, documentData) {
    var panel = QuickSettings.create(5, 5, 'Layer', rootElem);
    this.panel = panel;
    this.rootElem = rootElem;
    this.documentData = documentData;
    this.addCommonInputs(panel);
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
  setLayerImg(layer) {
    console.log('Set layer to', layer);
    var layerElems = document.getElementsByClassName('layer');
    _.forEach(layerElems, (item => {
      item.classList = 'layer';
    }))
    document.getElementById(layer).classList += ' selected';
  },
  onSelectLayer(info) {
    switch (info.value) {
      case 'Background':
        this.handleSelectLayer('background');
        break;
      case 'Background Graphic':
        this.handleSelectLayer('bg-graphic');
        break;
      case 'Foreground':
        this.handleSelectLayer('foreground');
        break;
      case 'Foreground Graphic':
        this.handleSelectLayer('fg-graphic');
        break;
      default:
        break;
    }    
  },
  handleSelectLayer(newLayer){
    this.selectedLayer = newLayer;
    this.updatePanel(newLayer);
    this.setLayerImg(newLayer);
    this.updateCanvas(newLayer);
  },
  addCommonInputs(panel, newPanelType) {
    var layersImgContainer = document.createElement("div");
		layersImgContainer.id = "layers-img";
    panel.addElement('', layersImgContainer);
    this.addLayers();

    panel.addDropDown(
      'Layer Select',
      ['Background', 'Background Graphic', 'Foreground', 'Foreground Graphic'],
      this.onSelectLayer.bind(this)
    );

    document.getElementsByClassName('qs_container')[0].id = 'layers-img-container';
    document.getElementsByClassName('qs_container')[1].id = 'layers-select-dropdown';
    console.log(this.documentData)
    this.addLayerSpecificInputs(panel);
  },
  addLayerSpecificInputs(panel) {
    switch (this.selectedLayer) {
      case 'background':
        Background.createLayer(panel, this.documentData);
        break;
      case 'bg-graphic':
      case 'fg-graphic': 
        Graphic.createLayer(panel);
        break;
      case 'foreground':
        Foreground.createLayer(panel, this.documentData);
        break;
      default:
        break;
    }
  },
  updatePanel(newPanelType) {
    var panelInputs = document.getElementsByClassName('qs_container');

    for (var i = panelInputs.length - 1; i > 0; i--) {
      if (panelInputs[i].id !== 'layers-img-container' && panelInputs[i].id !== 'layers-select-dropdown') {
        panelInputs[i].remove();
      }
    }
    this.addLayerSpecificInputs(this.panel);
  },
}
