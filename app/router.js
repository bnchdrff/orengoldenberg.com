var director       = require('director'),
    isServer       = typeof window === 'undefined',
    _              = require('lodash/dist/lodash.underscore'),
    Handlebars     = isServer ? require('handlebars') : require('hbsfy/runtime'),
    viewsDir       = (isServer ? __dirname : 'app') + '/views',
    DirectorRouter = isServer ? director.http.Router : director.Router,
    DataHelper     = require('../lib/data-helper'),
    Videos         = new DataHelper(),
    videos         = Videos.videos(),
    tags           = Videos.all_tags(videos),
    friendlyCats   = require('../config.json').friendlyCats,
    firstRender    = true;

require('./helpers')(Handlebars).register();

module.exports = Router;

function Router(routesFn) {
  if (routesFn == null) {
    throw new Error('Must provide routes.');
  }
  this.directorRouter = new DirectorRouter(this.parseRoutes(routesFn));
}

Router.prototype.parseRoutes = function(routesFn) {
  var routes = {};

  routesFn(function(pattern, handler) {
    if (isServer) {
      routes[pattern] = {
        get: this.getRouteHandler(handler)
      };
    } else {
      routes[pattern] = this.getRouteHandler(handler);
    }
  }.bind(this));

  return routes;
};

Router.prototype.getRouteHandler = function(handler) {
  var router = this;

  return function() {
    if (!isServer && firstRender) {
      firstRender = false;
      return;
    }

    var routeContext = this,
        params       = Array.prototype.slice.call(arguments),
        handleErr    = router.handleErr.bind(routeContext);

    function handleRoute() {
      handler.apply(null, params.concat(function routeHandler(err, viewPath, data) {
        if (err) {
          return handleErr(err);
        }

        data = data || {};
        data.isServer = isServer;

        router.renderView(viewPath, data, function(err, html) {
          if (err) {
            return handleErr(err);
          }

          if (isServer) {
            router.handleServerRoute(viewPath, html, routeContext.req, routeContext.res);
          } else {
            router.handleClientRoute(viewPath, html);
          }
        });
      }));
    }

    try {
      handleRoute();
    } catch (err) {
      handleErr(err);
    }
  };
};

Router.prototype.handleErr = function(err) {
  console.error(err.message + err.stack);

  // this.next exists on server
  if (this.next) {
    this.next(err);
  } else {
    console.error(err.message);
  }
};

Router.prototype.renderView = function(viewPath, data, callback) {
  try {
    var template = require(viewsDir + '/' + viewPath + '.hbs'),
        html     = template(data);
    callback(null, html);
  } catch(err) {
    callback(err);
  }
};

Router.prototype.wrapWithLayout = function(locals, callback) {
  try {
    var layout     = require(viewsDir + '/layout'),
        layoutHtml = layout(locals);
    callback(null, layoutHtml);
  } catch(err) {
    callback(err);
  }
};

Router.prototype.handleClientRoute = function(viewPath, html) {
  if (viewPath != 'video') {
    window.tricks.attach(window, function() {
      if (window.video_cubes) {
        var is_a_single_video = viewPath.match('videos\/');

        if (!is_a_single_video) {
          document.getElementById('view-container').innerHTML = '';
          document.querySelector('canvas').style.display = 'block';
        } else {
          document.getElementById('view-container').innerHTML = html;
          document.querySelector('canvas').style.display = 'hidden';
        }
      } else {
        document.getElementById('view-container').innerHTML = html;
      }
    });
  }
};

Router.prototype.handleServerRoute = function(viewPath, html, req, res) {
  var allVideos = videos;

  var locals = {
    body: html,
    tags: tags,
    friendlyCats: friendlyCats,
    allVideos: JSON.stringify(allVideos),
  };

  this.wrapWithLayout(locals, function(err, layoutHtml) {
    res.send(layoutHtml);
  });
};

// express middleware route mounter
Router.prototype.middleware = function() {
  var directorRouter = this.directorRouter;

  return function middleware(req, res, next) {
    directorRouter.attach(function() {
      this.next = next;
    });

    directorRouter.dispatch(req, res, function(err) {
      if (err && err.status === 404) {
        next();
      }
    });
  };
};

// client-side
Router.prototype.start = function(allVideos) {
  this.allVideos = allVideos;

  this.directorRouter.configure({
    html5history: true
  });

  document.addEventListener('click', function(e) {
    var el       = e.target,
        eltest   = el,
        passThru = false;

    while (eltest.parentNode && el.tagName !== 'A') {
      eltest = eltest.parentNode;
      if (eltest.tagName === 'A') {
        el = eltest;
        passThru = (el && el.dataset && el.dataset.passThru == 'true') ? true : false;
      }
    }

    var is_our_link = (el && el.nodeName === 'A' && (passThru == false));
    var isnt_our_link = (el && el.nodeName === 'A' && (passThru == false));

    if (is_our_link) {
      if (document.body.className.indexOf('active') > -1
          && el.parentElement.className.indexOf('vid-thumbs') > -1) {
        // disable other clicks and let our jquery catch em
        e.preventDefault();
      } else {
        this.directorRouter.setRoute(el.attributes.href.value);
        e.preventDefault();
      }
    }
    if (isnt_our_link) {
      e.preventDefault();
    }
  }.bind(this), true);

  this.directorRouter.init();
};

Router.prototype.setRoute = function(route) {
  this.directorRouter.setRoute(route);
};
