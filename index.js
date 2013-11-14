var winston = require('winston'),
    express = require('express'),
    app     = express(),
    port    = process.env.PORT || 7777,
    apiPort = process.env.API_PORT || 7778,
    api     = require('./lib/api'),
    routes  = require('./app/routes'),
    Router  = require('./app/router'),
    router  = new Router(routes);

app.use(express.static(__dirname + '/public'));

app.use(router.middleware());

app.use('/api', api.proxyMiddleware(apiPort));

app.listen(port);

api.listen(apiPort);

winston.log('info', 'cool i am server', {apiPort: apiPort, port: port});
