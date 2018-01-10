import _ from 'lodash';
import QuickSettings from 'quicksettings';
import * as basicLightbox from 'basiclightbox';

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

    var lightbox = basicLightbox.create(`
      <div class="modal">
        <div class="lightbox-container clearfix">
          <div class="${this.selectedLayer} image-thumb" id="graphic1"></div>
          <div class="${this.selectedLayer} image-thumb" id="graphic2"></div>
          <div class="img-sources">
            <img src="img/graphic_1.png" id="graphic1-source" class="img-source-graphic" />
            <img src="img/graphic_2.png" id="graphic2-source" class="img-source-graphic" />
          </div>
        </div>
        <a class="close-button">x</a>
        <button class="qs_button secondary">Select Image</button>
      </div>`, {
        beforeShow: (instance) => {
          if (this.selectedLayer == 'bg-graphic') {
            if (this.documentData.backgroundGraphic.backgroundGraphicImage.classList && 
              this.documentData.backgroundGraphic.backgroundGraphicImage.classList.contains('img-source-graphic')) {
              instance.element().querySelector(`#${this.documentData.backgroundGraphic.backgroundGraphicImage.id}`).classList.add('selected');
            }
          } else if (this.selectedLayer == 'fg-graphic') {
            if (this.documentData.foregroundGraphic.foregroundGraphicImage.classList && 
              this.documentData.foregroundGraphic.foregroundGraphicImage.classList.contains('img-source-graphic')) {
              instance.element().querySelector(`#${this.documentData.foregroundGraphic.foregroundGraphicImage.id}`).classList.add('selected');
            }
          }

          instance.element().querySelector('a').onclick = instance.close;
          instance.element().querySelector('button').onclick = () => {
            // set selected if image is selected
            // see this.onChooseImage
            var selected = instance.element().querySelectorAll('.selected');
            if (selected.length > 0) {
              var sourceImg = `#${selected[0].id}-source`;
              var selectedGraphicImage = instance.element().querySelector(sourceImg);
              if (this.selectedLayer === 'bg-graphic') {
                this.documentData.backgroundGraphic.backgroundGraphicImage = selectedGraphicImage;
                this.documentData.backgroundGraphic.drawBgGraphic = true;
                this.documentData.backgroundGraphic.backgroundGraphicImageSize = {
                  x: this.documentData.backgroundGraphic.backgroundGraphicImage.width,
                  y: this.documentData.backgroundGraphic.backgroundGraphicImage.height
                };
                this.handleChange();
                console.log(this.selectedLayer, 'choose graphic', this.documentData.backgroundGraphic)
              } else if (this.selectedLayer === 'fg-graphic') {
                this.documentData.foregroundGraphic.foregroundGraphicImage = selectedGraphicImage;
                this.documentData.foregroundGraphic.drawFgGraphic = true;
                this.documentData.foregroundGraphic.foregroundGraphicImageSize = {
                  x: this.documentData.foregroundGraphic.foregroundGraphicImage.width,
                  y: this.documentData.foregroundGraphic.foregroundGraphicImage.height
                };
                console.log(this.selectedLayer, 'choose graphic', this.documentData.foregroundGraphic)
              }
              
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
    
    var lightboxButton = qsUtil.createButton("Choose a graphic", "secondary", lightbox.show.bind(this));
    panel.addElement('', lightboxButton);
  },
  resizeImage(e) {
    console.log(this.selectedLayer, '- resize to', e);
  },
  changeImageRotation(e) {
    console.log(this.selectedLayer, '- changeImageRotation to', e);
  },
  changeImageOpacity(e) {
    console.log(this.selectedLayer, '- changeImageOpacity to', e);
  },
  onChooseImage() {
    console.log(this.selectedLayer, 'choose graphic', this.documentData)
  }
}
