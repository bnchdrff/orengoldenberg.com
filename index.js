var express = require('express'),
    app     = express(),
    port    = process.env.PORT || 7777,
    apiPort = process.env.API_PORT || 7778,
    proxyPort = process.env.PROXY_PORT || 7779,
    api     = require('./lib/api'),
    proxy = require('./lib/proxy'),
    routes  = require('./app/routes'),
    Router  = require('./app/router'),
    router  = new Router(routes);

app.use(express.compress());

app.use(express.static(__dirname + '/public'));

app.use('/bower', express.static(__dirname + '/bower_components'));
app.use('/zeroclipboard', express.static(__dirname + '/node_modules/zeroclipboard/dist'));
app.use('/fonts', express.static(__dirname + '/assets/fonts'));

// for sourcemaps
if (process.env.NODE_ENV != 'production') {
  app.use('/assets', express.static(__dirname + '/assets'));
}

// favicon
app.use('/favicon.ico', function(req, res) { res.sendfile(__dirname + '/assets/favicon.ico'); });

app.use(router.middleware());

app.use('/api', api.proxyMiddleware(apiPort));

app.listen(port);

api.listen(apiPort);

proxy.listen(proxyPort);

console.log('cool i am server: ' + 'apiPort: ' + apiPort + ', proxyPort: ' + proxyPort + ', port: ' + port);
