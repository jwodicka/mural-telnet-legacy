'use strict';
/*global describe: false, it: false, before: false, beforeEach, false */
var winston = require('winston');
var sinon = require('sinon');
var events = require('events');
var pubsub = require('../pubsub/pubsub.js');

var client;

describe('Pubsub', function () {
  before(function (done) {
    done();
  });

  beforeEach(function (done) {
    // We need to reset the subscriptions.
    pubsub.removeAllListeners();
    done();
  });


  it('accepts a subscription to a channel', function (done) {
    pubsub.on('test channel', function (message) {
    });
    events.EventEmitter.listenerCount(pubsub, 'test channel').should.equal(1);
    done();
  });

  it('errors on a subscription with no channel'/*, function (done) {
    pubsub.on(null, function (message) {
    });
    done();
  }*/);

  it('allows subscriptions to multiple channels', function (done) {
    pubsub.on('test channel', function (message) {
    });
    
    pubsub.on('another channel', function (message) {
    });
    events.EventEmitter.listenerCount(pubsub, 'test channel').should.equal(1);
    events.EventEmitter.listenerCount(pubsub, 'another channel').should.equal(1);
    done();
    });

  it('accepts a publication to a channel', function (done) {
    pubsub.emit('test channel', 'message');
    done();
  });

  it('errors on a publication with no channel');

  it('delivers message to subscriber on its channel', function (done) {
    pubsub.on('test channel', function (message) {
      message.should.match('test message');
      done();
    });
    pubsub.emit('test channel', 'test message');
  });

  it('delivers message to multiple subscribers');

  it('does not deliver message to subscriber of a different channel');

  it('informs a publisher if 1+ subscribers have received a message');

  it('removes a subscription when requested by the subscriber');

  it('only removes subscriptions that request removal');

  it('accepts a subscription to a pattern');

  it('delivers message to subscriber of its pattern');

  it('delivers message to multiple subscribers of its pattern');

  it('does not deliver message to subscriber of a different pattern');

  it('delivers message to subscriber on channel and subscriber of pattern');

  it('includes origin in its message');

});
