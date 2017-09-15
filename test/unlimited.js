'use strict';

describe('unlimited.js', function () {
  var conf = require('nconf');
  var HashtagCount = require('../lib/hashtag-count');

  var chai = require('chai');
  var spies = require('chai-spies');
  var should = chai.should();
  chai.use(spies);

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
  var history = '1 minute';

  describe('hashtag-count', function () {
    it('hc should be an object ', function () {
      hc.should.be.a('object');
    });

    it('hc.T should be an object ', function () {
      hc.T.should.be.a('object');
    });

    describe('config', function () {
      it('hc.T.config should be an object ', function () {
        hc.T.config.should.be.a('object');
      });

      it('hc.T.config.consumer_key should be set ', function () {
        hc.T.config.consumer_key.should.be.a('string');
        hc.T.config.consumer_key.should.not.equal('...');
      });

      it('hc.T.config.consumer_secret should be set ', function () {
        hc.T.config.consumer_secret.should.be.a('string');
        hc.T.config.consumer_secret.should.not.equal('...');
      });

      it('hc.T.config.access_token should be set ', function () {
        hc.T.config.access_token.should.be.a('string');
        hc.T.config.access_token.should.not.equal('...');
      });

      it('hc.T.config.access_token_secret should be set ', function () {
        hc.T.config.access_token_secret.should.be.a('string');
        hc.T.config.access_token_secret.should.not.equal('...');
      });
    });

    var self = this;
    var intervalCbSpy;
    var connectingCbSpy;
    var connectedCbSpy;

    describe('#start', function () {
      // It should take 3 minutes for the process to finish, but let's set
      // the timeout to 4 minutes to give it some padding.
      this.timeout(240000);

      it('should provide a results object after 3 minutes ', function (done) {
        connectingCbSpy = chai.spy();
        connectedCbSpy = chai.spy();

        intervalCbSpy = chai.spy(function (err, results) {
          should.not.exist(err);
          results.should.be.a('object');
          self.currentDate = new Date();
          self.results = results;
        });

        hc.start({
          hashtags: hashtags,
          interval: interval,
          history: history,
          connectingCb: connectingCbSpy,
          connectedCb: connectedCbSpy,
          intervalCb: intervalCbSpy
        });

        // Wait 3 minutes before analyzing the results object in the
        // following tests. This gives Twitter a chance to establish a
        // connection in case the Twitter app credentials are being rate
        // limited, and to help avoid being rate limited if several tests
        // are run in a row.
        setTimeout(function () {
          done();
        }, 180000);
      });

      it('results object should have more than one key ', function () {
        Object.keys(self.results).should.have.length.above(1);
      });

      it('results object keys should be parsable into Date objects ', function () {
        Object.keys(self.results).forEach(function (key) {
          new Date(key).should.be.a('date');
        });
      });

      it('results object keys should contain objects of hashtags and counts ', function () {
        Object.keys(self.results).forEach(function (key) {
          self.results[key].should.be.a('object');
          self.results[key].test.should.be.a('number');
        });
      });

      it('results should not exceed history setting ', function () {
        var negateHistory = '-' + history;
        var historyDate = self.currentDate.strtotime(negateHistory);
        var paddedHistoryDate = historyDate.strtotime('-5 seconds');

        for (var timestamp in self.results) {
          if (self.results.hasOwnProperty(timestamp)) {
            var intervalDate = new Date(timestamp);
            intervalDate.should.be.above(paddedHistoryDate);
          }
        }
      });
    });

    describe('callbacks', function () {
      it('connectingCb should have been called exactly once ', function () {
        connectingCbSpy.should.have.been.called.once();
      });

      it('connectedCb should have been called at least once ', function () {
        connectedCbSpy.should.have.been.called();
      });

      it('intervalCb should have been called at least once ', function () {
        intervalCbSpy.should.have.been.called();
      });
    });
  });
});
