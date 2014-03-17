var net = require('net');
var log = require('winston');
var byline = require('byline');

var start = function(args, callback){
  var server = net.createServer(function(connection){
    log.info('Connection established');
    var stream = byline.createStream(connection);
    connection.user = null;
    // We have a connection object. It is a socket.
    // We want to bundle it plus a few other things to make an Endpoint.
    connection.on('end', function(){
      log.info('Connection ended');
    }); 
    stream.on('data', function(line){
      log.info('Data Received: '+ line.toString());
      var words = line.toString().split(' ');
       
      if(connection.user) {
        // There is an authenticated user.
	
      } else {
        if(words[0] == 'connect') {
          log.info('Authentication request');
          connection.user = (args['authenticate']({username: words[1], password: words[2]}));
	  args['subscribe']('user.' + connection.user.toString());
          connection.write(connection.user.toString() + '\n');
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
