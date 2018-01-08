import _ from 'lodash';
import QuickSettings from 'quicksettings';
import * as basicLightbox from 'basiclightbox';

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

    panel.addNumber('Width', 0, documentData !== null ? documentData.workspaceSize.x : 5000, documentData.workspaceSize.x );
    panel.addNumber('Height', 0, documentData !== null ? documentData.workspaceSize.x : 2000, documentData.workspaceSize.y);
    this.formatWidthHeightInputs();

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

    panel.addFileChooser('Background Image', '', 'image/*', this.onChooseImage.bind(this));
    
    var lightbox = basicLightbox.create(`
      <div class="modal">
        <div class="lightbox-container clearfix">
          <div class="background image-thumb" id="bg1"></div>
          <div class="background image-thumb" id="bg2"></div>
          <div class="img-sources">
            <img src="img/background_1.jpg" id="bg1-source" class="img-source" />
            <img src="img/background_2.jpg" id="bg2-source" class="img-source" />
          </div>
        </div>
        <a class="close-button">x</a>
        <button class="qs_button secondary">Select Image</button>
      </div>`, {
        beforeShow: (instance) => {
          console.log(this.documentData.background);
          if (this.documentData.background.backgroundImage.classList && 
            this.documentData.background.backgroundImage.classList.contains('img-source')) {
            instance.element().querySelector(`#${this.documentData.background.backgroundImage.id}`).classList.add('selected');
          }

          instance.element().querySelector('a').onclick = instance.close;
          instance.element().querySelector('button').onclick = () => {
            // set selected if image is selected
            // see this.onChooseImage
            var selected = instance.element().querySelectorAll('.selected');
            if (selected.length > 0) {
              var sourceImg = `#${selected[0].id}-source`;
              var selectedBgImage = instance.element().querySelector(sourceImg);
              this.documentData.background.backgroundImage = selectedBgImage;
              instance.close();
              this.handleChange();
            }
          }
          var thumbs = instance.element().querySelectorAll('.image-thumb');
          _.forEach(thumbs, (thumb) => {
            thumb.onclick = (e) => {
              // remove from others
              // if not already selected, add to clicked
              if (!e.target.classList.contains('selected')) {
                var currentSelection = instance.element().querySelectorAll('.selected');
                if (currentSelection.length > 0) {
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
    panel.addElement('lightbox', lightboxButton)


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
  onChooseImage(fileObj) {
    // var fileURL = URL.createObjectURL(fileObj);
    // this.documentData.background.backgroundImage.src = fileURL; 
    console.log(this.documentData.background, fileObj);
    this.documentData.background.backgroundImage = fileObj;
    this.handleChange();
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
    this.documentData.background.backgroundColor = swatch.color;
    this.handleChange();
    console.log(this.documentData, swatch)
  },
}
