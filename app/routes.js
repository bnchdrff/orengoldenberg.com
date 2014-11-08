var apiClient = require('./api_client'),
    isServer  = typeof window === 'undefined';


module.exports = function(match) {
  match('/', function(callback) {
    console.log('index hit');
    callback(null, 'index');
  });

  match('/videos', function(callback) {
    console.log('videos hit');
    apiClient.get('/videos.json', function(err, res) {
      if (err) {
        return callback(err);
      }
      var videos = res.body;
      callback(null, 'videos', {videos: videos});
    });
  });

  match('/videos/:id', function(id, callback) {
    console.log('videos/' + id + ' hit');
    apiClient.get('/videos/' + id + '.json', function(err, res) {
      if (err) {
        return callback(err);
      }
      var video = res.body;
      callback(null, 'video', video);
    });
  });

  match('/videos-tagged/(.*)', function(tag, callback) {
    console.log('videos-tagged/' + tag + ' hit');
    apiClient.get('/videos-tagged/' + tag + '.json', function(err, res) {
      if (err) {
        return callback(err);
      }
      var videos = res.body;
      if (!isServer) {
        window.someVideos = videos;
      }
      callback(null, 'videos-tagged', {videos: videos});
    });
  });

  match('/pages/:page', function(page, callback) {
    console.log('pages/' + page + ' hit');
    apiClient.get('/pages/' + page + '.json', function(err, res) {
      if (err) {
        return callback(err);
      }
      console.log('res'); console.log(res.body.meta);
      var page = res.body;
      callback(null, 'page', page);
    });
  });

  match('/video-thumb/:id', function(id, callback) {
    console.log('video-thumb/' + id + ' hit');
  });

};
