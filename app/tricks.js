// frontend tricks, as an example of using bootstrapped data for silly not-isomorphic stuff
var _             = require('lodash'),
    THREE         = require('three');

module.exports = Tricks;

function Tricks(window) {
  this.attach(window);
  window.THREE = THREE;
}

Tricks.prototype.attach = function(window) {
  var container = document.querySelector('section > div.row');
  var width = container.offsetWidth;
  var height = window.innerHeight - container.offsetTop;

  $('#view-container ul').hide();

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(45, width/height, 0.1, 1000);
  var renderer = new THREE.WebGLRenderer( { alpha: true } );
  var projector = new THREE.Projector();

  window.scene = scene;
  window.camera = camera;
  window.renderer = renderer;

  var video_cubes = window.video_cubes = [];

  renderer.setSize(width, height);

  container.appendChild(renderer.domElement);

  // Create light
  var directionalLight = new THREE.DirectionalLight(0xffffff, .5);
  directionalLight.position.set(.5, 1, .5);
  scene.add(directionalLight);

  // Defines cube size and material type/color/texture
  var geometry = new THREE.BoxGeometry(1.7, 1, 14);


  // function create_grid(row_spacing, column_spacing) {
  //
  // }

  var x, y, z;
  x = y = z = 0;

  // Create a single cube with position x,y,z calculated by args i,j,k
  function create_cube(x, y, z, thumb_idx) {
    var img = new Image();
    img.crossOrigin = "anonymous";
    img.src = window.allVideos[thumb_idx].thumbnail_large.replace('i.vimeocdn.com', '127.0.0.1:7779');
    //img.src = window.allVideos[thumb_idx].thumbnail_large;
    var tex = new THREE.Texture(img);
    img.tex = tex;

    img.onload = function() {
      this.tex.needsUpdate = true;
    };

    var materials = [
      new THREE.MeshLambertMaterial({color:0xFFFFFF}),
      new THREE.MeshLambertMaterial({color:0xFFFFFF}),
      new THREE.MeshLambertMaterial({color:0xFFFFFF}),
      new THREE.MeshLambertMaterial({color:0xFFFFFF}),
      new THREE.MeshBasicMaterial({color:0xFFFFFF, map:tex}),
      new THREE.MeshLambertMaterial({color:0xFFFFFF})
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
  $('section[role="main"]').on('mousedown', 'canvas', function(ev) {
    ev.preventDefault();
    var vector = new THREE.Vector3((ev.clientX / window.innerWidth) * 2 -
        1, -(ev.clientY / window.innerHeight) * 2 + 1, 0.5);
    projector.unprojectVector(vector, camera);
    var raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position)
        .normalize());
    var intersects = raycaster.intersectObjects(video_cubes);
    debugger;
    if (intersects.length > 0) {
      //window.location.pathname = '/videos/' + intersects[0].object.userData.id;
    }
  });

  function pos_to_xy(x, y) {
    x = x*2;
    y = y*1.3;
    return {x:x, y:y};
  }

  // Add a bunch of cubes to a scene in a grid
  function create_cubes(number_of_cubes) {
    // @todo create rows and columns vars to hold cubes in a grid
    var rows = 4;
    var columns = 3;

    // @todo do math to make sure number_of_cubes is a grid multiple, if it isn't a good number return false
    var thumbnail_index = 0;

    for (var x=0; x<columns; x++) {
      for (var y=0; y<rows; y++) {
        var coord = [];
        coord = pos_to_xy(x, y);
        video_cubes[thumbnail_index] = create_cube(coord.x, coord.y, z, thumbnail_index);
        scene.add(video_cubes[thumbnail_index]);
        thumbnail_index++;
      }
    }

    return true;
  }

  // make sure to fix function to properly display correct # of cubes
  create_cubes(3);

  // CAMERA POSITION
  camera.position.set(7.5, 1.8, 12.5);
  camera.rotation.x = 0.05152; // change to equal -.05152 - express with X*(math.pi/180)
  camera.rotation.y = 0.6655; // change to equal 0.6655 - express with X*(math.pi/180)
  camera.rotation.z = 0; // change to equal 0.3363 - express with X*(math.pi/180)
window.camera = camera;
  // animation

  var render = function() {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
  };

  render();
};

