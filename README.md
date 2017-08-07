# hashtag-count

![hashtag-count](http://i.imgur.com/UGZ0AAI.png)

[![Build Status](https://travis-ci.org/cstephen/hashtag-count.svg?branch=master)](https://travis-ci.org/cstephen/hashtag-count)

Count hashtag occurrences over time at a provided interval using Twitter's
Streaming API. Multiple hashtags can be tracked simultaneously. It can be used
to collect hashtag counts for a provided length of time, with the results
analyzed after the process has finished, or it can be configured to run forever,
analyzing the results in real-time at the end of every time interval.

## Installation

```bash
npm install hashtag-count
```

## Usage

### Set up Twitter keys/tokens

You will need to log into Twitter's
[Application Management](https://apps.twitter.com/)
page to generate keys/tokens for your application so you can connect to
Twitter's API.

```javascript
var HashtagCount = require('hashtag-count');

var hc = new HashtagCount({
  'consumer_key': '...',
  'consumer_secret': '...',
  'access_token': '...',
  'access_token_secret': '...'
});
```

### Choose hashtags and time interval

```javascript
// Array of hashtags to tally. Do not include # prefix.
var hashtags = ['superbowl', 'pizza', 'beer'];

// Hashtag tallies for each time interval will be added to the results object.
var interval = '30 seconds';
```

### Run for limited time and analyze results when finished

```javascript
// Stop running after this amount of time has passed.
var limit = '5 minutes';

// Called after time limit has been reached.
var finishedCb = function (err, results) {
  if (err) {
    console.error(err);
  } else {
    console.log(results);
  }
};

// Open a connection to Twitter's Streaming API and start capturing tweets!
hc.start({
  hashtags: hashtags,       // required
  interval: interval,       // required
  limit: limit,             // optional
  finishedCb: finishedCb,   // optional
});
```

### Run for unlimited time and analyze results after every interval

```javascript
// Delete data older than this.
var history = '5 minutes';

// Called at the end of each time interval.
var intervalCb = function (err, results) {
  if (err) {
    console.error(err);
  } else {
    console.log(results);
  }
};

// Open a connection to Twitter's Streaming API and start capturing tweets!
hc.start({
  hashtags: hashtags,       // required
  interval: interval,       // required
  history: history,         // optional
  intervalCb: intervalCb,   // optional
});
```

### Results object

The `results` object has the same structure regardless of whether it appears in
the `intervalCb` or `finishedCb` callbacks. It takes the following form, where
the time stamp is an ISO string in UTC time representing the beginning of each
interval:

```
{
  '2017-01-16T00:00:10.606Z': { 'superbowl': 6, 'pizza': 1, 'beer': 8 },
  '2017-01-16T00:01:10.610Z': { 'superbowl': 7, 'pizza': 1, 'beer': 4 },
  '2017-01-16T00:02:10.612Z': { 'superbowl': 3, 'pizza': 1, 'beer': 0 }
}
```

### Connection status callbacks and a warning about rate limiting

Although Twitter Streaming API connections are designed to remain open
indefinitely, there are [several reasons why your application may get
disconnected](https://dev.twitter.com/streaming/overview/connecting#disconnections).
This module will attempt to reconnect automatically. How long it takes to
reconnect largely depends on whether your application is being [rate limited by
Twitter](https://dev.twitter.com/streaming/overview/connecting#rate-limiting).

You can set the optional `connectingCb`, `reconnectingCb`, and `connectedCb`
callbacks to report and react to these events:

```javascript
var connectingCb = function () {
  // Called when connecting to Twitter Streaming API for the first time.
};

var reconnectingCb = function () {
  // Called as soon as a failed connection is detected and a reschedule attempt
  // is scheduled.
};

var connectedCb = function () {
  // Called when a connection is established, either on the first connection
  // attempt or a later reconnection attempt.
};

hc.start({
  // ...
  connectingCb: connectingCb,       // optional
  reconnectingCb: reconnectingCb,   // optional
  connectedCb: connectedCb,         // optional
});
```

### Example scripts

Two example scripts are included. `limited.js` demonstrates how to use this
module to collect hashtag counts for a finite length of time, whereas
`unlimited.js` demonstrates how to analyze hashtag counts at the end of every
time interval without a time limit. You will need to be in the `examples`
directory to run these scripts so they can read `config.json` properly.

## Development and testing

If you would like to get involved in development for this module, first clone
this repository, then add your Twitter application keys to `config.json`. The
keys set in this file are read by both the example scripts and unit tests.

You will also need to install the module's dependencies and devDependencies with
the following command:

```
npm install
```

### Unit tests

Unit tests are located in the `test` directory and can be run from the
hashtag-count root directory with the following command:

```
npm test
```

Your Twitter application keys can be set via the following environment variables
for automated testing with Travis CI:

- CONSUMER_KEY
- CONSUMER_SECRET
- ACCESS_TOKEN
- ACCESS_TOKEN_SECRET
