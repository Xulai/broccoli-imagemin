var should = require('should');
var fs = require('fs');
var path = require('path');
var rimraf = require('rimraf');

var cleanupOutput = true;
var rootInputDir = 'test/';
var inputDir = rootInputDir + 'images/';
var outputDir = 'temp/';

after(function() {
  if(cleanupOutput){
    rimraf.sync(outputDir);
  }
  rimraf.sync('tmp');
});

describe('broccoli-imagemin', function() {
  describe('imagemin()', function() {
    var imagefiles = fs.readdirSync(inputDir);
    var fileName;
    var fullInputPath;
		var fullOutputPath;
		var inputImageStat;
		var outputImageStat;

    for (var image in imagefiles) {
      fileName = imagefiles[image];
			fullInputPath = inputDir + fileName;
      fullOutputPath = outputDir + fileName;
			inputImageStat = fs.statSync(fullInputPath);
			outputImageStat = fs.statSync(fullOutputPath);

      if(outputImageStat.isDirectory()) {
        continue;
      }

			describe(fullOutputPath, function() {
      	it('should have a smaller file size than ' + fullInputPath, function() {
        	outputImageStat.size.should.be.below(inputImageStat.size);
      	});
				it('should be bigger than 0', function() {
        	outputImageStat.size.should.be.above(0);
      	});
			});
    }
  });
});