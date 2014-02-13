var _      = require('lodash/dist/lodash.underscore'),
    videos = [];

if (process.env.NODE_ENV == 'production') {
  videos = [].concat(
    require('../assets/videos-1.json'),
    require('../assets/videos-2.json')
  );
} else {
  videos = require('../assets/videos.sample.json');
}

module.exports = DataHelper;

function DataHelper() {

}

DataHelper.prototype.videos = function() {
  return videos;
};

/*
 * @param vimeo tag
 * @return escaped tag
 */
DataHelper.prototype.escape_tag = function(tag) {
  return encodeURIComponent(tag);
};

/*
 * @param vimeo video.tags string
 * @return array of URL-friendly tags
 */
DataHelper.prototype.tags_from_video = function(video) {
  var helper = this;
  return _.map(video.tags.split(', '), function(tag) {
    return helper.escape_tag(tag);
  });
};

DataHelper.prototype.all_tags = function(videos) {
  var helper = this;
  return _.reduce(videos, function(tags, video) {
   return _.union(helper.tags_from_video(video), tags);
  });
};

