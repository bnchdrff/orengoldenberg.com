var Router = require('./router'),
    routes = require('./routes'),
    router = new Router(routes);

router.start();
