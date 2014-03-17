var net = require('net');
var log = require('winston');

var start = function(args, callback){
  var server = net.createServer(function(connection){
    log.info('Connection established');
    connection.user = null;
    // We have a connection object. It is a socket.
    // We want to bundle it plus a few other things to make an Endpoint.
    connection.on('end', function(){
      log.info('Connection ended');
    }); 
    connection.on('data', function(data){
      log.info('Data Received');
      var words = data.toString().split(' ');
       
      if(connection.user) {
        // There is an authenticated user.
	
      } else {
        if(words[0] == 'connect') {
          log.info('Authentication request');
          connection.user = (args['toAuthenticate']({username: words[1], password: words[2]}));
	  args['toSubscribe']('user.' + connection.user.toString());
          connection.write(connection.user.toString());
        }
      }
    });
    connection.write('Welcome to Mural!');
  });
  server.listen(args['port'], function(){
    log.info('Server started', {port: args['port']}); 
    callback();
  });
}
exports.start = start;
