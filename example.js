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
// into the term's array in the output object.
var interval = 15;

// An empty object that will be populated by the terms and their associated
// array of tweet counts for each interval of time. This is asynchronous and
// ongoing. Looks like this:
// output = {
//   '#superbowl': [ 7, 12, 4, 9, 2 ],
//   '#pizza': [ 3, 1, 4, 2, 5 ],
//   '#beer': [ 4, 9, 7, 2, 1 ]
// }
var output = {};

// Open a connection to Twitter's Steaming API and start capturing tweets!
tallytweets.start(terms, interval, output);

// Confirm that results are being updated as expected.
async.forever(
  function(next) {
    setTimeout(function () {
      console.log(output);
      next();
    }, interval * 1000);
  },
  function(err) {

  }
);
