var async = require('async');
var tallytweets = require('./tallytweets')

// Log into your Twitter account and go here https://apps.twitter.com/
// to generate keys for your application.
var tallytweets = tallytweets({
  consumer_key:         '...',
  consumer_secret:      '...',
  access_token:         '...',
  access_token_secret:  '...',
});

// Array of terms to tally. Can be anything, such as @people or just plain
// words, but hashtags are better for observing trends.
var terms = [ '#superbowl', '#pizza', '#beer' ];

// Time interval in seconds. The tally for each time interval will be pushed
// into the term's array in the results object.
var interval = 60;

// Maximum number of time interval tallies to keep. Shift out the old ones.
// Set this to 0 for unlimited.
var cap = 10;

// Called at the end of every time interval. Each term becomes a property of the
// results object, and each term has its own array of time interval tallies.
//
// For example:
// results = {
//   '#superbowl': [ 7, 12, 4, 9, 2 ],
//   '#pizza': [ 3, 1, 4, 2, 5 ],
//   '#beer': [ 4, 9, 7, 2, 1 ]
// }
var callback = function (results) {
  console.log(results);
}

// Open a connection to Twitter's Streaming API and start capturing tweets!
tallytweets.start({
  terms: terms,
  interval: interval,
  cap: cap,
  callback: callback
});
