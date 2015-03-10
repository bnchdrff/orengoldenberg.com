var _      = require('lodash'),
    path = require('path'),
    jf = require('jsonfile'),
    config = require('../config.json'),
    Vimeo = require('vimeo-api').Vimeo,
    creds = require('../secrets.json').vimeo,
    vimeo = new Vimeo(creds.client_id, creds.client_secret, creds.access_token);

function DataHelper() {
  this.loadVideos(true);
}

module.exports = DataHelper;

DataHelper.prototype.formatVideos = function() {
  this.videos = _.filter(this.videos, function(video) {
    return (video.status == 'available' &&
            video.privacy.view == 'anybody');
  });

  this.videos = format_tags(this.videos);
};

DataHelper.prototype.setVideos = function(videos) {
  _.bindAll(this);
  this.videos = videos;
  if (process.env.NODE_ENV == 'production') {
    this.saveVideos(); // save "virgin" vimeo state
  }
  this.formatVideos();
};

DataHelper.prototype.getVideos = function() {
  return this.videos;
};

DataHelper.prototype.saveVideos = function() {
  jf.writeFileSync(config.videos_json + '.json', this.videos);
};

/**
 * Load videos into this.videos
 *
 * @param fromCache
 *   load videos from file cache
 */
DataHelper.prototype.loadVideos = function(fromCache) {
  if (!fromCache && process.env.NODE_ENV == 'production') {
    this.loadVideosFromVimeo();
  } else if (process.env.NODE_ENV == 'test') {
    try {
      this.setVideos(__dirname + '/assets/testdata.json');
    } catch (e) {
      console.error('no test data?!');
    }
  } else {
    try {
      this.setVideos(require(config.videos_json));
    } catch (e) {
      console.error('no vids, try to grab em', e);
    } finally {
      this.loadVideosFromVimeo();
    }
  }
};

DataHelper.prototype.loadVideosFromVimeo = function() {
  _.bindAll(this);
  this.recursive_grab_handler(null, null, this.recursive_grab_handler, this.setVideos);
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
DataHelper.prototype.recursive_grab_handler = function(api_path, videos, fn, done) {
  // first run
  api_path = (!api_path) ? '/users/5904516/videos?page=1&per_page=50' : api_path;
  videos = (!videos) ? [] : videos;

  vimeo.request({path: api_path}, function(err, body, status_code, headers) {

    if (err) {
      console.error('Vimeo API error', err);
      throw new Error('Vimeo API error');
      return null;
    } else {
      videos = [].concat(videos, body.data);
      if (body.paging.next) {
        fn(body.paging.next, videos, fn, done);
      } else {
        done(videos);
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
  _.forOwn(video.weighted_tags, function(weight, tag) {
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
    _.each(video.tags, function(tag) {
      if (tag.name.length > 0) {
        var re = /-?\d+$/;
        var res = tag.name.match(re);
        if (res) {
          var name = res.input.substr(0, res.index).toLowerCase();
          var weight = (parseInt(res[0])) ? parseInt(res[0]) : 0;
          this[name] = weight;
        } else {
          this[tag.name] = 0;
        }
      }
    }, tags);
    video.weighted_tags = tags;
  });
  return videos;
}

