'use strict';

var async = require('async');
var Twit = require('twit');
require('date-util');

var TweetCount = function (keys) {
  var self = this;

  self.T = new Twit({
    consumer_key:         keys.consumer_key,
    consumer_secret:      keys.consumer_secret,
    access_token:         keys.access_token,
    access_token_secret:  keys.access_token_secret,
    timeout_ms:           60 * 1000,
  });

  self.startDate = Date.now();
  self.tally = {};
  self.results = {};
};

TweetCount.prototype.start = function (settings) {
  var self = this;

  self.terms = settings.terms.slice(0);
  self.interval = settings.interval;

  if (settings.history !== undefined) {
    self.history = settings.history;
  }

  if (settings.limit !== undefined) {
    self.limit = settings.limit;
  }

  if (settings.intervalCb !== undefined) {
    self.intervalCb = settings.intervalCb;
  }

  if (settings.finishedCb !== undefined) {
    self.finishedCb = settings.finishedCb;
  }

  self.stream = self.T.stream('statuses/filter', { track: self.terms });

  self.stream.on('parser-error', function (err) {
    self.error = err;
  });

  self.stream.on('tweet', function (tweet) {
    self.terms.forEach(function (term) {
      // White space or punctuation characters must terminate a term search.
      // This prevents false positives, so a tweet containing #foobar will not
      // get picked up in a search for just #foo.
      var terminate = ' \t\n!"#$%&\\\'()\*+,\-\.\/:;<=>?@\[\\\]\^_`{|}~';
      var regex = new RegExp(term + '(?=[' + terminate + '])', 'i');

      if (tweet.text.match(regex)) {
        self.tally[term] += 1;
      }
    });
  });

  async.until(
    function () {
      if (self.error !== undefined) {
        return true;
      } else if (self.limit !== undefined) {
        var currentDate = new Date();
        var negateLimit = '-' + self.limit;
        var offsetDate = currentDate.strtotime(negateLimit);
        return offsetDate > self.startDate;
      } else {
        return false;
      }
    },
    function (next) {
      self.populateInterval(next);
    },
    function () {
      if (self.finishedCb !== undefined) {
        if (self.error !== undefined) {
          self.finishedCb(self.error, null);
        } else {
          self.finishedCb(null, self.results);
        }
      }
      self.stream.stop();
    }
  );
};

TweetCount.prototype.populateInterval = function (next) {
  var self = this;

  self.resetCount();

  var currentDate = new Date();
  var intervalString = currentDate.toISOString();
  self.results[intervalString] = {};

  setTimeout(function () {
    if (self.history !== undefined) {
      Object.keys(self.results).forEach(function (key) {
        var keyDate = new Date(key);
        var negateHistory = '-' + self.history;
        var cutoffDate = currentDate.strtotime(negateHistory);

        if (keyDate < cutoffDate) {
          delete self.results[key];
        }
      });
    }

    self.terms.forEach(function (term) {
      self.results[intervalString][term] = self.tally[term];
    });

    if (self.intervalCb !== undefined) {
      if (self.error !== undefined) {
        self.intervalCb(self.error, null);
      } else {
        self.intervalCb(null, self.results);
      }
    }

    next();
  }, self.interval * 1000);
};

TweetCount.prototype.resetCount = function () {
  var self = this;

  self.terms.forEach(function (term) {
    self.tally[term] = 0;
  });
};

module.exports = TweetCount;
