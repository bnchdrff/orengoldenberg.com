var FlatPages = require('node-flatpages'),
    flatpages = new FlatPages({
      folder: './assets/pages',
      extension: 'md'
    });


module.exports = Pages;

function Pages() {
}

Pages.prototype.getPage = function(path) {
  console.log('getting page: ' + path);
  return flatpages.get(path);
}
