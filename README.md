broccoli-imagemin
===========

[![NPM](https://nodei.co/npm/broccoli-imagemin.png)](https://nodei.co/npm/broccoli-imagemin/)
[![Build Status](https://travis-ci.org/Xulai/broccoli-imagemin.png?branch=master)](https://travis-ci.org/Xulai/broccoli-imagemin) [![Dependency Status](https://david-dm.org/Xulai/broccoli-imagemin.png)](https://david-dm.org/Xulai/broccoli-imagemin)

## Information

<table>
<tr>
<td>Package</td><td>broccoli-imagemin</td>
</tr>
<tr>
<td>Description</td>
<td>Use imagemin in your broccoli build pipeline</td>
</tr>
</table>

More information about the image minifier, imagemin can be found at [https://github.com/kevva/imagemin](https://github.com/kevva/imagemin).
Whereas information about Broccoli which is the building asset pipeline this is for can be found at [https://github.com/joliss/broccoli](https://github.com/joliss/broccoli).

## Usage

Example from the included test Brocfile.js

```javascript
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
```

## Tests

```
> npm install -g broccoli-cli
> npm install -g mocha
> npm test
```
Or
```
> npm install -g broccoli-cli
> npm install -g mocha
> broccoli build temp
> mocha
```
