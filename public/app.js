(function() {
  'use strict';

  var globals = typeof global === 'undefined' ? self : global;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};
  var aliases = {};
  var has = {}.hasOwnProperty;

  var expRe = /^\.\.?(\/|$)/;
  var expand = function(root, name) {
    var results = [], part;
    var parts = (expRe.test(name) ? root + '/' + name : name).split('/');
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function expanded(name) {
      var absolute = expand(dirname(path), name);
      return globals.require(absolute, path);
    };
  };

  var initModule = function(name, definition) {
    var hot = hmr && hmr.createHot(name);
    var module = {id: name, exports: {}, hot: hot};
    cache[name] = module;
    definition(module.exports, localRequire(name), module);
    return module.exports;
  };

  var expandAlias = function(name) {
    return aliases[name] ? expandAlias(aliases[name]) : name;
  };

  var _resolve = function(name, dep) {
    return expandAlias(expand(dirname(name), dep));
  };

  var require = function(name, loaderPath) {
    if (loaderPath == null) loaderPath = '/';
    var path = expandAlias(name);

    if (has.call(cache, path)) return cache[path].exports;
    if (has.call(modules, path)) return initModule(path, modules[path]);

    throw new Error("Cannot find module '" + name + "' from '" + loaderPath + "'");
  };

  require.alias = function(from, to) {
    aliases[to] = from;
  };

  var extRe = /\.[^.\/]+$/;
  var indexRe = /\/index(\.[^\/]+)?$/;
  var addExtensions = function(bundle) {
    if (extRe.test(bundle)) {
      var alias = bundle.replace(extRe, '');
      if (!has.call(aliases, alias) || aliases[alias].replace(extRe, '') === alias + '/index') {
        aliases[alias] = bundle;
      }
    }

    if (indexRe.test(bundle)) {
      var iAlias = bundle.replace(indexRe, '');
      if (!has.call(aliases, iAlias)) {
        aliases[iAlias] = bundle;
      }
    }
  };

  require.register = require.define = function(bundle, fn) {
    if (bundle && typeof bundle === 'object') {
      for (var key in bundle) {
        if (has.call(bundle, key)) {
          require.register(key, bundle[key]);
        }
      }
    } else {
      modules[bundle] = fn;
      delete cache[bundle];
      addExtensions(bundle);
    }
  };

  require.list = function() {
    var list = [];
    for (var item in modules) {
      if (has.call(modules, item)) {
        list.push(item);
      }
    }
    return list;
  };

  var hmr = globals._hmr && new globals._hmr(_resolve, require, modules, cache);
  require._cache = cache;
  require.hmr = hmr && hmr.wrap;
  require.brunch = true;
  globals.require = require;
})();

(function() {
var global = typeof window === 'undefined' ? this : window;
var process;
var __makeRelativeRequire = function(require, mappings, pref) {
  var none = {};
  var tryReq = function(name, pref) {
    var val;
    try {
      val = require(pref + '/node_modules/' + name);
      return val;
    } catch (e) {
      if (e.toString().indexOf('Cannot find module') === -1) {
        throw e;
      }

      if (pref.indexOf('node_modules') !== -1) {
        var s = pref.split('/');
        var i = s.lastIndexOf('node_modules');
        var newPref = s.slice(0, i).join('/');
        return tryReq(name, newPref);
      }
    }
    return none;
  };
  return function(name) {
    if (name in mappings) name = mappings[name];
    if (!name) return;
    if (name[0] !== '.' && pref) {
      var val = tryReq(name, pref);
      if (val !== none) return val;
    }
    return require(name);
  }
};
require.register("BackgroundLayer.js", function(exports, require, module) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _quicksettings = require('quicksettings');

var _quicksettings2 = _interopRequireDefault(_quicksettings);

var _util = require('./util');

var _util2 = _interopRequireDefault(_util);

var _palette = require('./palette');

var _palette2 = _interopRequireDefault(_palette);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  panel: null,
  swatchPickers: {},
  selectedSwatchGroup: null,
  documentData: null,

  handleChange: function handleChange() {
    console.log("changed document");
  },

  createLayer: function createLayer(panel, documentData) {
    this.panel = panel;
    this.documentData = documentData;
    this.selectedSwatchGroup = _palette2.default.getSwatchGroupNames()[0];
    console.log('this.selectedSwatchGroup', _palette2.default.getSwatchGroupNames());

    panel.addNumber('Width', 0, documentData !== null ? documentData.workspaceSize.x : 5000);
    panel.addNumber('Height', 0, documentData !== null ? documentData.workspaceSize.x : 2000);
    this.formatWidthHeightInputs();

    // panel.addDropDown(
    //   'Background Color',
    //   ['Light blue', 'Pink', 'Grey', 'Green'],
    //   this.onSelectColor.bind(this)
    // );

    var swatchGroupNames = _palette2.default.getSwatchGroupNames();
    _util2.default.addCustomTitle(panel, "Choose Color Group", "Color Group_Title");
    panel.addDropDown("Color Group", swatchGroupNames, this.onSelectSwatchGroup.bind(this));
    panel.hideTitle("Color Group");

    _lodash2.default.each(swatchGroupNames, function (swatchGroupName) {
      var swatchPicker = _util2.default.createSwatchPicker(_palette2.default.getSwatchesFor(swatchGroupName), this.onSelectSwatch.bind(this));
      this.swatchPickers[swatchGroupName] = swatchPicker;
      panel.addElement(swatchGroupName, swatchPicker);

      panel.hideTitle(swatchGroupName);
      panel.hideControl(swatchGroupName);
    }.bind(this));

    panel.showControl(swatchGroupNames[0]);
    _util2.default.addSwatchHighlightByIndex(this.swatchPickers[swatchGroupNames[0]], 0);
    this.selectedSwatchElem = this.swatchPickers[swatchGroupNames[0]].children[0];
  },
  formatWidthHeightInputs: function formatWidthHeightInputs() {
    var inputsArr = document.getElementsByClassName('qs_container');
    var widthElem = inputsArr[2];
    var heightElem = inputsArr[3];
    widthElem.id = 'width';
    widthElem.classList += " half-width";
    heightElem.id = 'height';
    heightElem.classList += " half-width";
  },
  onSelectColor: function onSelectColor(info) {
    console.log('Selected color', info.value);
  },
  onSelectSwatchGroup: function onSelectSwatchGroup(info) {
    // there's currently no way to edit dropdown contents at runtime
    // (without digging into private properties of the panel),
    // so we're just hiding & showing specific controls
    console.log(info, this.selectedSwatchGroup);
    var selection = info.value;
    this.panel.hideControl(this.selectedSwatchGroup);
    this.panel.showControl(selection);

    this.selectedSwatchGroup = selection;
    if (this.selectedSwatchElem) {
      _util2.default.removeSwatchHighlight(this.selectedSwatchElem);
    }
    _util2.default.addSwatchHighlightByIndex(this.swatchPickers[selection], 0);
    this.selectedSwatchElem = this.swatchPickers[selection].children[0];

    this.handleChange();
  },
  onSelectSwatch: function onSelectSwatch(swatch, elem) {
    if (this.selectedSwatchElem) {
      _util2.default.removeSwatchHighlight(this.selectedSwatchElem);
    }
    _util2.default.addSwatchHighlight(elem);
    this.selectedSwatchElem = elem;
    this.documentData.backgroundColor = swatch.color;
    this.handleChange();
    console.log(this.documentData, swatch);
  }
};
});

;require.register("ForegroundLayer.js", function(exports, require, module) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _quicksettings = require('quicksettings');

var _quicksettings2 = _interopRequireDefault(_quicksettings);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  createLayer: function createLayer(panel, documentData) {
    panel.addText('FG', "hi i'm the foreground");
    console.log(panel, documentData);
  }
};
});

;require.register("GraphicLayer.js", function(exports, require, module) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _quicksettings = require('quicksettings');

var _quicksettings2 = _interopRequireDefault(_quicksettings);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  createLayer: function createLayer(panel, documentData) {
    console.log(panel, documentData);
    panel.addText('FG', "hi i'm the graphic layer");
  }
};
});

;require.register("MainPanel.js", function(exports, require, module) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _quicksettings = require('quicksettings');

var _quicksettings2 = _interopRequireDefault(_quicksettings);

var _util = require('./util');

var _util2 = _interopRequireDefault(_util);

var _BackgroundLayer = require('./BackgroundLayer');

var _BackgroundLayer2 = _interopRequireDefault(_BackgroundLayer);

var _ForegroundLayer = require('./ForegroundLayer');

var _ForegroundLayer2 = _interopRequireDefault(_ForegroundLayer);

var _GraphicLayer = require('./GraphicLayer');

var _GraphicLayer2 = _interopRequireDefault(_GraphicLayer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  panel: null,
  documentData: null,
  selectedLayer: 'background',
  rootElem: null,

  handleChange: function handleChange() {
    console.log("changed document");
  },
  updateCanvas: function updateCanvas() {
    console.log("changed layer");
  },
  handleChooseBackgroundImage: function handleChooseBackgroundImage(fileObject) {
    console.log("selected background image", fileObject);
  },

  init: function init(rootElem, documentData) {
    var panel = _quicksettings2.default.create(5, 5, 'Layer', rootElem);
    this.panel = panel;
    this.rootElem = rootElem;
    this.documentData = documentData;
    this.addCommonInputs(panel);
  },
  addLayers: function addLayers() {
    var parent = document.getElementById('layers-img');
    var layers = ['background', 'bg-graphic', 'foreground', 'fg-graphic'];
    layers.forEach(function (layer, index) {
      var el = document.createElement("div");
      el.id = layer;
      el.classList = 'layer';
      if (index == 0) {
        el.className += ' selected';
      }
      parent.append(el);
    });
  },
  setLayerImg: function setLayerImg(layer) {
    console.log('Set layer to', layer);
    var layerElems = document.getElementsByClassName('layer');
    _lodash2.default.forEach(layerElems, function (item) {
      item.classList = 'layer';
    });
    document.getElementById(layer).classList += ' selected';
  },
  onSelectLayer: function onSelectLayer(info) {
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
  handleSelectLayer: function handleSelectLayer(newLayer) {
    this.selectedLayer = newLayer;
    this.updatePanel(newLayer);
    this.setLayerImg(newLayer);
    this.updateCanvas(newLayer);
  },
  addCommonInputs: function addCommonInputs(panel, newPanelType) {
    var layersImgContainer = document.createElement("div");
    layersImgContainer.id = "layers-img";
    panel.addElement('', layersImgContainer);
    this.addLayers();

    panel.addDropDown('Layer Select', ['Background', 'Background Graphic', 'Foreground', 'Foreground Graphic'], this.onSelectLayer.bind(this));

    document.getElementsByClassName('qs_container')[0].id = 'layers-img-container';
    document.getElementsByClassName('qs_container')[1].id = 'layers-select-dropdown';
    console.log(this.documentData);
    this.addLayerSpecificInputs(panel);
  },
  addLayerSpecificInputs: function addLayerSpecificInputs(panel) {
    switch (this.selectedLayer) {
      case 'background':
        _BackgroundLayer2.default.createLayer(panel, this.documentData);
        break;
      case 'bg-graphic':
      case 'fg-graphic':
        _GraphicLayer2.default.createLayer(panel);
        break;
      case 'foreground':
        _ForegroundLayer2.default.createLayer(panel);
        break;
      default:
        break;
    }
  },
  updatePanel: function updatePanel(newPanelType) {

    var panelInputs = document.getElementsByClassName('qs_container');

    for (var i = panelInputs.length - 1; i > 0; i--) {
      if (panelInputs[i].id !== 'layers-img-container' && panelInputs[i].id !== 'layers-select-dropdown') {
        panelInputs[i].remove();
      }
    }
    this.addLayerSpecificInputs(this.panel);

    console.log('newPanelType', newPanelType);
  }
};
});

;require.register("app.js", function(exports, require, module) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _quicksettings = require('quicksettings');

var _quicksettings2 = _interopRequireDefault(_quicksettings);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _MainPanel = require('./MainPanel');

var _MainPanel2 = _interopRequireDefault(_MainPanel);

var _BackgroundLayer = require('./BackgroundLayer');

var _BackgroundLayer2 = _interopRequireDefault(_BackgroundLayer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var App = {
  // elems
  rootElem: null,
  canvasElem: null,
  hiResCanvasElem: null,
  svgElem: null,

  // document data
  documentData: {
    workspaceSize: { x: 0, y: 0 },
    backgroundImageSize: { x: 0, y: 0 },
    backgroundImage: new Image(),
    backgroundColor: '#000'
  },

  // other state
  canvasContext: null,
  hiResContext: null,
  hiResScale: 4,
  selectedLayer: 'background',

  init: function init(rootElem) {
    var canvasElem = document.getElementById("app-canvas");
    this.canvasElem = canvasElem;
    this.canvasContext = canvasElem.getContext('2d');
    this.hiResCanvasElem = document.createElement("canvas");
    this.hiResContext = this.hiResCanvasElem.getContext('2d');
    this.rootElem = rootElem;
    this.svgElem = document.getElementById("svg-workspace");

    this.hiResCanvasElem.setAttribute("style", "position: absolute; top: 0; left: 0; display: none;");
    rootElem.appendChild(this.hiResCanvasElem);

    _quicksettings2.default.useExtStyleSheet();

    this.fitCanvasToWindow();

    // inset panel here
    _MainPanel2.default.init(rootElem, this.documentData);
    _MainPanel2.default.documentData = this.documentData;
    _MainPanel2.default.selectedLayer = this.selectedLayer;
    _MainPanel2.default.updateCanvas = this.handleSelectLayer.bind(this);

    _BackgroundLayer2.default.handleChange = this.handleChangeColor.bind(this);

    this.refreshCanvas();
  },
  fitCanvasToWindow: function fitCanvasToWindow() {
    this.canvasElem.width = this.rootElem.clientWidth;
    this.canvasElem.height = this.rootElem.clientHeight;

    this.hiResCanvasElem.width = this.rootElem.clientWidth * this.hiResScale;
    this.hiResCanvasElem.height = this.rootElem.clientHeight * this.hiResScale;

    this.documentData.workspaceSize.x = this.canvasElem.width;
    this.documentData.workspaceSize.y = this.canvasElem.height;

    this.svgElem.setAttribute('width', this.canvasElem.width);
    this.svgElem.setAttribute('height', this.canvasElem.height);
  },
  handleSelectLayer: function handleSelectLayer(info) {
    console.log('[app.js] Layer selected', info);
    // destory panel in MainPanel and build new one according to layer selected
  },
  handleChangeColor: function handleChangeColor() {
    console.log('hi');
    this.refreshCanvas();
  },
  fitBackgroundToCanvas: function fitBackgroundToCanvas() {
    var imgWidth = this.documentData.backgroundImage.width;
    var imgHeight = this.documentData.backgroundImage.height;
    var canvasWidth = this.canvasElem.clientWidth;
    var canvasHeight = this.canvasElem.clientHeight;
    var finalWidth, finalHeight;

    finalWidth = canvasWidth;
    finalHeight = canvasWidth / imgWidth * imgHeight;

    if (finalHeight > canvasHeight) {
      finalHeight = canvasHeight;
      finalWidth = canvasHeight / imgHeight * imgWidth;
    }

    this.documentData.backgroundImageSize.x = finalWidth;
    this.documentData.backgroundImageSize.y = finalHeight;
  },
  drawBackground: function drawBackground(canvas, context, resolution) {
    var backgroundImageSize = Object.assign({}, this.documentData.backgroundImageSize);
    resolution = resolution || 1;
    backgroundImageSize.x *= resolution;
    backgroundImageSize.y *= resolution;
    context.fillStyle = this.documentData.backgroundColor || "black";
    context.fillRect(0, 0, canvas.width, canvas.height);
    if (this.documentData.backgroundImage.src) {
      context.drawImage(this.documentData.backgroundImage, (canvas.width - backgroundImageSize.x) * 0.5, (canvas.height - backgroundImageSize.y) * 0.5, backgroundImageSize.x, backgroundImageSize.y);
    }
  },
  onChooseImage: function onChooseImage(fileObj) {
    var fileURL = URL.createObjectURL(fileObj);
    this.documentData.backgroundImage.src = fileURL;
  },
  refreshCanvas: function refreshCanvas(canvas, context, resolution) {
    context = context || this.canvasContext;
    canvas = canvas || this.canvasElem;
    resolution = resolution || 1;
    var backgroundImageSize = this.documentData.backgroundImageSize;
    this.drawBackground(canvas, context, resolution);
  }
};

exports.default = App;
});

require.register("init.js", function(exports, require, module) {
'use strict';

var _app = require('./app');

var _app2 = _interopRequireDefault(_app);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var didInit = false;

function init() {
    if (!didInit) {
        var rootElem = document.getElementById("app-root");
        _app2.default.init(rootElem);
    }
}

document.addEventListener('DOMContentLoaded', init);
});

require.register("palette.js", function(exports, require, module) {
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _watsonColors = require('./watson-colors');

var _watsonColors2 = _interopRequireDefault(_watsonColors);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// ick. this is kinda messy internally.
// should probably have a load step that processes the swatch data
// rather than constantly having to order things by name on the fly

exports.default = {
	_swatchCollection: _watsonColors2.default,

	getDefaultSwatchGroup: function getDefaultSwatchGroup() {
		return this.getSwatchGroupByName(this.getSwatchGroupNames()[0]);
	},
	getDefaultColor: function getDefaultColor() {
		var defaultGroupName = this.getDefaultSwatchGroup().name;
		// return this.getSwatchValue(defaultGroupName, this.getSwatchNamesFor(defaultGroupName)[0]);
		return this.getSwatchesFor(defaultGroupName)[0].color;
	},
	getSwatchGroupByName: function getSwatchGroupByName(groupName) {
		return _lodash2.default.find(this._swatchCollection, function (swatchGroup) {
			return swatchGroup.name == groupName;
		});
	},
	getSwatchGroupNames: function getSwatchGroupNames() {
		return _lodash2.default.map(this._swatchCollection, function (swatchGroup) {
			return swatchGroup.name;
		}).sort();
	},
	getSwatchNamesFor: function getSwatchNamesFor(swatchGroupName) {
		return _lodash2.default.map(this.getSwatchesFor(swatchGroupName), function (swatch) {
			return swatch.name;
		}).sort();
	},
	getSwatchesFor: function getSwatchesFor(swatchGroupName) {
		return this.getSwatchGroupByName(swatchGroupName).swatches;
	},
	getSwatchValue: function getSwatchValue(swatchGroupName, swatchName) {
		return _lodash2.default.find(this.getSwatchesFor(swatchGroupName), function (swatch) {
			return swatch.name == swatchName;
		}).color;
	}
};
});

require.register("util.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
	createButton: function createButton(name, className, action) {
		var button = document.createElement("button");
		button.innerText = name;
		button.className = "qs_button " + className;
		button.onclick = action;
		return button;
	},
	createButtonGroup: function createButtonGroup(buttonElems, className) {
		var groupDiv = document.createElement("div");
		groupDiv.className = className;
		_lodash2.default.each(buttonElems, function (button) {
			groupDiv.appendChild(button);
		});
		return groupDiv;
	},
	setButtonEnabled: function setButtonEnabled(buttonElem, enabled) {
		if (enabled) {
			buttonElem.removeAttribute('disabled');
			buttonElem.classList.remove('disabled');
		} else {
			buttonElem.setAttribute('disabled', true);
			buttonElem.classList.add('disabled');
		}
	},
	createSwatchPicker: function createSwatchPicker(swatches, clickHandler) {
		var container = document.createElement("div");
		container.className = "swatch-picker";

		_lodash2.default.each(swatches, function (swatch) {
			var swatchElem = document.createElement("div");
			swatchElem.className = "color-swatch";
			swatchElem.setAttribute("style", "background-color: " + swatch.color);
			swatchElem.setAttribute("data-swatch", swatch.color);
			swatchElem.onclick = function (e) {
				clickHandler(swatch, swatchElem);
			};
			container.appendChild(swatchElem);
		});
		return container;
	},
	addSwatchHighlightByIndex: function addSwatchHighlightByIndex(swatchpicker, index) {
		if (swatchpicker.children.length > 0) {
			this.addSwatchHighlight(swatchpicker.children[0]);
		}
	},
	addSwatchHighlight: function addSwatchHighlight(swatchElem) {
		swatchElem.classList.add("selected");
	},
	removeSwatchHighlight: function removeSwatchHighlight(swatchElem) {
		swatchElem.classList.remove("selected");
	},
	addCustomTitle: function addCustomTitle(qsPanel, title, refName) {
		// it was important for the design to remove the separator
		// and treat titles consistently.
		// this is a way of achieving that.
		refName = refName || title + "_title";
		var div = document.createElement("div");
		div.className = "custom-title";
		div.innerText = title;
		qsPanel.addElement(refName, div);
		qsPanel.hideTitle(refName);
		return refName;
	}
};
});

;require.register("watson-colors.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = [{
    "swatches": [{
        "name": "Purple 10",
        "color": "#eed2ff"
    }, {
        "name": "Purple 20",
        "color": "#d7aaff"
    }, {
        "name": "Purple 30",
        "color": "#ba8ff7"
    }, {
        "name": "Purple 40",
        "color": "#af6ee8"
    }, {
        "name": "Purple 50",
        "color": "#9855d4"
    }, {
        "name": "Purple 60",
        "color": "#734098"
    }, {
        "name": "Purple 70",
        "color": "#562f72"
    }, {
        "name": "Purple 80",
        "color": "#412356"
    }, {
        "name": "Purple 90",
        "color": "#311a41"
    }, {
        "name": "R=1 G=1 B=3",
        "color": "#010103"
    }, {
        "name": "Teal 10",
        "color": "#a7fae6"
    }, {
        "name": "Teal 20",
        "color": "#6eedd8"
    }, {
        "name": "Teal 30",
        "color": "#41d6c3"
    }, {
        "name": "Teal 40",
        "color": "#00b4a0"
    }, {
        "name": "Teal 50",
        "color": "#008571"
    }, {
        "name": "Teal 60",
        "color": "#006d5d"
    }, {
        "name": "Teal 70",
        "color": "#005448"
    }, {
        "name": "Teal 80",
        "color": "#003c32"
    }, {
        "name": "Teal 90",
        "color": "#012b22"
    }, {
        "name": "R=0 G=2 B=2",
        "color": "#000202"
    }, {
        "name": "White",
        "color": "#ffffff"
    }, {
        "name": "White 2",
        "color": "#f9f9f9"
    }, {
        "name": "White 3",
        "color": "#f4f4f4"
    }, {
        "name": "White 4",
        "color": "#ececec"
    }, {
        "name": "Grey 10",
        "color": "#e0e0e0"
    }, {
        "name": "Grey 20",
        "color": "#c7c7c7"
    }, {
        "name": "Grey 30",
        "color": "#aeaeae"
    }, {
        "name": "Grey 40",
        "color": "#959595"
    }, {
        "name": "Grey 50",
        "color": "#777677"
    }, {
        "name": "Grey 60",
        "color": "#5a5a5a"
    }, {
        "name": "Grey 70",
        "color": "#464646"
    }, {
        "name": "Grey 80",
        "color": "#323232"
    }, {
        "name": "Grey 90",
        "color": "#1e1e1e"
    }, {
        "name": "Grey 100",
        "color": "#000000"
    }, {
        "name": "Grey 100 copy",
        "color": "#000000"
    }],
    "name": "Purple-Teal"
}, {
    "swatches": [{
        "color": "#eed2ff",
        "name": "Purple 10"
    }, {
        "color": "#d7aaff",
        "name": "Purple 20"
    }, {
        "color": "#ba8ff7",
        "name": "Purple 30"
    }, {
        "color": "#af6ee8",
        "name": "Purple 40"
    }, {
        "color": "#9855d4",
        "name": "Purple 50"
    }, {
        "color": "#734098",
        "name": "Purple 60"
    }, {
        "color": "#562f72",
        "name": "Purple 70"
    }, {
        "color": "#412356",
        "name": "Purple 80"
    }, {
        "color": "#311a41",
        "name": "Purple 90"
    }, {
        "color": "#010103",
        "name": "R=1 G=1 B=3"
    }, {
        "color": "#c0e6ff",
        "name": "Blue 10"
    }, {
        "color": "#7cc7ff",
        "name": "Blue 20"
    }, {
        "color": "#5aaafa",
        "name": "Blue 30"
    }, {
        "color": "#5596e6",
        "name": "Blue 40"
    }, {
        "color": "#4178be",
        "name": "Blue 50"
    }, {
        "color": "#325c80",
        "name": "Blue 60"
    }, {
        "color": "#264a60",
        "name": "Blue 70"
    }, {
        "color": "#1d3649",
        "name": "Blue 80"
    }, {
        "color": "#152935",
        "name": "Blue 90"
    }, {
        "color": "#010205",
        "name": "R=1 G=2 B=5"
    }, {
        "color": "#ffffff",
        "name": "White"
    }, {
        "color": "#f9f9f9",
        "name": "White 2"
    }, {
        "color": "#f4f4f4",
        "name": "White 3"
    }, {
        "color": "#ececec",
        "name": "White 4"
    }, {
        "color": "#e0e0e0",
        "name": "Grey 10"
    }, {
        "color": "#c7c7c7",
        "name": "Grey 20"
    }, {
        "color": "#aeaeae",
        "name": "Grey 30"
    }, {
        "color": "#959595",
        "name": "Grey 40"
    }, {
        "color": "#777677",
        "name": "Grey 50"
    }, {
        "color": "#5a5a5a",
        "name": "Grey 60"
    }, {
        "color": "#464646",
        "name": "Grey 70"
    }, {
        "color": "#323232",
        "name": "Grey 80"
    }, {
        "color": "#1e1e1e",
        "name": "Grey 90"
    }, {
        "color": "#000000",
        "name": "Grey 100"
    }, {
        "color": "#000000",
        "name": "Grey 100 copy"
    }],
    "name": "Purple-Blue"
}, {
    "swatches": [{
        "name": "Green 10",
        "color": "#c8f08f"
    }, {
        "name": "Green 20",
        "color": "#b4e051"
    }, {
        "name": "Green 30",
        "color": "#8cd211"
    }, {
        "name": "Green 40",
        "color": "#5aa700"
    }, {
        "name": "Green 50",
        "color": "#4b8400"
    }, {
        "name": "Green 60",
        "color": "#2d660a"
    }, {
        "name": "Green 70",
        "color": "#144d14"
    }, {
        "name": "Green 80",
        "color": "#0a3c02"
    }, {
        "name": "Green 90",
        "color": "#0c2808"
    }, {
        "name": "R=1 G=2 B=0",
        "color": "#010200"
    }, {
        "name": "Teal 10",
        "color": "#a7fae6"
    }, {
        "name": "Teal 20",
        "color": "#6eedd8"
    }, {
        "name": "Teal 30",
        "color": "#41d6c3"
    }, {
        "name": "Teal 40",
        "color": "#00b4a0"
    }, {
        "name": "Teal 50",
        "color": "#008571"
    }, {
        "name": "Teal 60",
        "color": "#006d5d"
    }, {
        "name": "Teal 70",
        "color": "#005448"
    }, {
        "name": "Teal 80",
        "color": "#003c32"
    }, {
        "name": "Teal 90",
        "color": "#012b22"
    }, {
        "name": "R=0 G=2 B=2",
        "color": "#000202"
    }, {
        "name": "White",
        "color": "#ffffff"
    }, {
        "name": "White 2",
        "color": "#f9f9f9"
    }, {
        "name": "White 3",
        "color": "#f4f4f4"
    }, {
        "name": "White 4",
        "color": "#ececec"
    }, {
        "name": "Grey 10",
        "color": "#e0e0e0"
    }, {
        "name": "Grey 20",
        "color": "#c7c7c7"
    }, {
        "name": "Grey 30",
        "color": "#aeaeae"
    }, {
        "name": "Grey 40",
        "color": "#959595"
    }, {
        "name": "Grey 50",
        "color": "#777677"
    }, {
        "name": "Grey 60",
        "color": "#5a5a5a"
    }, {
        "name": "Grey 70",
        "color": "#464646"
    }, {
        "name": "Grey 80",
        "color": "#323232"
    }, {
        "name": "Grey 90",
        "color": "#1e1e1e"
    }, {
        "name": "Grey 100",
        "color": "#000000"
    }, {
        "name": "Grey 100 copy",
        "color": "#000000"
    }],
    "name": "Green-Teal"
}, {
    "swatches": [{
        "color": "#c0e6ff",
        "name": "Blue 10"
    }, {
        "color": "#7cc7ff",
        "name": "Blue 20"
    }, {
        "color": "#5aaafa",
        "name": "Blue 30"
    }, {
        "color": "#5596e6",
        "name": "Blue 40"
    }, {
        "color": "#4178be",
        "name": "Blue 50"
    }, {
        "color": "#325c80",
        "name": "Blue 60"
    }, {
        "color": "#264a60",
        "name": "Blue 70"
    }, {
        "color": "#1d3649",
        "name": "Blue 80"
    }, {
        "color": "#152935",
        "name": "Blue 90"
    }, {
        "color": "#010205",
        "name": "R=1 G=2 B=5"
    }, {
        "color": "#a7fae6",
        "name": "Teal 10"
    }, {
        "color": "#6eedd8",
        "name": "Teal 20"
    }, {
        "color": "#41d6c3",
        "name": "Teal 30"
    }, {
        "color": "#00b4a0",
        "name": "Teal 40"
    }, {
        "color": "#008571",
        "name": "Teal 50"
    }, {
        "color": "#006d5d",
        "name": "Teal 60"
    }, {
        "color": "#005448",
        "name": "Teal 70"
    }, {
        "color": "#003c32",
        "name": "Teal 80"
    }, {
        "color": "#012b22",
        "name": "Teal 90"
    }, {
        "color": "#000202",
        "name": "R=0 G=2 B=2"
    }, {
        "color": "#ffffff",
        "name": "White"
    }, {
        "color": "#f9f9f9",
        "name": "White 2"
    }, {
        "color": "#f4f4f4",
        "name": "White 3"
    }, {
        "color": "#ececec",
        "name": "White 4"
    }, {
        "color": "#e0e0e0",
        "name": "Grey 10"
    }, {
        "color": "#c7c7c7",
        "name": "Grey 20"
    }, {
        "color": "#aeaeae",
        "name": "Grey 30"
    }, {
        "color": "#959595",
        "name": "Grey 40"
    }, {
        "color": "#777677",
        "name": "Grey 50"
    }, {
        "color": "#5a5a5a",
        "name": "Grey 60"
    }, {
        "color": "#464646",
        "name": "Grey 70"
    }, {
        "color": "#323232",
        "name": "Grey 80"
    }, {
        "color": "#1e1e1e",
        "name": "Grey 90"
    }, {
        "color": "#000000",
        "name": "Grey 100"
    }, {
        "color": "#000000",
        "name": "Grey 100 copy"
    }],
    "name": "Blue-Teal"
}];
});

;require.alias("buffer/index.js", "buffer");
require.alias("process/browser.js", "process");process = require('process');require.register("___globals___", function(exports, require, module) {
  
});})();require('___globals___');


//# sourceMappingURL=app.js.map