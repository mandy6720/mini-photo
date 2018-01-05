import QuickSettings from 'quicksettings';
import _ from 'lodash';

import MainPanel from './MainPanel';
import Background from './BackgroundLayer';

var App = {
  // elems
	rootElem : null,
	canvasElem : null,
  hiResCanvasElem : null,
  svgElem : null,

  // document data
	documentData : {
    workspaceSize : {x: 0, y: 0},
    background: {
      backgroundImageSize : {x: 0, y: 0},
      backgroundImage : new Image(),
      backgroundColor: '#000',
    },
    backgroundGraphic: {},
    foreground: {},
    foregroundGraphic: {},
  },

  // other state
	canvasContext : null,
  hiResContext : null,
  hiResScale : 4,
  selectedLayer : 'background',

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
    
    // inset panel here
    MainPanel.init(rootElem, this.documentData);
    MainPanel.documentData = this.documentData;
    MainPanel.selectedLayer = this.selectedLayer;
    MainPanel.updateCanvas = this.handleSelectLayer.bind(this);

    Background.handleChange = this.refreshCanvas.bind(this);

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
  },
  handleSelectLayer(info) {
    console.log('[app.js] Layer selected', info);
    // destory panel in MainPanel and build new one according to layer selected
  },
  fitBackgroundToCanvas() {
    var imgWidth = this.documentData.background.backgroundImage.width;
    var imgHeight = this.documentData.background.backgroundImage.height;
    var canvasWidth = this.canvasElem.clientWidth;
    var canvasHeight = this.canvasElem.clientHeight;
    var finalWidth, finalHeight;

    finalWidth = canvasWidth;
    finalHeight = (canvasWidth/imgWidth) * imgHeight;

    if (finalHeight > canvasHeight) {
    finalHeight = canvasHeight;
      finalWidth = (canvasHeight/imgHeight) * imgWidth;
    }

    this.documentData.background.backgroundImageSize.x = finalWidth;
    this.documentData.background.backgroundImageSize.y = finalHeight;
  },
  drawBackground(canvas, context, resolution) {
    var backgroundImageSize = Object.assign({},this.documentData.background.backgroundImageSize);
    resolution = resolution || 1;
    backgroundImageSize.x *= resolution;
    backgroundImageSize.y *= resolution;
    context.fillStyle = this.documentData.background.backgroundColor || "black";
    context.fillRect(0, 0, canvas.width, canvas.height);
    if (this.documentData.background.backgroundImage.src) {
      context.drawImage(this.documentData.background.backgroundImage, (canvas.width - backgroundImageSize.x) * 0.5, (canvas.height - backgroundImageSize.y) * 0.5, backgroundImageSize.x, backgroundImageSize.y);
    }
  },
  refreshCanvas(canvas, context, resolution) {
    context = context || this.canvasContext;
    canvas = canvas || this.canvasElem;
    resolution = resolution || 1;
    var backgroundImageSize = this.documentData.background.backgroundImageSize;
    this.drawBackground(canvas, context, resolution);
    // create functions for each layer and pile on top of eachother
  },
}

export default App;
