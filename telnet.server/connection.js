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
    var authedParser = authenticatedParser.getAuthenticatedParser(args);

    // We have a connection object. It is a socket. At some point it will end. All good things must.
    connection.on('end', function(){
      // We might eventually do fancy cleanup. We don't right now.
      log.info('Connection ended' + connection.randomNumber);
    });

    stream.on('data', function(line){
      // Our line-based stream has a line for us! This is a command of some sort from the user.
      // We explicitly make it a string and trim leading and trailing whitespace.
      log.info('Data Received: '+ line.toString());
      var lineAsString = line.toString().trim();
     
      /* This is our line parser.
       * There are two states we care about when it comes to parsing the string:
       * 1) Does the connection have an authenticated user? 
       *    If it doesn't, we support a limited set of commands designed to get to an authenticated user.
       * 2) Does the connection have an active remote?
       *    In the telnet server universe, we want most connections to be connected to remotes. (V1: 1 remote per connection)
       *    Commands meant for the telnet server will be prefaced by an escape character. */
      if(connection.user) {
        // There is an authenticated user.
	
	// TODO: We should not be doing this here. It sets it every time we get data.
	// It's inefficent and bad.
	// The right way to do this is to have the unauth parser raise an authenticated event which is caught by the connection, which does the setup, but my brain cannot understand custom events right now and I want to build. But this is a hack and a BAD IDEA. FIX IT.
	connection.parser = authedParser;
	connection.parser(lineAsString);
      } else {
	// This is not an authenticated user. We want to get them authenticated.
	// The unauthenticatedParser is good for that.
	connection.parser(lineAsString);
      }
    });
    // This is sent immediately to the new client on connection.
    connection.write('Welcome to Mural!\n');
  };
}
exports.getConnectionHandler = getConnectionHandler;
