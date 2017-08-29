'use strict';

describe('unlimited.js', function () {
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

      // Put intervalCb to sleep for 60 seconds before analyzing the results
      // object. This gives Twitter a chance to establish a connection in case
      // the Twitter app credentials are being rate limited, and to help avoid
      // being rate limited if several tests are run in a row.
      var intervalTimeout = 60000;

      // It should take 60 seconds for the process to finish, but let's set the
      // timeout to 90 seconds to give it some buffer time.
      self.timeout(90000);

      it('intervalCb should provide results object ', function (done) {
        hc.start({
          hashtags: hashtags,
          interval: interval,
          intervalCb: function (err, results) {
            setTimeout(function () {
              assert.isNull(err);
              assert.isObject(results);
              self.results = results;
              done();
            }, intervalTimeout);
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
});
