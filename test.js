'use strict';

var conf = require('nconf');
var TweetCount = require('../tweet-count');

var chai = require('chai');
var assert = chai.assert;

conf.file({ file: './config.json' });
var tc = new TweetCount(conf.get());

var terms = ['#test'];
var interval = 1;
var limit = '3 seconds';

describe('tweet-count', function () {
  it('tc should be an object ', function () {
    assert.isObject(tc);
  });

  it('tc.T should be an object ', function () {
    assert.isObject(tc.T);
  });

  it('tc.T.config should be an object ', function () {
    assert.isObject(tc.T.config);
  });

  describe('#config', function () {
    it('tc.T.config.consumer_key should be set ', function () {
      assert.isString(tc.T.config.consumer_key);
      assert.notEqual('...', tc.T.config.consumer_key);
    });

    it('tc.T.config.consumer_secret should be set ', function () {
      assert.isString(tc.T.config.access_token_secret);
      assert.notEqual('...', tc.T.config.access_token_secret);
    });

    it('tc.T.config.access_token should be set ', function () {
      assert.isString(tc.T.config.access_token_secret);
      assert.notEqual('...', tc.T.config.access_token_secret);
    });

    it('tc.T.config.access_token_secret should be set ', function () {
      assert.isString(tc.T.config.access_token_secret);
      assert.notEqual('...', tc.T.config.access_token_secret);
    });
  });

  describe('#start', function () {
    var self = this;
    self.timeout(10000);

    it('should return results object ', function (done) {
      tc.start({
        terms: terms,
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
        assert.isNumber(self.results[key]['#test']);
      });
    });
  });
});
