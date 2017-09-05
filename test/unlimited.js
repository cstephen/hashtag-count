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

  var startDate = new Date();
  var hashtags = ['test'];
  var interval = '1 second';
  var history = '1 minute';

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

      // Wait 3 minutes before analyzing the results object inside intervalCb.
      // This gives Twitter a chance to establish a connection in case the
      // Twitter app credentials are being rate limited, and to help avoid being
      // rate limited if several tests are run in a row.
      var testAfter = '3 minutes';

      // It should take 3 minutes for the process to finish, but let's set the
      // timeout to 4 minutes to give it some padding.
      self.timeout(240000);

      it('intervalCb should provide a valid results object ', function (done) {
        hc.start({
          hashtags: hashtags,
          interval: interval,
          history: history,
          intervalCb: function (err, results) {
            assert.isNull(err);
            assert.isObject(results);

            var currentDate = new Date();
            var negateTestAfter = '-' + testAfter;
            var testAfterDate = currentDate.strtotime(negateTestAfter);

            if (testAfterDate > startDate) {
              var negateHistory = '-' + history;
              var historyDate = currentDate.strtotime(negateHistory);
              var paddedHistoryDate = historyDate.strtotime('-5 seconds');

              for (var timestamp in results) {
                if (results.hasOwnProperty(timestamp)) {
                  var intervalDate = new Date(timestamp);
                  assert.isAtLeast(intervalDate, paddedHistoryDate);
                }
              }

              self.results = results;
              done();
            }
          }
        });
      });

      it('results object should have more than one key ', function () {
        assert.isAtLeast(Object.keys(self.results).length, 1);
      });

      it('results object keys should be parsable into Date objects ', function () {
        Object.keys(self.results).forEach(function (key) {
          assert.typeOf(new Date(key), 'date');
        });
      });

      it('results object keys should contain objects of hashtags and counts ', function () {
        Object.keys(self.results).forEach(function (key) {
          assert.isObject(self.results[key]);
          assert.isNumber(self.results[key].test);
        });
      });
    });
  });
});
