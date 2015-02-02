var _ = require('lodash');

module.exports = function(Handlebars) {
  var helpers = {
    log: function(obj) {
      console.log(obj);
    },
    decode: function(uricomponent) {
      return decodeURIComponent(uricomponent);
    },
    jsonstringify: function(obj) {
      return JSON.stringify(obj);
    },
    thumbnail_large: function(pictures) {
      if (typeof pictures == 'object' && pictures !== null && typeof pictures.sizes == 'object') {
        var vimeo_src = _.find(pictures.sizes, { height: 360 });
        if (vimeo_src) {
          return vimeo_src.link;
        } else {
          // make our own thumb url... :/
          return pictures.sizes[0].link.replace(/_\d+x\d+\.jpg$/, '_640x360.jpg');
        }
      } else {
        console.error('no sizes');
        console.error(pictures);
      }
    },
    id_from_uri: function(uri) {
      return parseInt(uri.replace('/videos/', ''), 10);
    }
  };
  function register() {
    for (var key in helpers) {
      if (helpers.hasOwnProperty(key)) {
        Handlebars.registerHelper(key, helpers[key]);
      }
    }
  }
  return {
    helpers: helpers,
    register: register
  };
};
