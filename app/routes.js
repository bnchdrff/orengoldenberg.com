var apiClient = require('./api_client'),
    isServer  = typeof window === 'undefined';


module.exports = function(match) {
  match('/', function(callback) {
    apiClient.get('/videos.json', function(err, res) {
      if (err) {
        return callback(err);
      }
      var videos = res.body;
      callback(null, 'videos', {videos: videos});
    });
  });

  match('/videos', function(callback) {
    apiClient.get('/videos.json', function(err, res) {
      if (err) {
        return callback(err);
      }
      var videos = res.body;
      if (!isServer) {
        window.someVideos = videos;
      }
      callback(null, 'videos', {videos: videos});
    });
  });

  match('/videos/:id', function(id, callback) {
    apiClient.get('/videos/' + id + '.json', function(err, res) {
      if (err || res.error) {
        return callback(err || res.error);
      }
      var video = res.body;
      callback(null, 'video', video);
    });
  });

  match('/videos-tagged/(.*)', function(tag, callback) {
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
    apiClient.get('/pages/' + page + '.json', function(err, res) {
      if (err) {
        return callback(err);
      }
      var page = res.body;
      callback(null, 'page', page);
    });
  });
};
