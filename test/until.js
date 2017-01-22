'use strict';

var conf = require('nconf');
var TallyTweets = require('../tallytweets');

var chai = require('chai');
var assert = chai.assert;

conf.file({ file: './config.json' });
var tt = new TallyTweets(conf.get());

var terms = ['#test'];
var interval = 1;
var limit = '3 seconds';
var results;

describe('tallytweets', function() {
  it('tt should be an object ', function() {
    assert.isObject(tt);
  });

  it('tt.T should be an object ', function() {
    assert.isObject(tt.T);
  });

  it('tt.T.config should be an object ', function() {
    assert.isObject(tt.T.config);
  });

  describe('#config', function() {
    it('tt.T.config.consumer_key should be set ', function() {
      assert.isString(tt.T.config.consumer_key);
      assert.notEqual('...', tt.T.config.consumer_key);
    });

    it('tt.T.config.consumer_secret should be set ', function() {
      assert.isString(tt.T.config.access_token_secret);
      assert.notEqual('...', tt.T.config.access_token_secret);
    });

    it('tt.T.config.access_token should be set ', function() {
      assert.isString(tt.T.config.access_token_secret);
      assert.notEqual('...', tt.T.config.access_token_secret);
    });

    it('tt.T.config.access_token_secret should be set ', function() {
      assert.isString(tt.T.config.access_token_secret);
      assert.notEqual('...', tt.T.config.access_token_secret);
    });
  });

  describe('#start', function() {
    var that = this;
    that.timeout(10000);

    it('should return results object ', function (done) {
      tt.start({
        terms: terms,
        interval: interval,
        limit: limit,
        finishedCb: function (results) {
          assert.isObject(results);
          that.results = results;
          done();
        }
      });
    });

    it('results object should have more than one key ', function () {
      assert.isAbove(Object.keys(that.results).length, 1);
    });

    it('results object keys should be parsable into Date objects ', function () {
      Object.keys(that.results).forEach(function (key) {
        assert.typeOf(new Date(key), 'date');
      });
    });

    it('results object keys should contain objects of hashtags and counts ', function () {
      Object.keys(that.results).forEach(function (key) {
        assert.isObject(that.results[key]);
        assert.isNumber(that.results[key]['#test']);
      });
    });
  });
});
