module.exports = function(Handlebars) {
  var helpers = {
    log: function(obj) {
      console.log(obj);
    },
    decode: function(uricomponent) {
      return decodeURIComponent(uricomponent);
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
