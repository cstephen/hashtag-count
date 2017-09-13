'use strict';

describe('limited.js', function () {
  var conf = require('nconf');
  var HashtagCount = require('../lib/hashtag-count');

  var chai = require('chai');
  var assert = chai.assert;

  var spies = require('chai-spies');
  chai.use(spies);
  chai.should();

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

  // Run for 3 minutes to give Twitter a chance to establish a connection in
  // case the Twitter app credentials are being rate limited, and also not to
  // bombard Twitter with rapid reconnections if several tests are run in a row.
  var limit = '3 minutes';

  describe('hashtag-count', function () {
    it('hc should be an object ', function () {
      assert.isObject(hc);
    });

    it('hc.T should be an object ', function () {
      assert.isObject(hc.T);
    });

    describe('#config', function () {
      it('hc.T.config should be an object ', function () {
        assert.isObject(hc.T.config);
      });

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

    var self = this;
    var finishedCbSpy;
    var connectingCbSpy;
    var connectedCbSpy;

    describe('#start', function () {
      // It should take 3 minutes for the process to finish, but let's set the
      // timeout to 4 minutes to give it some padding.
      this.timeout(240000);

      it('should provide a results object after 3 minutes ', function (done) {
        connectingCbSpy = chai.spy();
        connectedCbSpy = chai.spy();

        finishedCbSpy = chai.spy(function (err, results) {
          assert.isNull(err);
          assert.isObject(results);
          self.results = results;
          done();
        });

        hc.start({
          hashtags: hashtags,
          interval: interval,
          limit: limit,
          connectingCb: connectingCbSpy,
          connectedCb: connectedCbSpy,
          finishedCb: finishedCbSpy
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
          assert.isNumber(self.results[key].test);
        });
      });
    });

    describe('callbacks', function () {
      it('connectingCb should have been called exactly once ', function () {
        connectingCbSpy.should.have.been.called.once();
      });

      it('connectedCb should have been called at least once ', function () {
        connectedCbSpy.should.have.been.called();
      });

      it('finishedCb should have been called exactly once ', function () {
        finishedCbSpy.should.have.been.called.once();
      });
    });
  });
});
