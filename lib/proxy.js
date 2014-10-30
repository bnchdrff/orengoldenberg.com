var express   = require('express'),
    httpProxy = require('http-proxy'),
    app       = express();

module.exports = app;

var proxy = new httpProxy.RoutingProxy();

var proxyOptions = {
  host: 'i.vimeocdn.com',
  port: 80,
  changeOrigin: true
};

var allowCrossDomain = function(req, res, next) {
    console.log('allowingCrossDomain');
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
    return proxy.proxyRequest(req, res, proxyOptions);
});
