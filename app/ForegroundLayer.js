import _ from 'lodash';
import QuickSettings from 'quicksettings';
import * as basicLightbox from 'basiclightbox';

import qsUtil from './util';

export default {
  panel: null,
  documentData: null,
  imageSize: null,

  handleChange : function() {console.log("changed document - foreground")},

  createLayer(panel, documentData) {
    console.log(panel, documentData)    

    this.panel = panel;
    this.documentData = documentData;

    panel.addRange('Size', 0, 300, 100, 1, this.resizeImage.bind(this));

    var lightbox = basicLightbox.create(`
      <div class="modal">
        <div class="lightbox-container clearfix">
          <div class="foreground image-thumb" id="fg1"></div>
          <div class="foreground image-thumb" id="fg2"></div>
          <img src="img/foreground_1.png" id="fg1-source" class="img-source-fg" />
          <img src="img/foreground_2.png" id="fg2-source" class="img-source-fg" />
        </div>
        <a class="close-button">x</a>
        <button class="qs_button secondary">Select Image</button>
      </div>`, {
        beforeShow: (instance) => {
          // if (this.documentData.background.backgroundImage.classList && 
          //   this.documentData.background.backgroundImage.classList.contains('img-source')) {
          //   instance.element().querySelector(`#${this.documentData.background.backgroundImage.id}`).classList.add('selected');
          // }
          console.log(this.documentData)
          instance.element().querySelector('a').onclick = instance.close;
          instance.element().querySelector('button').onclick = () => {
            // set selected if image is selected
            // see this.onChooseImage
            var selected = instance.element().querySelectorAll('.selected');
            if (selected.length > 0) {
              var sourceImg = `#${selected[0].id}-source`;
              var selectedBgImage = instance.element().querySelector(sourceImg);
              this.documentData.foreground.foregroundImage = selectedBgImage;
              this.documentData.foreground.foregroundImageSize = 100;
              this.imageSize = 100;
              instance.close();
              this.handleChange();
            }
          }
          var thumbs = instance.element().querySelectorAll('.image-thumb');
          _.forEach(thumbs, (thumb) => {
            thumb.onclick = (e) => {
              // if not already selected, add to clicked
              if (!e.target.classList.contains('selected')) {
                var currentSelection = instance.element().querySelectorAll('.selected');
                if (currentSelection.length > 0) {
                  // remove from others
                  currentSelection[0].classList.remove('selected');
                }
                e.target.classList.add('selected');
              } else {
                e.target.classList.remove('selected');
              }
            }
          });
          
        }
      });
    
    var lightboxButton = qsUtil.createButton("Open", "secondary", lightbox.show.bind(this));
    panel.addElement('Or choose from library:', lightboxButton)
  },
  resizeImage(e) {
    this.imageSize = e;
    console.log('resize to', e)
  }
}
