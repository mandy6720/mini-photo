import _ from 'lodash';
import QuickSettings from 'quicksettings';

export default {
  createLayer(panel, documentData) {
    panel.addText('FG', "hi i'm the foreground");
    console.log(panel, documentData)    
  },
}
