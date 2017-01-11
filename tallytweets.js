var async = require('async');
var Twit = require('twit');

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
  var cap;
  var terms = [];
  var output;
  var tally = {};

  function start(t, i, c, o) {
    terms = t.slice(0);
    interval = i;
    cap = c;
    output = o;

    stream = T.stream('statuses/filter', { track: terms });

    for(var i = 0; i < terms.length; i++) {
      output[terms[i]] = [];
    }

    stream.on('tweet', function (tweet) {
      for(var i = 0; i < terms.length; i++) {
        if(tweet.text.indexOf(terms[i]) !== -1) {
          tally[terms[i]] += 1;
        }
      }
    });

    async.forever(
      function(next) {
        resetCount();
        setTimeout(function () {
          for(var i = 0; i < terms.length; i++) {
            if(output[terms[i]].length >= cap) {
              output[terms[i]].shift();
            }
            output[terms[i]].push(tally[terms[i]]);
          }
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
