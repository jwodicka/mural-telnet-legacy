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
    destServer.createDestination({start: echoChat.activate}, function () { done(); });
  });

  it('allows a user to add a PoP at the echoChat destination', function (done) {  
    destServer.createDestination({start: echoChat.activate}, function (destID) { 
      destServer.createPoP('TestUserID', {destinationID: destID}, function () {  done(); }); 
    });
  });

  it('activates an echoChat PoP when requested by a user', function (done) {
    destServer.createDestination(
      {
        start: echoChat.start, 
        startPoP: echoChat.activate
      }, 
      function (destID) { 
        destServer.createPoP(
          'TestUserID', 
          {destinationID: destID}, 
          function (PoPID) {  
            pubsub.on(PoPID, function (message) {
              if(message.message.match(/is active/) && message.from === 'EchoChat') {
                done();
              }
            });
            destServer.activatePoP('TestUserID', PoPID);
          });
      }
    );
  });

  it('receives an echoed message when a message is sent to echoChat');

  it('inactivates an echoChat PoP when requested');
});
