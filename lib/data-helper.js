var _      = require('lodash'),
    config = require('../config.json'),
    videos = [];

if (process.env.NODE_ENV == 'production') {
  videos = [].concat(
    require('../assets/videos-1.json'),
    require('../assets/videos-2.json')
  );
} else {
  videos = require('../assets/videos.sample.json');
  _.each(videos, function(video) {
    video.thumbnail_large = '/assets/640x360.jpg';
  });
}

videos = format_tags(videos);
videos = enforce_ratio(videos);

module.exports = DataHelper;

function DataHelper() {

}

DataHelper.prototype.videos = function() {
  return videos;
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
        var name = res.input.substr(0, res.index).toLowerCase();
        var weight = (parseInt(res[0])) ? parseInt(res[0]) : 0;
        this[name] = weight;
      }
    }, tags);
    video.tags = tags;
  });
  return videos;
}

/**
 * Change thumbnail_large to a fixed aspect ratio filename.
 *
 * Undocumented Vimeo API feature!
 *
 * @param videos
 *   Vimeo videos array
 * @return videos
 *   Vimeo videos with 640x360 large thumbs
 */
function enforce_ratio(videos) {
  _.each(videos, function(video) {
    video.thumbnail_large = video.thumbnail_large.replace('640.jpg', '640x360.jpg');
  });
  return videos;
}
