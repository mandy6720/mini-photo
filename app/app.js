import QuickSettings from 'quicksettings';
import _ from 'lodash';

import MainPanel from './MainPanel';
import Background from './BackgroundLayer';
import Foreground from './ForegroundLayer';

var App = {
  // elems
	rootElem : null,
	canvasElem : null,
  hiResCanvasElem : null,
  svgElem : null,

  // document data
	documentData : {
    canMouseX: null,
    canMouseY: null,
    workspaceSize : {x: 0, y: 0},
    background: {
      backgroundImageSize : {x: 0, y: 0},
      backgroundImage : new Image(),
      backgroundColor: '#000',
      backgroundImageFile: null,
      useColorOnly: true,
    },
    backgroundGraphic: {

    },
    foreground: {
      foregroundImage: null,
      foregroundImageSize: {
        width: null,
        height: null,
        scale: 100
      },
      foregroundImagePosition: {
        x: 0,
        y: 0
      },
      foregroundImageFile: null,
    },
    foregroundGraphic: {},
  },

  // other state
  canvasOffset: null,
	canvasContext : null,
  hiResContext : null,
  hiResScale : 4,
  selectedLayer : 'background',
  isDragging: false,

  init(rootElem) {
    var canvasElem = document.getElementById("app-canvas");
    this.canvasElem = canvasElem;
    this.canvasContext = canvasElem.getContext('2d');
    this.hiResCanvasElem = document.createElement("canvas");
    this.hiResContext = this.hiResCanvasElem.getContext('2d');
    this.rootElem = rootElem;
    this.svgElem = document.getElementById("svg-workspace");

    this.hiResCanvasElem.setAttribute("style", "position: absolute; top: 0; left: 0; display: none;");
    rootElem.appendChild(this.hiResCanvasElem);

    QuickSettings.useExtStyleSheet();

    this.fitCanvasToWindow();

    // add mouse event listeners
    this.canvasElem.addEventListener('mousedown', this.handleMouseDown.bind(this))
    this.canvasElem.addEventListener('mouseup', this.handleMouseUp.bind(this));
    this.canvasElem.addEventListener('mousemove', this.handleMouseMove.bind(this));
    // this.canvasElem.addEventListener('mouseout', (e) => {console.log(e)});
    
    // inset panel here
    MainPanel.init(rootElem, this.documentData);
    MainPanel.documentData = this.documentData;
    MainPanel.selectedLayer = this.selectedLayer;
    MainPanel.updateCanvas = this.handleSelectLayer.bind(this);

    Background.handleChange = this.refreshCanvas.bind(this);
    Foreground.handleChange = this.refreshCanvas.bind(this, this.canvasElem, this.canvasContext);

    this.refreshCanvas()
  },

  fitCanvasToWindow() {
    this.canvasElem.width = this.rootElem.clientWidth;
    this.canvasElem.height = this.rootElem.clientHeight;

    this.hiResCanvasElem.width = this.rootElem.clientWidth * this.hiResScale;
    this.hiResCanvasElem.height = this.rootElem.clientHeight * this.hiResScale;

    this.documentData.workspaceSize.x = this.canvasElem.width;
    this.documentData.workspaceSize.y = this.canvasElem.height;

    this.svgElem.setAttribute('width', this.canvasElem.width);
    this.svgElem.setAttribute('height', this.canvasElem.height);

    this.fitBackgroundToCanvas()
  },
  handleSelectLayer(info) {
    this.selectedLayer = info;
  },
  fitBackgroundToCanvas() {
    var imgWidth = this.documentData.background.backgroundImage.width;
    var imgHeight = this.documentData.background.backgroundImage.height;
    var canvasWidth = this.canvasElem.clientWidth;
    var canvasHeight = this.canvasElem.clientHeight;
    var finalWidth, finalHeight;
    finalWidth = canvasWidth;
    finalHeight = imgWidth !== 0 && imgHeight !== 0 ? (canvasWidth/imgWidth) * imgHeight : canvasHeight;

    if (finalHeight > canvasHeight) {
    finalHeight = canvasHeight;
      finalWidth = (canvasHeight/imgHeight) * imgWidth;
    }

    this.documentData.background.backgroundImageSize.x = finalWidth;
    this.documentData.background.backgroundImageSize.y = finalHeight;

    this.canvasContext.fillStyle = this.documentData.background.backgroundColor || "black";
    this.canvasContext.fillRect(0, 0, canvasWidth, canvasHeight);
  },
  changeColor() {
    this.documentData.background.backgroundImage = new Image();
    this.documentData.background.backgroundImageFile = null;
    this.canvasContext.fillStyle = this.documentData.background.backgroundColor || "black";
    this.canvasContext.fillRect(0, 0, this.documentData.workspaceSize.x, this.documentData.workspaceSize.y);
    this.refreshCanvas(this.canvasElem, this.canvasContext);
  },
  drawBackground(canvas, context, resolution) {
    var drawBgPromise = new Promise((resolve, reject) => {
      var backgroundImageSize = Object.assign({},this.documentData.background.backgroundImageSize);
      resolution = resolution || 1;
      backgroundImageSize.x *= resolution;
      backgroundImageSize.y *= resolution;
      if (this.documentData.background.useColorOnly === true) {
        context.fillStyle = this.documentData.background.backgroundColor || "black";
        context.fillRect(0, 0, canvas.width, canvas.height);
        resolve();
      } else if (this.documentData.background.backgroundImage.classList && this.documentData.background.backgroundImage.classList.contains('img-source')) {
        context.drawImage(this.documentData.background.backgroundImage, 0, 0, backgroundImageSize.x, backgroundImageSize.y);
        resolve();
      } else if (this.documentData.background.backgroundImage.name !== '') {
        // const ImageLoadPromise = new Promise((resolve, reject) => {
          var reader = new FileReader();
          var img;
          var docData = this.documentData;
          reader.onload = function(event){
            docData.background.backgroundImageFile = event.target.result;
            img = new Image();
            img.onload = function(){
              context.drawImage(img, 0, 0, backgroundImageSize.x, backgroundImageSize.y);
              resolve(img);
            }
            img.src = event.target.result;
          }
          reader.readAsDataURL(this.documentData.background.backgroundImage);
        // });
        // ImageLoadPromise.then(img => {
        //   this.drawForeground(canvas, context);
        // })
      } else if (this.documentData.background.backgroundImageFile !== null) {
        var img;
        img = new Image();
        img.onload = function(){
          context.drawImage(img, 0, 0, backgroundImageSize.x, backgroundImageSize.y);
          resolve(img);
        }
        img.src = event.target.result;
      } else {
        console.log(this.documentData.background.backgroundImage)
      }
    });
    drawBgPromise.then(() => {
      console.log('done drawing bg');
      this.drawForeground(this.canvasElem, this.canvasContext);
    })
  },
  drawForeground(canvas, context) {
    var drawFgPromise = new Promise((resolve, reject) => {
      var foregroundImageSize;
      if (this.documentData.foreground.foregroundImage) {
        console.log(this.documentData.foreground)
        foregroundImageSize = Object.assign({}, {
          x: this.documentData.foreground.foregroundImage.width,
          y: this.documentData.foreground.foregroundImage.height
        });
        var scale = this.documentData.foreground.foregroundImageSize.scale || 100;
        scale = scale/100;
        foregroundImageSize.x = this.documentData.foreground.foregroundImage.width * scale;
        foregroundImageSize.y = this.documentData.foreground.foregroundImage.height * scale;
      }
      
      if (this.documentData.foreground.foregroundImage && this.documentData.foreground.foregroundImage.classList && 
        this.documentData.foreground.foregroundImage.classList.contains('img-source-fg')) {
        this.documentData.foreground.foregroundImageFile = null;
        context.drawImage(this.documentData.foreground.foregroundImage, this.documentData.foreground.foregroundImagePosition.x, this.documentData.foreground.foregroundImagePosition.y, foregroundImageSize.x, foregroundImageSize.y);
        resolve();
      } else if (this.documentData.foreground.foregroundImageFile !== null) {
        console.log('handle draw file', this.documentData.foreground);
        foregroundImageSize.x = this.documentData.foreground.foregroundImageSize.width * scale;
        foregroundImageSize.y = this.documentData.foreground.foregroundImageSize.height * scale;
        var img;
        var docData = this.documentData;
        img = new Image();
        img.onload = function(){
          context.drawImage(img, docData.foreground.foregroundImagePosition.x, docData.foreground.foregroundImagePosition.y, foregroundImageSize.x, foregroundImageSize.y);
          resolve(img);
        }
        img.src = this.documentData.foreground.foregroundImageFile;
      } else if (this.documentData.foreground.foregroundImage && this.documentData.foreground.foregroundImage.name !== '') {
        console.log('file upload');
        var reader = new FileReader();
        var img;
        var docData = this.documentData;
        reader.onload = function(event){
          docData.foreground.foregroundImageFile = event.target.result;
          img = new Image();
          img.onload = function(){
            docData.foreground.foregroundImageSize.width = this.width;
            docData.foreground.foregroundImageSize.height = this.height;
            context.drawImage(img, docData.foreground.foregroundImagePosition.x, docData.foreground.foregroundImagePosition.y, docData.foreground.foregroundImageSize.width, docData.foreground.foregroundImageSize.height);
            resolve(img);
          }
          img.src = event.target.result;
        }
        reader.readAsDataURL(this.documentData.foreground.foregroundImage);
      } 
    });
    drawFgPromise.then((img) => {
      console.log('done drawing fg', this.documentData.foreground);
    })
  },
  refreshCanvas(canvas, context, resolution) {
    context = context || this.canvasContext;
    canvas = canvas || this.canvasElem;
    resolution = resolution || 1;
    var backgroundImageSize = this.documentData.background.backgroundImageSize;
    this.drawBackground(canvas, context, resolution);
  },
  handleMouseDown(e) {
    this.documentData.canMouseX = event.clientX;
    this.documentData.canMouseY = event.clientY;
    this.isDragging = true;
  },
  handleMouseUp(e) {
    this.documentData.canMouseX = null;
    this.documentData.canMouseY = null;
    this.isDragging = false;
  },
  handleMouseMove(e) {
    if (this.isDragging) {
      // find selectedLayer and act accordingly
      switch (this.selectedLayer) {
        case 'foreground':
          this.documentData.foreground.foregroundImagePosition.x = e.clientX;
          this.documentData.foreground.foregroundImagePosition.y = e.clientY;
          this.refreshCanvas(this.canvasElem, this.canvasContext);
          break;
        default:
          break;
      }
    }
  },
  handleMouseOut(e) {
    console.log('mouse out', e, this.selectedLayer);
  },
}

export default App;
