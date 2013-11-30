var express   = require('express'),
    _         = require('lodash/dist/lodash.underscore'),
    httpProxy = require('http-proxy'),
    app       = express(),
    videoId   = 0,
    videos    = [{
      id: ++videoId,
      title: "How to build an isomorphic app.",
      author: "spike",
      body: "It's really not that hard!",
      created_at: "2013-11-05T13:56:15.034Z",
    }, {
      id: ++videoId,
      title: "Why JavaScript is eating the world.",
      author: "spike",
      body: "It's the lingua franca of the web.",
      created_at: "2013-11-04T17:23:01.329Z",
    }];

module.exports = app;

app.use(express.bodyParser());

app.get('/videos.json', function(req, res) {
  res.send(videos);
});

app.get('/vidoes/:id.json', function(req, res) {
  var id    = parseInt(req.params.id, 10),
      video = _.find(videos, function(v) { return v.id === id });

  if (video) {
    res.send(video);
  } else {
    res.send(404, {error: 'Video not found.'});
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

