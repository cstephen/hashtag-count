// Tally tweets at regular time intervals forever, providing the current results
// to a callback function at the end of every time interval.
'use strict';

var conf = require('nconf');
var HashtagCount = require('../lib/hashtag-count');

// Log into your Twitter account and go here https://apps.twitter.com/ to
// generate keys for your application, then set them in config.json. Or you can
// hard-code them like this instead:
// var hc = new HashtagCount({
//   'consumer_key': '...',
//   'consumer_secret': '...',
//   'access_token': '...',
//   'access_token_secret': '...'
// });
conf.file({ file: '../config.json' });
var hc = new HashtagCount(conf.get());

// Array of hashtags to tally.
var hashtags = ['superbowl', 'pizza', 'beer'];

// Hashtag tallies for each time interval will be added to the results object.
var interval = '30 seconds';

// Delete data older than this.
var history = '5 minutes';

// Called at the end of each time interval. The results object contains
// start-of-interval time stamps with each interval's hashtag tallies.
// For example:
// {
//   '2017-01-16T00:00:10.606Z': { 'superbowl': 6, 'pizza': 1, 'beer': 8 },
//   '2017-01-16T00:01:10.610Z': { 'superbowl': 7, 'pizza': 1, 'beer': 4 },
//   '2017-01-16T00:02:10.612Z': { 'superbowl': 3, 'pizza': 1, 'beer': 0 }
// }
var intervalCb = function (err, results) {
  if (err) {
    console.error(err);
  } else {
    console.log(results);
  }
};

// Called when connecting to Twitter Streaming API for the first time.
var connectingCb = function () {
  var dateString = new Date().toISOString();
  console.log(dateString + ' Connecting to Twitter Streaming API...');
};

// Called when reconnecting to Twitter Streaming API after a failed connection.
// For example, if Twitter rate limits the connection or the stream experiences
// a timeout.
var reconnectingCb = function () {
  var dateString = new Date().toISOString();
  console.log(dateString + ' Twitter Streaming API connection failed. Reconnecting...');
};

// Called when a Twitter Streaming API connection is established, either on the
// first connection attempt or a later reconnection attempt.
var connectedCb = function () {
  var dateString = new Date().toISOString();
  console.log(dateString + ' Connected.');
};

// Open a connection to Twitter's Streaming API and start capturing tweets!
hc.start({
  hashtags: hashtags,               // required
  interval: interval,               // required
  history: history,                 // optional
  intervalCb: intervalCb,           // optional
  connectingCb: connectingCb,       // optional
  reconnectingCb: reconnectingCb,   // optional
  connectedCb: connectedCb,         // optional
});
