'use strict';

var async = require('async');
var Twit = require('twit');
require('date-util');

var tallytweets = function (keys) {
  var that = this;

  that.T = new Twit({
    consumer_key:         keys.consumer_key,
    consumer_secret:      keys.consumer_secret,
    access_token:         keys.access_token,
    access_token_secret:  keys.access_token_secret,
    timeout_ms:           60 * 1000,
  });

  that.tally = {};
  that.results = {};
};

tallytweets.prototype.start = function (settings) {
  var that = this;

  that.terms = settings.terms.slice(0);
  that.interval = settings.interval;
  that.callback = settings.callback;

  if (settings.limit !== undefined) {
    that.limit = settings.limit;
  }

  that.stream = that.T.stream('statuses/filter', { track: that.terms });

  that.stream.on('tweet', function (tweet) {
    that.terms.forEach(function (term) {
      // White space or punctuation characters must terminate a term search.
      // This prevents false positives, so a tweet containing #foobar will not
      // get picked up in a search for just #foo.
      var terminate = ' \t\n!"#$%&\\\'()\*+,\-\.\/:;<=>?@\[\\\]\^_`{|}~';
      var regex = new RegExp(term + '(?=[' + terminate + '])', 'i');

      if (tweet.text.match(regex)) {
        that.tally[term] += 1;
      }
    });
  });

  async.forever(
    function(next) {
      that.resetCount();

      var currentTime = new Date();
      var intervalString = currentTime.toISOString();
      that.results[intervalString] = {};

      setTimeout(function () {
        if (that.limit !== undefined) {
          Object.keys(that.results).forEach(function (key) {
            var keyDate = new Date(key);
            var negateLimit = '-' + that.limit;
            var cutoffDate = currentTime.strtotime(negateLimit);

            if (keyDate < cutoffDate) {
              delete that.results[key];
            }
          });
        }

        that.terms.forEach(function (term) {
          that.results[intervalString][term] = that.tally[term];
        });

        that.callback(that.results);
        next();
      }, that.interval * 1000);
    },
    function (err) {
      console.error(err);
    }
  );
};

tallytweets.prototype.resetCount = function () {
  var that = this;

  that.terms.forEach(function (term) {
    that.tally[term] = 0;
  });
};

module.exports = tallytweets;
