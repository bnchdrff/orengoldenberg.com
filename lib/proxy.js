var express   = require('express'),
    _         = require('lodash/dist/lodash.underscore'),
    httpProxy = require('http-proxy'),
    apiClient = require ('../app/api_client'),
    app       = express();

module.exports = app;

var proxy = new httpProxy.RoutingProxy();

var proxyOptions = {
  host: 'i.vimeocdn.com',
  port: 80,
  changeOrigin: true
};

var allowCrossDomain = function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With, Accept, Origin, Referer, User-Agent, Content-Type, Authorization, X-Mindflash-SessionID');

  // intercept OPTIONS method
  if ('OPTIONS' == req.method) {
    res.send(200);
  }
  else {
    next();
  }
};

app.configure(function() {
  app.use(allowCrossDomain);
});

app.all('/*',  function (req, res) {
  var req_vimeo_picture_id = req.url.match(/(\d+)_\d+x\d+\.jpg/);

  apiClient.get('/videos.json', function(videos) {
    var vimeo_picture_ids = _.map(videos.body, function(v) {
      return v.pictures.uri.replace(/\/videos\/\d+\/pictures\//, '');
    });

    if (req_vimeo_picture_id && _.contains(vimeo_picture_ids, req_vimeo_picture_id[1])) {
      return proxy.proxyRequest(req, res, proxyOptions);
    } else {
      res.send(403);
    }
  });
});
