var log = require('winston');
var uuid = require('node-uuid');

var destinationServer = {};

// Eventually this wants to be caching data about what PoPs are active.

destinationServer.start = function (pubsub, callback) {
  destinationServer.pubsub = pubsub;
  destinationServer.destinations = {};
  destinationServer.users = {};
  // It probably loads a base set from a file/DB, here.
  callback();
};

destinationServer.createDestination = function (destinationOptions, callback) {
  // check if this is a valid destination.
  // What makes a valid destination? 
  //   It has a method to activate a PoP. 
  //   It has handlers for certain events.
  
  // This may not be the correct long-term UUID to generate.
  var destinationID = uuid.v1();
  
  destinationServer.destinations[destinationID] = {
    'id': destinationID,
    'name': destinationOptions.name,
    'description': destinationOptions.description,
    'start': destinationOptions.start
  };
  // Check who added this destination. 
  // If they are capable of creating non-private, set it according to the options.
  // Otherwise, set it as visible only to them.
  
  callback(destinationID);
  
};

destinationServer.listDestinations = function (options, callback) {
  var matchedDestinations = Object.keys(destinationServer.destinations).map(function(destinationKey) {
    // Returns everything instead of actually making choices.
    return destinationServer.destinations[destinationKey];
  });

  callback(matchedDestinations);
};

destinationServer.createPoP = function (userID, options, callback) {
  var PoPID = uuid.v1();
  
  var PoP = {
    'name': options.name, 
    'id': PoPID, 
    'destinationID': options.destinationID,
    'start': options.start
  };
  if(destinationServer.users[userID] == undefined) {
    destinationServer.users[userID] = {};
  }
  destinationServer.users[userID][PoPID] = PoP;
  callback(PoP.id);
};

destinationServer.listPoPs = function (userID, options, callback) {
  var requestingUser = destinationServer.users.userID;
  
  var listOfPoPs = requestingUser.PoPs
    .map(function (PoP) { 
      // This wants to use the options to filter.
      // Actually it may be a chained set of filters?
      return PoP; 
    });
  callback(listOfPoPs);
};

destinationServer.activatePoP = function (userID, PoPID) {
  // Check if it's a valid PoP for this user!
 
  var destinationID = destinationServer.users[userID][PoPID].destinationID;
  //log.info('destinationID from PoPID: ' + destinationID);
  destinationServer.destinations[destinationID].start(destinationServer.pubsub, function () {
    //log.info('activating at Destination: ' + destinationID);
    destinationServer.pubsub.emit(destinationID, PoPID);
  });
};

module.exports = destinationServer;
