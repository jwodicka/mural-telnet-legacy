var log = require('winston');
var events = require('events');

var getAuthenticatedParser = function(systemCommands){
  var localCommands = new events.EventEmitter();

  localCommands.on('connectToWorld', function(worldName){
    systemCommands.emit('activateRemote', worldName);
  });

  localCommands.on('listRemoteWorlds', function(){
    // Eventually we may cache this?
    systemCommands.emit('queryState', 'remoteWorlds', function(remotes){
      // This is formatting a reply.
      var reply = 'Remotes:\n';
      for(var i=0; i<remotes.length; i++){
        reply += remotes[i].name;
        reply += '\n';
      }
      systemCommands.emit('messageForUser', reply);
    });
  });

  return function(line) {
	 // log.info('In authed parser with line: ' + line);
    // This gets the first 'word' of the line
    //  It either slices at the first space, or takes the whole line if there is no space.
    var endOfSlice = line.indexOf(' ');
    if(endOfSlice === -1) { endOfSlice = line.length; }
    var firstWord = line.slice(0, endOfSlice);
    
    var verbs = {
	    '%world': 'connectToWorld',
	    '%list-remotes': 'listRemoteWorlds'
    } 
      
    if(localCommands.emit(verbs[firstWord], line)) {
    //  log.info('Emitted event: ' + verbs[firstWord]); 
    } else {
      if(systemCommands.emit(verbs[firstWord], line)) {
      } else {
        if(line.charAt(0) === '%') {
          // TODO: Check 2nd char; %% to pass through to system regardless.
          systemCommands.emit('parseError', line, 'Huh? (Type \'%help\' for help with Mural.)');
        } else {
          // This does not lead with our special character, and is meant for a remote.
          systemCommands.emit('messageForRemote', '', line);
	}
      }
    }  
  };
}
exports.getAuthenticatedParser = getAuthenticatedParser;
