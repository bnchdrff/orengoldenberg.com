var express   = require('express'),
    _         = require('lodash/dist/lodash.underscore'),
    httpProxy = require('http-proxy'),
    app       = express(),
    config    = require('../config'),
    api_key   = require('../secrets').api.secret,
    DataHelper= require('../lib/data-helper'),
    helpers   = require('../app/helpers')().helpers,
    Videos    = new DataHelper(),
    Pages     = require('./pages'),
    pages     = new Pages();

module.exports = app;

app.use(express.bodyParser());

app.get('/videos.json', function(req, res) {
  var videos_with_all_tag = _.filter(Videos.getVideos(), function(video) {
    return _.contains(Videos.tags_from_video(video), 'all');
  });

  res.send(_.sortBy(videos_with_all_tag, function(video) {
    if (typeof video.weighted_tags['all'] != 'undefined') {
      return video.weighted_tags['all'];
    } else {
      return 0;
    }
  }));
});

app.get('/videos/:id.json', function(req, res) {
  var id    = parseInt(req.params.id, 10),
      video = _.find(Videos.getVideos(), function(v) { return helpers.id_from_uri(v.uri) === id });

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

  tags = _.intersection(config.chosen_tags, tags);

  res.send(tags);
});

app.get('/videos-tagged/:tag.json', function(req, res) {
  var tag = req.params.tag;

  var videos_with_tag = _.filter(Videos.getVideos(), function(video) {
    return _.contains(Videos.tags_from_video(video), Videos.escape_tag(tag));
  });

  res.send(_.sortBy(videos_with_tag, function(video) {
    return video.weighted_tags[tag];
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

app.get('/getvids' + api_key, function(req, res) {
  Videos.loadVideosFromVimeo();
  res.send({ok:'yup'});
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

