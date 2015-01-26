var Router = require('./router'),
    routes = require('./routes'),
    router = new Router(routes),
    Tricks = require('./tricks');

window.router = router;

router.start(window.allVideos);

window.tricks = new Tricks(window);
