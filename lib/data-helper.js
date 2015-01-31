var _      = require('lodash'),
    config = require('../config.json'),
    Vimeo = require('vimeo-api').Vimeo,
    creds = require('../secrets.json').vimeo,
    vimeo = new Vimeo(creds.client_id, creds.client_secret, creds.access_token);

function DataHelper() {

  this.init = function() {
    var _self = this;
    var videos = [];

    if (true || process.env.NODE_ENV == 'production') {
      _.bindAll(this);
      this.recursive_grab_handler(null, null, this.recursive_grab_handler);
    } else {
      videos = require('../assets/videos.sample.json');
      _.each(videos, function(video) {
        video.thumbnail_large = '/assets/640x360.jpg';
      });
      this.done(videos);
    }
  };

  this.init();
}

module.exports = DataHelper;

DataHelper.prototype.done = function(videos) {
  videos = format_tags(videos);
  this.videos = videos;
};

DataHelper.prototype.refresh = function() {
  this.init();
};

DataHelper.prototype.getVideos = function() {
  return this.videos;
};

/**
 * Request form vimeo api & act on /me/videos response
 *
 * @param api_path
 *   Vimeo api path to fetch
 * @param vieos
 *   Array of video objects on which to append result
 * @param fn
 *   Function to call for next page request (usu. itself)
 * @param done
 *   Function to call when done
 */
DataHelper.prototype.recursive_grab_handler = function(api_path, videos, fn) {
  // first run
  api_path = (!api_path) ? '/users/5904516/videos?page=1&per_page=50' : api_path;
  videos = (!videos) ? [] : videos;
  var _self = this;

  vimeo.request({path: api_path}, function(err, body, status_code, headers) {

    if (err) {
      console.error('vimeo api error', err);
      return null;
    } else {
      videos = [].concat(videos, body.data);
      if (body.paging.next) {
        fn(body.paging.next, videos, fn);
      } else {
        _self.done(videos);
      }
    }
  });
};

/**
 * @param vimeo tag
 * @return escaped tag
 */
DataHelper.prototype.escape_tag = function(tag) {
  return encodeURIComponent(tag.toLowerCase());
};

/**
 * @param vimeo video.tags string
 * @return array of URL-friendly tags
 */
DataHelper.prototype.tags_from_video = function(video) {
  var helper = this;
  var tags = [];
  _.forOwn(video.tags, function(weight, tag) {
    tags.push(helper.escape_tag(tag));
  });
  return tags;
};

DataHelper.prototype.all_tags = function(videos) {
  var helper = this;
  return _.intersection(
    _.reduce(videos, function(tags, video) {
      return _.union(helper.tags_from_video(video), tags);
    }),
    config.chosen_tags
  );
};

/* Preprocessing */

/**
 * Add weights from 'tagnameNN' where NN is weight.
 *
 * @param videos
 *   Vimeo videos array
 * @return videos
 *   Vimeo videos with weights
 */
function format_tags(videos) {
  _.each(videos, function(video) {
    var tags = {};
    _.each(video.tags.split(', '), function(tag) {
      if (tag.length > 0) {
        var re = /-?\d+$/;
        var res = tag.match(re);
        if (res) {
          var name = res.input.substr(0, res.index).toLowerCase();
          var weight = (parseInt(res[0])) ? parseInt(res[0]) : 0;
          this[name] = weight;
        } else {
          this[name] = 0;
        }
      }
    }, tags);
    video.tags = tags;
  });
  return videos;
}

