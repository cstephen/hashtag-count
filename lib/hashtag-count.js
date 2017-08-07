'use strict';

var async = require('async');
var Twit = require('twit');
require('date-util');

var HashtagCount = function (keys) {
  var self = this;

  self.T = new Twit({
    consumer_key: keys.consumer_key,
    consumer_secret: keys.consumer_secret,
    access_token: keys.access_token,
    access_token_secret: keys.access_token_secret,
    timeout_ms: 60 * 1000,
  });

  self.connected = false;
  self.firstConnection = true;
  self.lostConnection = false;

  self.startDate = Date.now();
  self.tally = {};
  self.results = {};
};

HashtagCount.prototype.start = function (settings) {
  var self = this;

  self.hashtags = settings.hashtags.slice(0);
  self.prefixedHashtags = [];

  self.hashtags.forEach(function (element) {
    self.prefixedHashtags.push('#' + element);
  });

  // Convert date string offset to seconds.
  var date1 = new Date();
  var date2 = date1.strtotime(settings.interval);
  self.interval = (date2.getTime() - date1.getTime()) / 1000;

  var optionalSettings = [
    'history',
    'limit',
    'intervalCb',
    'finishedCb',
    'connectingCb',
    'reconnectingCb',
    'connectedCb'
  ];

  optionalSettings.forEach(function (element) {
    if (settings[element] !== undefined) {
      self[element] = settings[element];
    }
  });

  self.stream = self.T.stream('statuses/filter', {
    track: self.prefixedHashtags
  });

  // This is where Twitter authorization errors show up.
  self.stream.on('parser-error', function (err) {
    self.error = err;
  });

  self.stream.on('connect', function () {
    if (self.firstConnection === true) {
      if (self.connectingCb !== undefined) {
        self.connectingCb();
      }
      self.firstConnection = false;
    }
  });

  self.stream.on('reconnect', function () {
    if (self.lostConnection === false && self.firstConnection === false) {
      if (self.reconnectingCb !== undefined) {
        self.reconnectingCb();
      }
      self.lostConnection = true;
    }
    self.connected = false;
  });

  self.stream.on('connected', function () {
    if (self.connectedCb !== undefined) {
      self.connectedCb();
    }
    self.connected = true;
    self.lostConnection = false;
  });

  // Handle error events here so Node.js does not exit.
  self.stream.on('error', function (err) {
    console.error(err);
  });

  self.stream.on('tweet', function (tweet) {
    // Populated with locations in the tweet object where hashtag terms appear.
    var htSources = [];

    // Populated with every hashtag term we extract from the tweet object.
    // These terms are stored without the # symbol prefix.
    var htTerms = [];

    htSources.push(tweet.entities.hashtags);

    if (tweet.retweeted_status !== undefined) {
      htSources.push(tweet.retweeted_status.entities.hashtags);

      if (tweet.retweeted_status.extended_tweet !== undefined) {
        htSources.push(tweet.retweeted_status.extended_tweet.entities.hashtags);
      }
    }

    if (tweet.quoted_status !== undefined) {
      htSources.push(tweet.quoted_status.entities.hashtags);
    }

    // Extract hashtag terms from each hashtag source, converting them to
    // lowercase in the process for case-insensitive comparison later.
    htSources.forEach(function (source) {
      if (source !== undefined) {
        var newHashtags = source.map(function (hashtagObj) {
          return hashtagObj.text.toLowerCase();
        });
        htTerms = htTerms.concat(newHashtags);
      }
    });

    self.hashtags.forEach(function (searchHashtag) {
      // Convert to lowercase for comparison.
      var searchTerm = searchHashtag.toLowerCase();

      // Only one tally is counted even if same term appears multiple times.
      if (htTerms.indexOf(searchTerm) !== -1) {
        self.tally[searchHashtag] += 1;
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

HashtagCount.prototype.populateInterval = function (next) {
  var self = this;

  self.resetCount();

  var currentDate = new Date();
  var intervalString = currentDate.toISOString();

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

    if (self.connected === true) {
      self.results[intervalString] = {};
      self.hashtags.forEach(function (term) {
        self.results[intervalString][term] = self.tally[term];
      });

      if (self.intervalCb !== undefined) {
        if (self.error !== undefined) {
          self.intervalCb(self.error, null);
        } else {
          self.intervalCb(null, self.results);
        }
      }
    }

    next();
  }, self.interval * 1000);
};

HashtagCount.prototype.resetCount = function () {
  var self = this;

  self.hashtags.forEach(function (term) {
    self.tally[term] = 0;
  });
};

module.exports = HashtagCount;
