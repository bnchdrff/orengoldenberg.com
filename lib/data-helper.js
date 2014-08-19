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
      var name = tag.match(/\D+/)[0].toLowerCase();
      var weight = (tag.match(/\d+/)) ? parseInt(tag.match(/\d+/)[0]) : 0;
      this[name] = weight;
    }, tags);
    video.tags = tags;
  });
  return videos;
}

