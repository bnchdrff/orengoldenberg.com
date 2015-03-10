var blanket = require('blanket')({
  pattern: function (filename) {
    return !/node_modules/.test(filename);
  }
});

var should = require('should');

var helpers = require('../app/helpers.js')().helpers;

var _ = require('lodash');

describe('helpers', function() {
  describe('#jsonstringify()', function() {
    it('should stringify any input', function() {
      helpers.jsonstringify({1:'one',2:'two'}).should.equal('{"1":"one","2":"two"}');
    });
  });
  describe('#thumbnail_large()', function() {
    it('should generate a large thumbnail URI for a vimeo video object without the large thumbnail already in existence', function() {
      var dh = require('../lib/data-helper'),
          DH = new dh();

      helpers.thumbnail_large(DH.videos[1].pictures).should.match(/.*640x360\.jpg$/);
    });
    it('should output a large thumbnail URI for a vimeo video object with the size we want already in existence', function() {
      var dh = require('../lib/data-helper'),
          DH = new dh();

      helpers.thumbnail_large(DH.videos[0].pictures).should.match(/.*640x360\.jpg$/);
    });
  });
});
