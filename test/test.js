'use strict';

var conf = require('nconf');
var HashtagCount = require('../lib/hashtag-count');

var chai = require('chai');
var assert = chai.assert;

conf.file({ file: './config.json' });

var consumerKey;
var consumerSecret;
var accessToken;
var accessTokenSecret;

if (process.env.CONSUMER_KEY !== undefined) {
  consumerKey = process.env.CONSUMER_KEY;
} else {
  consumerKey = conf.get('consumer_key');
}

if (process.env.CONSUMER_SECRET !== undefined) {
  consumerSecret = process.env.CONSUMER_SECRET;
} else {
  consumerSecret = conf.get('consumer_secret');
}

if (process.env.ACCESS_TOKEN !== undefined) {
  accessToken = process.env.ACCESS_TOKEN;
} else {
  accessToken = conf.get('access_token');
}

if (process.env.ACCESS_TOKEN_SECRET !== undefined) {
  accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
} else {
  accessTokenSecret = conf.get('access_token_secret');
}

var hc = new HashtagCount({
  'consumer_key': consumerKey,
  'consumer_secret': consumerSecret,
  'access_token': accessToken,
  'access_token_secret': accessTokenSecret
});

var hashtags = ['test'];
var interval = '1 second';

// Run for 5 minutes to give Twitter a chance to establish a connection in case
// the Twitter app credentials are being rate limited.
var limit = '300 seconds';

describe('hashtag-count', function () {
  it('hc should be an object ', function () {
    assert.isObject(hc);
  });

  it('hc.T should be an object ', function () {
    assert.isObject(hc.T);
  });

  it('hc.T.config should be an object ', function () {
    assert.isObject(hc.T.config);
  });

  describe('#config', function () {
    it('hc.T.config.consumer_key should be set ', function () {
      assert.isString(hc.T.config.consumer_key);
      assert.notEqual('...', hc.T.config.consumer_key);
    });

    it('hc.T.config.consumer_secret should be set ', function () {
      assert.isString(hc.T.config.access_token_secret);
      assert.notEqual('...', hc.T.config.access_token_secret);
    });

    it('hc.T.config.access_token should be set ', function () {
      assert.isString(hc.T.config.access_token_secret);
      assert.notEqual('...', hc.T.config.access_token_secret);
    });

    it('hc.T.config.access_token_secret should be set ', function () {
      assert.isString(hc.T.config.access_token_secret);
      assert.notEqual('...', hc.T.config.access_token_secret);
    });
  });

  describe('#start', function () {
    var self = this;

    // It should take 5 minutes (300 seconds) for the process to finish, but
    // let's give it some buffer time too.
    self.timeout(400000);

    it('should return results object ', function (done) {
      hc.start({
        hashtags: hashtags,
        interval: interval,
        limit: limit,
        finishedCb: function (err, results) {
          assert.isNull(err);
          assert.isObject(results);
          self.results = results;
          done();
        }
      });
    });

    it('results object should have more than one key ', function () {
      assert.isAbove(Object.keys(self.results).length, 1);
    });

    it('results object keys should be parsable into Date objects ', function () {
      Object.keys(self.results).forEach(function (key) {
        assert.typeOf(new Date(key), 'date');
      });
    });

    it('results object keys should contain objects of hashtags and counts ', function () {
      Object.keys(self.results).forEach(function (key) {
        assert.isObject(self.results[key]);
        assert.isNumber(self.results[key]['test']);
      });
    });
  });
});
