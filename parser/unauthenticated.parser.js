var log = require('winston');
var events = require('events');

var getUnauthenticatedParser = function(systemCommands){
  //checking properties, done with a callback. Writing to user, done via events.
  // Implement it.
  // Also: passthroughs to other parsers. Some pass through. Others don't.
  var localCommands = new events.EventEmitter();

  localCommands.on('helpfile', function(words) {
    // TODO: Actual helpfile. Should be a separate file loaded by system.
    systemCommands.emit('messageForUser', 'Have some helpfile. Only don\'t.\n');
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
    if(localCommands.emit(verbs[words[0]], words)) {       
    } else {
      if(systemCommands.emit(verbs[words[0]], words)) {
      } else {
        // We don't recognize the command. Provide the problem line and a default message.
        systemCommands.emit('parseError', line, 'Huh? \"connect <username> <password>\" or type \"help\"\n');
      }
    }
  }
}
exports.getUnauthenticatedParser = getUnauthenticatedParser;
