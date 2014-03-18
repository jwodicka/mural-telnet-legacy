var log = require('winston');
var byline = require('byline');
var unauthenticatedParser = require('../parser/unauthenticated.parser.js');
var authenticatedParser = require('../parser/authenticated.parser.js');

var getConnectionHandler = function getConnectionHandler(args) {
  return function(connection){
    // The server has just had a client connect.
    
    // We do some setup, including giving it a random ID and a stream so we can work with lines instead of raw data.
    connection.randomNumber = Math.random();
    log.info('Connection established: ' + connection.randomNumber);
    var stream = byline.createStream(connection);
    connection.user = null;
    connection.activeRemote = null;
    args['connection'] = connection;
    connection.parser = unauthenticatedParser.getUnauthenticatedParser(args);

    // We have a connection object. It is a socket. 
    // At some point it will end. All good things must.
    connection.on('end', function(){
      // We might eventually do fancy cleanup. We don't right now.
      log.info('Connection ended' + connection.randomNumber);
    });

    connection.on('authentication', function(user){  
      connection.user = user;
      // TODO: standard subscription handler
      args['subscribe']('user.' + args['connection'].user, function(message){
        connection.write(message.toString() + '\n');
      });
      // Changes out the parser this connection uses to an authenticated one.
      // In the future, this might be customized by user.
      connection.parser = authenticatedParser.getAuthenticatedParser(args);
    });

    stream.on('data', function(line){
      // Our line-based stream has a line for us!  This is a command of some sort from the user.
      // We explicitly make it a string and trim leading and trailing whitespace.
      log.info('Data Received: '+ line.toString());
      var lineAsString = line.toString().trim();
      
      // This parser could be authed or unauthed. 
      // It knows how to raise events: authentication
      // It has functions to: authenticate, write, getRemotes, publish    
      connection.parser(lineAsString);
    });
    // This is sent immediately to the new client on connection.
    connection.write('Welcome to Mural!\n');
  };
}
exports.getConnectionHandler = getConnectionHandler;
