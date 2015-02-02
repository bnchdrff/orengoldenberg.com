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
        var large = _.find(pictures.sizes, { height: 360 });
        if (typeof large == 'object' && typeof large.link == 'string') {
          return large.link;
        } else {
          console.error('no link');
          console.error(pictures);
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
