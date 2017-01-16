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

  that.startDate = Date.now();
  that.tally = {};
  that.results = {};
};

tallytweets.prototype.start = function (settings) {
  var that = this;

  that.terms = settings.terms.slice(0);
  that.interval = settings.interval;

  if (settings.history !== undefined) {
    that.history = settings.history;
  }

  if (settings.limit !== undefined) {
    that.limit = settings.limit;
  }

  if (settings.intervalCb !== undefined) {
    that.intervalCb = settings.intervalCb;
  }

  if (settings.finishedCb !== undefined) {
    that.finishedCb = settings.finishedCb;
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

  if (that.limit === undefined) {
    async.forever(
      function(next) {
        that.populateInterval(next);
      }
    );
  } else {
    async.until(
      function () {
        var currentDate = new Date();
        var negateLimit = '-' + that.limit;
        var offsetDate = currentDate.strtotime(negateLimit);
        return offsetDate > that.startDate;
      },
      function (next) {
        that.populateInterval(next);
      },
      function () {
        if (that.finishedCb !== undefined) {
          that.finishedCb(that.results);
        }
        that.stream.stop();
      }
    );
  }
};

tallytweets.prototype.populateInterval = function (next) {
  var that = this;

  that.resetCount();

  var currentDate = new Date();
  var intervalString = currentDate.toISOString();
  that.results[intervalString] = {};

  setTimeout(function () {
    if (that.history !== undefined) {
      Object.keys(that.results).forEach(function (key) {
        var keyDate = new Date(key);
        var negateHistory = '-' + that.history;
        var cutoffDate = currentDate.strtotime(negateHistory);

        if (keyDate < cutoffDate) {
          delete that.results[key];
        }
      });
    }

    that.terms.forEach(function (term) {
      that.results[intervalString][term] = that.tally[term];
    });

    if (that.intervalCb !== undefined) {
      that.intervalCb(that.results);
    }

    next();
  }, that.interval * 1000);
};

tallytweets.prototype.resetCount = function () {
  var that = this;

  that.terms.forEach(function (term) {
    that.tally[term] = 0;
  });
};

module.exports = tallytweets;
