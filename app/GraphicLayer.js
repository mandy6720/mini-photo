import _ from 'lodash';
import QuickSettings from 'quicksettings';

import qsUtil from './util.js';

export default {
  panel: null,
  selectedLayer: null,
  documentData: null,

  handleChange : function() {console.log("changed document - " + this.selectedLayer)},

  createLayer(panel, documentData, selectedLayer) {
    console.log(panel, documentData);
    this.panel = panel;
    this.documentData = documentData;
    this.selectedLayer = selectedLayer;
    
    panel.addRange('Scale', 0, 200, 100, 1, this.resizeImage.bind(this));
    panel.addRange('Rotation', 0, 360, 0, 15, this.resizeImage.bind(this));
    panel.addRange('Opacity', 0, 1, 1, .01, this.changeImageOpacity.bind(this));
  },
  resizeImage(e) {
    console.log(this.selectedLayer, '- resize to', e);
  },
  changeImageRotation(e) {
    console.log(this.selectedLayer, '- changeImageRotation to', e);
  },
  changeImageOpacity(e) {
    console.log(this.selectedLayer, '- changeImageOpacity to', e);
  }
}
