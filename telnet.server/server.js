var net = require('net');
var log = require('winston');

var start = function(args, callback){
  var server = net.createServer(function(connection){
    log.info('Connection established');
    // We have a connection object. It is a socket.
    // We want to bundle it plus a few other things to make an Endpoint.
    connection.on('end', function(){
      log.info('Connection ended');
    }); 
    connection.on('data', function(data){
      log.info('Data Received');
      var words = data.toString().split(' ');
       
      // This should probably be something better than an if.
      // Is there a way to have an if run only once?
      if(words[0] == 'connect') {
        log.info('Authentication request');
        connection.user = (args['authServer']({username: words[1], password: words[2]}));
        connection.write(connection.user.toString());
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
