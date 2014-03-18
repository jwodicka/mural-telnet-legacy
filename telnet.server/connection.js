var log = require('winston');
var byline = require('byline');
var unauthenticatedParser = require('../parser/unauthenticated.parser.js');

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
	// TODO: Move the '%' into a configurable variable.
	if(lineAsString.charAt(0) === '%') {
          // This is our special char! We care about this line, yay!
	  
	  // This gets the first 'word' of the line
	  //  It either slices at the first space, or takes the whole line if there is no space.
	  var endOfSlice = lineAsString.indexOf(' ');
	  if(endOfSlice === -1) { endOfSlice = lineAsString.length; }
          var firstWord = lineAsString.slice(0, endOfSlice);

	  // This is the core of our command parser. It checks for known commands and errors to user if none match.
	  if(firstWord === '%world') {
            // This should check connection.remotes to see if it knows about this world. If not, it should error.
	    // Eventually, this should support partials.
            connection.activeRemote = lineAsString.slice(lineAsString.indexOf(' ') + 1);
	  } else if(firstWord === '%list-remotes') {
            // Eventually we may cache this?
	    args['getRemotes'](connection.user, function(remotes){
	      connection.remotes = remotes;
	      // This is formatting a reply.
	      var reply = 'Remotes:\n';
	      for(var i=0; i<connection.remotes.length; i++){
	        reply += connection.remotes[i].name;
	        reply += '\n';
	      }
	      connection.write(reply);
	    });
	  } else {
            // If we're here, it means we don't recognize this command. This is usually fine and means the user typoed.
            connection.write('Huh? (Type \'%help\' for help with Mural.)\n');
	  }
	} else {
	  // This does not lead with our special character, and is meant for a remote.
	  if(connection.activeRemote){
            // Open question: Do we ever care when a publish complete? i.e. should we provide a callback?
	    args['publish']('comm.' + connection.activeRemote, lineAsString);
	  } else {
	    connection.write('Not connected to remote! Try: %list-remotes');
	  }
	}
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
