var async = require('async');
var Twit = require('twit');
require('date-util');

module.exports = function (keys) {
  var T = new Twit({
    consumer_key:         keys.consumer_key,
    consumer_secret:      keys.consumer_secret,
    access_token:         keys.access_token,
    access_token_secret:  keys.access_token_secret,
    timeout_ms:           60 * 1000,
  });

  var stream;
  var startTime;
  var interval;
  var limit;
  var terms = [];
  var results = {};
  var tally = {};

  function start(settings) {
    terms = settings.terms.slice(0);
    interval = settings.interval;
    callback = settings.callback;

    if(settings.limit !== undefined) {
      limit = settings.limit;
    }

    stream = T.stream('statuses/filter', { track: terms });

    stream.on('tweet', function (tweet) {
      for(var i = 0; i < terms.length; i++) {
        // White space or punctuation characters must terminate a term search.
        // This prevents false positives, so a tweet containing #foobar will not
        // get picked up in a search for just #foo.
        var terminate = ' \t\n!"#$%&\\\'()\*+,\-\.\/:;<=>?@\[\\\]\^_`{|}~';
        var regex = new RegExp(terms[i] + '(?=[' + terminate + '])', 'i');

        if(tweet.text.match(regex)) {
          tally[terms[i]] += 1;
        }
      }
    });

    async.forever(
      function(next) {
        resetCount();

        var currentTime = new Date();
        var intervalString = currentTime.toISOString();
        results[intervalString] = {};

        setTimeout(function () {
          if(limit !== undefined) {
            Object.keys(results).forEach(function (key, index) {
              var keyDate = new Date(key);
              var negateLimit = '-' + limit;
              var cutoffDate = currentTime.strtotime(negateLimit);

              if(keyDate < cutoffDate) {
                delete results[key];
              }
            });
          }

          for(var i = 0; i < terms.length; i++) {
            results[intervalString][terms[i]] = tally[terms[i]];
          }
          callback(results);
          next();
        }, interval * 1000);
      },
      function(err) {

      }
    );
  }

  function resetCount() {
    for(var i = 0; i < terms.length; i++) {
      tally[terms[i]] = 0;
    }
  }

  // Export these functions.
  return {
    start: start
  };
}
