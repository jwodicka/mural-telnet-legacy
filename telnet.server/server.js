var net = require('net');
var log = require('winston');
var byline = require('byline');

var start = function(args, callback){
  var server = net.createServer(function(connection){
    connection.randomNumber = Math.random();
    log.info('Connection established: ' + connection.randomNumber);
 //   connection.setTimeout(500,function(){ 
 //     log.info('Connection timed out' + connection.randomNumber); 
 //   });
    var stream = byline.createStream(connection);
    connection.user = null;
    connection.activeRemote = null;
    // We have a connection object. It is a socket.
    // We want to bundle it plus a few other things to make an Endpoint.
    connection.on('end', function(){
      log.info('Connection ended' + connection.randomNumber);
    }); 
    stream.on('data', function(line){
      log.info('Data Received: '+ line.toString());
      var lineAsString = line.toString().trim();
      if(connection.user) {
        // There is an authenticated user.
	if(lineAsString.charAt(0) === '%') {
          // This is our special char! We care about this line, yay!
	  // TODO: This needs to care about security
	  // commands with no space fail!
	  var endOfSlice = lineAsString.indexOf(' ');
	  if(endOfSlice === -1) { endOfSlice = lineAsString.length; }
          var firstWord = lineAsString.slice(0, endOfSlice);
	  if(firstWord === '%world') {
            // This kinda needs to check the list and all that jazz.
            connection.activeRemote = lineAsString.slice(lineAsString.indexOf(' ') + 1);
	  } else if(firstWord === '%list-remotes') {
            // Eventually we may cache this
	    connection.remotes = args['getRemotes'](connection.user);
	    var reply = 'Remotes:\n';
	    for(var i=0; i<connection.remotes.length; i++){
	      reply += connection.remotes[i].name;
	      reply += '\n';
	    }
	    connection.write(reply);
	  } else {
            connection.write('Huh?\n');
	  }
	} else {
	  // This is meant for a remote.
	  if(connection.activeRemote){
	    args['publish']('comm.' + connection.activeRemote, lineAsString);
	  } else {
	    connection.write('Not connected to remote! Try: %list-remotes');
	  }
	}
      } else {
        var words = lineAsString.split(' ');
        if(words[0] == 'connect') {
          log.info('Authentication request');
          connection.user = (args['authenticate']({username: words[1], password: words[2]}));
	  args['subscribe']('user.' + connection.user.toString());
          connection.write(connection.user.toString() + '\n');
        } else if(words[0] == 'help' || words[0] == '%help') {
	  connection.write('Have some helpfile. Only don\'t.\n');
	} else {
	  connection.write('Huh? \"connect <username> <password>\" or type \"help\"\n');
	}
      }
    });
    connection.write('Welcome to Mural!\n');
  });
  server.listen(args['port'], function(){
    log.info('Server started', {port: args['port']}); 
    callback();
  });
}
exports.start = start;
