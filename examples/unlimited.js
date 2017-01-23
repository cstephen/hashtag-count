// Tally tweets at regular time intervals forever, providing the current results
// to a callback function at the end of every time interval.
'use strict';

var conf = require('nconf');
var TallyTweets = require('../tallytweets');

// Log into your Twitter account and go here https://apps.twitter.com/
// to generate keys for your application, then set them in config.json.
conf.file({ file: '../config.json' });
var tt = new TallyTweets(conf.get());

// Array of terms to tally. Can be anything, such as @people or just plain
// words, but hashtags are better for observing trends.
var terms = ['#superbowl', '#pizza', '#beer'];

// Time interval in seconds. The tally for each time interval will be pushed
// into the term's array in the results object.
var interval = 60;

// Delete data older than this. Can be seconds, minutes, hours, days, weeks,
// months, etc.
var history = '30 minutes';

// Called at the end of each time interval. The results object contains
// start-of-interval time stamps with each interval's term tallies.
// For example:
// {
//   '2017-01-16T00:00:10.606Z': { '#superbowl': 6, '#pizza': 1, '#beer': 8 },
//   '2017-01-16T00:01:10.610Z': { '#superbowl': 7, '#pizza': 1, '#beer': 4 },
//   '2017-01-16T00:02:10.612Z': { '#superbowl': 3, '#pizza': 1, '#beer': 0 }
// }
var intervalCb = function (err, results) {
  if (err) {
    console.error(err);
  } else {
    console.log(results);
  }
};

// Open a connection to Twitter's Streaming API and start capturing tweets!
tt.start({
  terms: terms,             // required
  interval: interval,       // required
  history: history,         // optional
  intervalCb: intervalCb,   // optional
});
