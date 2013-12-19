var express   = require('express'),
    _         = require('lodash/dist/lodash.underscore'),
    httpProxy = require('http-proxy'),
    app       = express(),
    videos    = (process.env.NODE_ENV == 'production') ? require('../assets/videos.json') : require('../assets/videos.sample.json'),
    Pages     = require('./pages'),
    pages     = new Pages();

module.exports = app;

app.use(express.bodyParser());

app.get('/videos.json', function(req, res) {
  res.send(videos);
});

app.get('/videos/:id.json', function(req, res) {
  var id    = parseInt(req.params.id, 10),
      video = _.find(videos, function(v) { return v.id === id });

  if (video) {
    res.send(video);
  } else {
    res.send(404, {error: 'Video not found.'});
  }
});

app.get('/pages.json', function(req, res) {
  res.send(pages.listPages());
});

app.get('/pages/:name.json', function(req, res) {
  var page = pages.getPage(req.params.name);

  if (page) {
    res.send(page);
  } else {
    res.send(404, {error:'Page not found.'});
  }
});

var proxy = new httpProxy.RoutingProxy();

app.proxyMiddleware = function(apiPort) {
  return function(req, res, next) {
    proxy.proxyRequest(req, res, {
      host: 'localhost',
      port: apiPort
    });
  };
};

