var tallytweets = require('./tallytweets')

// Log into your Twitter account and go here https://apps.twitter.com/
// to generate keys for your application.
var tallytweets = new tallytweets({
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

// Callback function is called at the end of each time interval. The results
// object contains start-of-interval time stamps with each interval's term
// tallies. For example:
// {
//   '2017-01-16T00:00:10.606Z': { '#superbowl': 6, '#pizza': 1, '#beer': 8 },
//   '2017-01-16T00:01:10.610Z': { '#superbowl': 7, '#pizza': 1, '#beer': 4 },
//   '2017-01-16T00:02:10.612Z': { '#superbowl': 3, '#pizza': 1, '#beer': 0 }
// }
var callback = function (results) {
  console.log(results);
}

// Optional parameter. Delete data older than this. Can be seconds, minutes,
// hours, days, weeks, months, etc.
var limit = '10 minutes';

// Open a connection to Twitter's Streaming API and start capturing tweets!
tallytweets.start({
  terms: terms,           // required
  interval: interval,     // required
  callback: callback,     // required
  limit: limit,           // optional
});
