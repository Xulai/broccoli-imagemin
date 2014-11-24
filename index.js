'use strict';
var Filter = require('broccoli-filter');
var debug = require('debug')('imageminFilter');
var prettyBytes = require('pretty-bytes');
var mode = require('stat-mode');
var fs = require('fs');
var Promise = require('rsvp').Promise;
var path = require('path');

function imageminFilter(inputTree, optns) {
	debug('Creating imageminFilter instance');

  if(!(this instanceof imageminFilter)) {
    return new imageminFilter(inputTree, optns);
  }

	this.options = optns || {
		interlaced: true,
		optimizationLevel: 3,
		progressive: true,
		lossyPNG: false,
		pngquant: {}
	};
	this.ImageMin = require('imagemin');
  this.inputTree = inputTree;
}

imageminFilter.prototype = Object.create(Filter.prototype);
imageminFilter.prototype.constructor = imageminFilter;

imageminFilter.prototype.extensions = ['png', 'jpg', 'jpeg', 'gif', 'svg'];

imageminFilter.prototype.processString = function(imageStr, srcDir, file) {
  var fileNamePath = path.join(srcDir, file);
  debug('Processing Buffer ' + fileNamePath);

	var ImageMin = this.ImageMin;
  var extenson = this.targetExtension = file.split('.').pop().toLowerCase();
	var stats = fs.statSync(fileNamePath);
	var options = this.options;
  var imagemin = new ImageMin();

	imagemin.use(ImageMin.jpegtran({progressive: options.progressive}))
					.use(ImageMin.gifsicle({interlaced: options.interlaced}))
					.use(ImageMin.svgo({plugins: options.svgoPlugins || []}));

	if(options.lossyPNG) {
		imagemin.use(ImageMin.pngquant(options.pngquant));
	}
	else {
		imagemin.use(ImageMin.optipng({optimizationLevel: options.optimizationLevel}));
	}

	if(options.use) {
		options.use.forEach(imagemin.use.bind(imagemin));
	}

  return new Promise(function(resolve, reject) {

    debug('Optimizing image ' + fileNamePath);
		imagemin.src(imageStr);
    imagemin.run(function (err, filesOpti) {
      if (err) {
        debug(err);
        return reject(err);
      }

      var origSize = fs.statSync(fileNamePath).size;
      var diffSize = origSize - filesOpti[0].contents.length;

      if (filesOpti[0].contents.length < imageStr.length) {
        imageStr = filesOpti[0].contents;
      }

      if(diffSize < 10) {
        debug('Already optimized');
      } else {
        debug('Saved ' + prettyBytes(diffSize) + ' - ' + (diffSize / origSize * 100).toFixed() + '%');
      }

      return resolve(imageStr);
    });
  });
};

imageminFilter.prototype.processFile = function (srcDir, destDir, relativePath) {
  var self = this;
  var string = fs.readFileSync(path.join(srcDir, relativePath));
  return self.processString(string, srcDir, relativePath)
    .then(function (outputString) {
      var outputPath = self.getDestFilePath(relativePath);
      fs.writeFileSync(path.join(destDir, outputPath), outputString);
    });
};

module.exports = imageminFilter;