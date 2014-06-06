'use strict';
/*global describe: false, it: false, before: false, beforeEach, false */
var destServer = require('../destination.server/destination.server.js');
var echoChat = require('../echoChat.destination/echoChat.destination.js');
var winston = require('winston');
var sinon = require('sinon');
var events = require('events');

var pubsub;

describe('Destination Server', function() {
  before(function (done) {
    pubsub = new events.EventEmitter;
    destServer.start(pubsub, function() {
      done();
    });
  });

  it('allows a user to add the echoChat destination', function (done) {
    destServer.createDestination({activate: echoChat.activate}, function () { done(); });
  });

  it('allows a user to add a PoP at the echoChat destination');

  it('activates an echoChat PoP when requested by a user');

  it('receives an echoed message when a message is sent to echoChat');

  it('inactivates an echoChat PoP when requested');
});
