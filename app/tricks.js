// frontend tricks, as an example of using bootstrapped data for silly not-isomorphic stuff

module.exports = Tricks;

function Tricks(window) {
  this.attach(window);
}

Tricks.prototype.attach = function(window) {
  console.log('wow');
  console.log(window.bootstrappedData[0].thumbnail_large);
};
