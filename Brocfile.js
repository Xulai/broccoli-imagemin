'use strict';

// Require imagemin so it can minify your images
var imagemin = require('./index');

// Make a tree using a string that points to the image directory
var imageTree = 'test/images';

// Create some options to pass into imagemin when minifying your images
var options = {
		interlaced: true,
		optimizationLevel: 3,
		progressive: true,
		lossyPNG: false
};

// Minify the images.
imageTree = imagemin(imageTree, options);

// Export the tree which is now holds the optimised images.
module.exports = imageTree;