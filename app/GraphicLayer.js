import _ from 'lodash';
import QuickSettings from 'quicksettings';

export default {
  createLayer(panel, documentData) {
    console.log(panel, documentData)
    panel.addText('FG', "hi i'm the graphic layer");
    
  },
}
