'use strict';
var Filter = require('broccoli-filter');
var debug = require('debug')('imageminFilter');
var prettyBytes = require('pretty-bytes');
var mode = require('stat-mode');
var fs = require('fs');
var Promise = require('rsvp').Promise

function imageminFilter(inputTree, optns) {
	debug('Creating imageminFilter instance');

  if(!(this instanceof imageminFilter)) {
    return new imageminFilter(inputTree, optns);
  }

	this.options = optns || {
		interlaced: true,
		optimizationLevel: 3,
		progressive: true,
		lossyPNG: false
	};

	var options = this.options;
	var ImageMin = this.ImageMin = require('imagemin');
  var imagemin = this.imagemin = new ImageMin();

	imagemin.use(ImageMin.jpegtran(options.progressive))
					.use(ImageMin.gifsicle(options.interlaced))
					.use(ImageMin.svgo());

	if(options.lossyPNG) {
		imagemin.use(ImageMin.pngquant());
	}
	else {
		imagemin.use(ImageMin.optipng(options.optimizationLevel));
	}

	if(options.use) {
		options.use.forEach(imagemin.use.bind(imagemin));
	}

  this.inputTree = inputTree;
}

imageminFilter.prototype = Object.create(Filter.prototype);
imageminFilter.prototype.constructor = imageminFilter;

imageminFilter.prototype.extensions = ['png', 'jpg', 'jpeg', 'gif', 'svg'];

imageminFilter.prototype.processString = function(str, file) {
  var fileNamePath = './' + this.inputTree + '/' + file;
  debug('Processing Buffer ' + fileNamePath);

  var extenson = this.targetExtension = file.split('.').pop().toLowerCase();
  var imagemin = this.imagemin;
  var tempfile = {};
  var stats = fs.statSync(fileNamePath);

  return new Promise(function(resolve, reject) {
    tempfile.contents = str;
    tempfile.mode = mode(stats).toOctal();

    debug('Optimizing image ' + fileNamePath);
    imagemin.run(tempfile, function (err, fileOpti) {
      if (err) {
        debug(err);
        return reject(err);
      }

      var origSize = fs.statSync(fileNamePath).size;
      var diffSize = origSize - fileOpti.contents.length;

      if (!(fileOpti.contents.length >= str.length)) {
        str = fileOpti.contents;
      }

      if(diffSize < 10) {
        debug('Already optimized');
      } else {
        debug('Saved ' + prettyBytes(diffSize) + ' - ' + (diffSize / origSize * 100).toFixed() + '%');
      }

      return resolve(str);
    });
  });
};

imageminFilter.prototype.processFile = function (srcDir, destDir, relativePath) {
  var self = this
  var string = fs.readFileSync(srcDir + '/' + relativePath);
  return self.processString(string, relativePath)
    .then(function (outputString) {
      var outputPath = self.getDestFilePath(relativePath)
      fs.writeFileSync(destDir + '/' + outputPath, outputString)
    });
};

module.exports = imageminFilter;