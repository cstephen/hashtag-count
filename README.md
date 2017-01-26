# hashtag-count

![hashtag-count](../master/images/hashtag-count.png?raw=true)

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
// Array of hashtags to tally.
var hashtags = ['#superbowl', '#pizza', '#beer'];

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
the time stamps represent the beginning of each time interval:

```
{
  '2017-01-16T00:00:10.606Z': { '#superbowl': 6, '#pizza': 1, '#beer': 8 },
  '2017-01-16T00:01:10.610Z': { '#superbowl': 7, '#pizza': 1, '#beer': 4 },
  '2017-01-16T00:02:10.612Z': { '#superbowl': 3, '#pizza': 1, '#beer': 0 }
}
```
