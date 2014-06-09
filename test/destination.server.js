'use strict';
/*global describe: false, it: false, before: false, beforeEach, false */
var destServer = require('../destination.server/destination.server.js');
var winston = require('winston');
var sinon = require('sinon');
var events = require('events');

var activateDestStub;
var pubsub;

describe('Destination Server', function () {
  before(function (done) {

    activateDestStub = sinon.stub().callsArg(1);
    pubsub = new events.EventEmitter;
    destServer.start(pubsub, function () {
      done(); 
    });
  });

  it('lists only public destinations when not given a user');

  it('lists all destinations visible to a user', function (done) {
    destServer.createDestination({
      name: 'TestDestination', 
      description: 'TestDescription'
    }, function () { 
      destServer.listDestinations({user: 'TestUser'}, function (destinations) {
        destinations[0].name.should.match(/TestDestination/);
        done();
      });
    });
  });

  it('allows a user to add a destination', function (done) {
    destServer.createDestination({start: activateDestStub}, function () { done(); });
  });

  it('allows an authorized user to remove a destination');
  
  it('provides a list of all destinations visible to a user');
  
  it('provides a list of all PoPs for a user');

  it('allows a user to add a PoP at a destination', function(done) {
    destServer.createDestination({name: 'TestDestination'}, function (destID) {
      destServer.createPoP('TestUserID', {destinationID: destID}, function (PoPID) {
        done();
      });
    });
  });

  it('allows a user to inactivate a PoP at a destination');

  it('requests activation of a PoP when requested by the user', function(done) {
    destServer.createDestination({name: 'TestDestination', start: activateDestStub, startPoP: activateDestStub}, function (destID) {
    //  winston.info('DestID: ' + destID);
      pubsub.on(destID, function (message) {
        pubsub.emit(message, message + 'activated');
      });
      destServer.createPoP('TestUserID', {destinationID: destID}, function (PoPID) {
        pubsub.on(PoPID, function (message) {
          message.message.should.match(/is active/);
          done();
        });
        
        destServer.activatePoP('TestUserID', PoPID);
      });
    });
  });

  it('provides details about a destination when requested');

  it('includes PoPs for a user in destination information for that user');

  it('provides details about a PoP when requested');

});
