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
      return _.find(pictures.sizes, { height: 360 }).link;
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
