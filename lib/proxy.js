var express   = require('express'),
    _         = require('lodash/dist/lodash.underscore'),
    httpProxy = require('http-proxy'),
    DataHelper= require('../lib/data-helper'),
    Videos    = new DataHelper(),
    videos    = Videos.videos(),
    app       = express();

module.exports = app;

var urls = _.map(_.pluck(videos, 'thumbnail_large'), function(url) {
  if (process.env.NODE_ENV == 'production') {
    return url.match(/.video.*/)[0];
  } else {
    return true;
  }
});

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
  if (_.contains(urls, req.url)) {
    return proxy.proxyRequest(req, res, proxyOptions);
  } else {
    res.send(403);
  }
});
