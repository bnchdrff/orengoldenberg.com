var Router = require('./router'),
    routes = require('./routes'),
    router = new Router(routes);
    Tricks = require('./tricks'),
    tricks = new Tricks(window);

window.router = router;

router.start(window.allVideos);
