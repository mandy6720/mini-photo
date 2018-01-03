import _ from 'lodash';

export default {
	createButton(name, className, action) {
		var button = document.createElement("button");
		button.innerText = name;
		button.className = "qs_button " + className;
		button.onclick = action;
		return button;
	},
	createButtonGroup(buttonElems, className) {
		var groupDiv = document.createElement("div");
		groupDiv.className = className;
		_.each(buttonElems, function(button){
			groupDiv.appendChild(button);
		});
		return groupDiv;
	},
	setButtonEnabled(buttonElem, enabled) {
		if (enabled) {
			buttonElem.removeAttribute('disabled');
			buttonElem.classList.remove('disabled');
		} else {
			buttonElem.setAttribute('disabled', true);
			buttonElem.classList.add('disabled');
		}
	},
	createSwatchPicker(swatches, clickHandler) {
		var container = document.createElement("div");
		container.className = "swatch-picker";

		_.each(swatches, function(swatch) {
			var swatchElem = document.createElement("div");
			swatchElem.className = "color-swatch";
			swatchElem.setAttribute("style", "background-color: " + swatch.color);
			swatchElem.setAttribute("data-swatch", swatch.color);
			swatchElem.onclick = function(e) {
				clickHandler(swatch, swatchElem);
			};
			container.appendChild(swatchElem);
		});
		return container;
	},
	addSwatchHighlightByIndex(swatchpicker, index) {
		if (swatchpicker.children.length > 0) {
			this.addSwatchHighlight(swatchpicker.children[0]);
		}
	},
	addSwatchHighlight(swatchElem) {
		swatchElem.classList.add("selected");
	},
	removeSwatchHighlight(swatchElem) {
		swatchElem.classList.remove("selected");
	},
	addCustomTitle(qsPanel, title, refName) {
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
}
