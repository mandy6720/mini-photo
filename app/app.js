import QuickSettings from 'quicksettings';
import _ from 'lodash';

import MainPanel from './MainPanel';

var App = {
  // elems
	rootElem : null,
	canvasElem : null,
  hiResCanvasElem : null,
  svgElem : null,

  // document data
	documentData : {
		workspaceSize : {x: 0, y: 0},
		backgroundImageSize : {x: 0, y: 0},
		backgroundImage : new Image(),
		grids : [],
		magnets : [],
		masks : [],
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
    MainPanel.init(rootElem);
    MainPanel.documentData = this.documentData;
    MainPanel.selectedLayer = this.selectedLayer;
    MainPanel.handleSelectLayer = this.handleSelectLayer.bind(this);
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
  }
}

export default App;
