var blanket = require('blanket')({
  pattern: function (filename) {
    return !/node_modules/.test(filename);
  }
});

var should = require('should');

var helpers = require('../app/helpers.js')().helpers;

describe('helpers', function() {
  describe('#jsonstringify()', function() {
    it('should stringify any input', function() {
      helpers.jsonstringify({1:'one',2:'two'}).should.equal('{"1":"one","2":"two"}');
    });
  });
  describe('#thumbnail_large()', function() {
    it('should output a large thumbnail for any vimeo video object', function() {
      var dh = require('../lib/data-helper'),
          DH = new dh(),
          rand_vid = Math.floor(Math.random() * DH.videos.length);
      helpers.thumbnail_large(DH.videos[rand_vid].pictures).should.match(/.*640x360\.jpg$/);
    });
  });
});
