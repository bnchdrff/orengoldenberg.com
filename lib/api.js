var express   = require('express'),
    _         = require('lodash/dist/lodash.underscore'),
    httpProxy = require('http-proxy'),
    app       = express(),
    DataHelper= require('../lib/data-helper'),
    Videos    = new DataHelper(),
    Pages     = require('./pages'),
    pages     = new Pages();

module.exports = app;

app.use(express.bodyParser());

app.get('/videos.json', function(req, res) {
  res.send(_.sortBy(Videos.getVideos(), function(video) {
    if (typeof video.tags['all'] != 'undefined') {
      return video.tags['all'].weight;
    } else {
      return 0;
    }
  }));
});

app.get('/videos/:id.json', function(req, res) {
  var id    = parseInt(req.params.id, 10),
      video = _.find(Videos.getVideos(), function(v) { return v.id === id });

  if (video) {
    res.send(video);
  } else {
    res.send(404, {error: 'Video not found.'});
  }
});

app.get('/tags.json', function(req, res) {
  var tags = _.reduce(Videos.getVideos(), function(tags, video) {
    return _.union(Videos.tags_from_video(video), tags);
  });

  res.send(tags);
});

app.get('/videos-tagged/:tag.json', function(req, res) {
  var tag = req.params.tag;

  var videos_with_tag = _.filter(Videos.getVideos(), function(video) {
    return _.contains(Videos.tags_from_video(video), Videos.escape_tag(tag));
  });

  res.send(_.sortBy(videos_with_tag, function(video) {
    return video.tags[tag].weight;
  }));
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

