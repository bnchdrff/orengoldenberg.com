var Router = require('./router'),
    routes = require('./routes'),
    router = new Router(routes),
    Tricks = require('./tricks');

window.router = router;

router.start(window.allVideos);

var tricks = new Tricks(window);
