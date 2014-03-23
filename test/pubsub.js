'use strict';
/*global describe: false, it: false, before: false, beforeEach, false */
var pubsub = require('../pubsub/pubsub.js');
var winston = require('winston');
var sinon = require('sinon');

describe('Pubsub', function () {
/*  before(function (done) {
    pubsub.start('', function () {
      done();
    });
  });
*/
  it('accepts a subscription to a channel');

  it('errors on a subscription with no channel');

  it('allows subscriptions to multiple channels');

  it('accepts a publication to a channel');

  it('errors on a publication with no channel');

  it('delivers message to subscriber on its channel');

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
