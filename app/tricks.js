// frontend tricks, as an example of using bootstrapped data for silly not-isomorphic stuff
var _             = require('lodash'),
    TWEEN         = require('tween'),
    THREE         = require('three'),
    hostname      = process.env.HOSTNAME || 'detriot.org', // useless, @todo use envify
    proxyport     = process.env.PROXY_PORT || 7779; // see above

module.exports = Tricks;

function Tricks(window) {
  var is_single_video = (window.location.pathname.substr(0,8) == '/videos/');
  if (webglAvailable() && !is_single_video) {
    this.attach(window);
  }
}

function webglAvailable() {
  try {
    var canvas = document.createElement("canvas");
    return !!
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl") ||
        canvas.getContext("experimental-webgl"));
  } catch(e) {
    return false;
  }
}

Tricks.prototype.applyRoute = function() {
  if (typeof window.someVideos == 'object') {
    var some_video_ids = _.pluck(window.someVideos, 'id');
    _.each(video_cubes, function(cube) {
      if (_.contains(some_video_ids, cube.userData.id)) {
        var tween = new TWEEN.Tween(cube.scale).to({z: 1}, 1700).start();
      } else {
        var tween = new TWEEN.Tween(cube.scale).to({z: 0.47}, 1700).start();
      }
    });
  }
};

Tricks.prototype.attach = function(window, cb) {
  window.THREE = (window.THREE) ? window.THREE : THREE;
  window._ = (window._) ? window._ : _;

  // style hacks for now
  $('body').css({
    overflow: 'hidden'
  });
  $('.row').css({
    maxWidth: '100%'
  });

  var has_been_threed = (typeof window.video_cubes == 'object');

  if (!has_been_threed) {
    var container = document.querySelector('section > div.row');
    var width = container.offsetWidth;
    var height = window.innerHeight - container.offsetTop;

    $('#view-container ul').hide();

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(45, width/height, 0.1, 1000);
    if (webglAvailable()) {
      var renderer = new THREE.WebGLRenderer( { alpha: true, antialias: true } );
    } else {
      var renderer = new THREE.CanvasRenderer( { alpha: true } );
    }
    var projector = new THREE.Projector();

    window.scene = scene;
    window.camera = camera;
    window.renderer = renderer;

    var video_cubes = window.video_cubes = [];

    renderer.setSize(width, height);

    container.appendChild(renderer.domElement);

    // Create light
    var light = new THREE.AmbientLight(0xffffff);
    scene.add(light);

    // Create a single cube with position x,y,z calculated by args i,j,k
    function create_cube(x, y, z, thumb_idx) {
      var geometry = new THREE.BoxGeometry(1.7, 1, 14); // should be in config?
      var img = new Image();
      img.crossOrigin = "anonymous";
      // @todo read host from conf
      img.src = window.allVideos[thumb_idx].thumbnail_large.replace('i.vimeocdn.com', hostname + ':' + proxyport);
      var tex = new THREE.Texture(img);
      img.tex = tex;

      img.onload = function() {
        this.tex.needsUpdate = true;
      };

      var bgcolor = 0xf8f7f5;
      var fgcolor = 0xffffff;

      var bg_opts = {
        color: bgcolor,
        ambient: bgcolor
      };

      var fg_opts = {
        color: fgcolor,
        ambient: fgcolor
      };

      var materials = [
        new THREE.MeshLambertMaterial(bg_opts),
        new THREE.MeshLambertMaterial(bg_opts),
        new THREE.MeshLambertMaterial(fg_opts),
        new THREE.MeshLambertMaterial(bg_opts),
        new THREE.MeshBasicMaterial({color: fgcolor, map: tex}),
        new THREE.MeshLambertMaterial(bg_opts)
      ];
      var material = new THREE.MeshFaceMaterial(materials);
      var cube = new THREE.Mesh(geometry, material);

      cube.userData = {id: window.allVideos[thumb_idx].id};

      cube.position.x = x;
      cube.position.y = y;
      cube.position.z = z;

      return cube;
    }

    // via https://stackoverflow.com/questions/24690731/three-js-3d-models-as-hyperlink
    // & https://stackoverflow.com/a/5417934
    $('section[role="main"]').on('mousedown', 'canvas', function(ev) {
      ev.preventDefault();

      var x, y, thisOffset;

      thisOffset = $(this).offset();
      x = ev.clientX + document.body.scrollLeft + document.documentElement.scrollLeft - Math.floor(thisOffset.left);
      y = ev.clientY + document.body.scrollTop + document.documentElement.scrollTop - Math.floor(thisOffset.top) + 1;

      var vector = new THREE.Vector3();
      vector.set(((x) / this.offsetWidth) * 2 - 1, -((y) / this.offsetHeight) * 2 + 1, 0.5);

      projector.unprojectVector(vector, camera);

      var raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());

      var intersects = raycaster.intersectObjects(video_cubes);

      if (intersects.length > 0) {
        var video_id = intersects[0].object.userData.id;
        //console.log(_.where(allVideos, {id: video_id})[0].title);
        window.location.pathname = '/videos/' + video_id;
      }
    });

    function pos_to_xy(x, y) {
      x = x*2;
      y = y*-1.3;
      return {x:x, y:y};
    }

    function create_cubes(number_of_cubes) {
      var columns = 3;
      var rows = Math.ceil(number_of_cubes/columns);

      var thumbnail_index = 0;

      for (var row=0; row<rows; row++) {
        for (var col=0; col<columns; col++) {
          var coord = [];
          coord = pos_to_xy(col, row);
          if (!window.allVideos[thumbnail_index]) return;
          video_cubes[thumbnail_index] = create_cube(coord.x, coord.y, 0, thumbnail_index);
          scene.add(video_cubes[thumbnail_index]);
          thumbnail_index++;
        }
      }
    }

    camera.position.set(2.5, -3.8, 16);
    camera.rotation.set(-.2, .07, 0);

    var render = function() {
      requestAnimationFrame(render);
      renderer.render(scene, camera);
      TWEEN.update();
    };

    render();

    // mouse scroll biz
    // like http://stackoverflow.com/questions/12636370/three-js-zoom-in-out-complete-tube-geometry
    var mousewheel = function(e) {
      var d = ((typeof e.wheelDelta != "undefined") ? (-e.wheelDelta) : e.detail);
      d = .23 * ((d > 0) ? 1 : -1);

      var cPos = camera.position;
      if (isNaN(cPos.x) || isNaN(cPos.y) || isNaN(cPos.z))
        return;

      var r = cPos.x*cPos.x + cPos.y*cPos.y;
      var sqr = Math.sqrt(r);

      var ny = cPos.y + ((r==0)?0:(d * cPos.y/sqr));

      if (isNaN(ny))
        return;

      cPos.y = ny;
    }

    document.body.addEventListener('mousewheel', mousewheel, false);
    document.body.addEventListener('DOMMouseScroll', mousewheel, false);

    create_cubes(window.allVideos.length);
  }

  this.applyRoute();

  if (typeof cb == 'function') {
    cb();
  }

};

