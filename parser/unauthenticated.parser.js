var log = require('winston');
var emitter = require('events');

var getUnauthenticatedParser = function(commands){
  //checking properties, done with a callback. Writing to user, done via events.
  // Implement it.
  // Also: passthroughs to other parsers. Some pass through. Others don't.
  commands['connection'].on('authenticate', function(words){
    log.info('Authentication request');
    // Our standard means to auth is a username and password.
    // We use 'connect username password' because it's standard on MUCK/MUSH.
    // Other formats and means may exist in vNext.
    commands['authenticate']({username: words[1], password: words[2]}, function(user){
      log.info('Callback from authenticate' + commands['connection'].randomNumber);
      commands['connection'].emit('authentication', user);	
    });      
  });

  commands['connection'].on('helpfile', function(words) {
    // TODO: Actual helpfile. Should be a separate file loaded by system.
    commands['connection'].write('Have some helpfile. Only don\'t.\n');
  });

  return function(line) {
    // emitter.emit returns true if event had listeners, false otherwise.
    // This means we can write this as a set of events to emit. 
    // We try to emit. If it doesn't work, 'Huh?'
    var verbs = {
	    'connect': 'authenticate', 
	    'help': 'helpfile', 
	    '%help': 'helpfile'
    };

    var words = line.split(' ');
    if(commands['connection'].emit(verbs[words[0]], words)) {
      
    } else {
      // We don't recognize the command. Provide the problem line and a default message.
      commands['connection'].emit('parseError', line, 'Huh? \"connect <username> <password>\" or type \"help\"\n');
    }
  }
}
exports.getUnauthenticatedParser = getUnauthenticatedParser;
