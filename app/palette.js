import _ from 'lodash';

import brandedColors from './watson-colors';

// ick. this is kinda messy internally.
// should probably have a load step that processes the swatch data
// rather than constantly having to order things by name on the fly

export default {
	_swatchCollection : brandedColors,
	
	getDefaultSwatchGroup() {
		return this.getSwatchGroupByName(this.getSwatchGroupNames()[0]);
	},

	getDefaultColor() {
		var defaultGroupName = this.getDefaultSwatchGroup().name;
		// return this.getSwatchValue(defaultGroupName, this.getSwatchNamesFor(defaultGroupName)[0]);
		return this.getSwatchesFor(defaultGroupName)[0].color;
	},

	getSwatchGroupByName(groupName) {
		return _.find(this._swatchCollection, function(swatchGroup) {
			return swatchGroup.name == groupName;
		});
	},

	getSwatchGroupNames() {
		return _.map(this._swatchCollection, function(swatchGroup) {
	    	return swatchGroup.name;
	    }).sort();
	},
	getSwatchNamesFor(swatchGroupName) {
		return _.map(this.getSwatchesFor(swatchGroupName), function(swatch) {
			return swatch.name;
		}).sort();
	},
	getSwatchesFor(swatchGroupName) {
		return this.getSwatchGroupByName(swatchGroupName).swatches;
	},
	getSwatchValue(swatchGroupName, swatchName) {
		return _.find(this.getSwatchesFor(swatchGroupName), function(swatch) {
			return swatch.name == swatchName;
		}).color;
	},
};
