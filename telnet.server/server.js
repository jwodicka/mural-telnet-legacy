var net = require('net');
var log = require('winston');

var start = function(args, callback){
  var server = net.createServer(function(connection){
    log.info('Connection established');
    connection.on('end', function(){
      log.info('Connection ended');
    }); 
    connection.on('data', function(data){
      log.info('Data Received');
      var words = data.toString().split(' ');
      if(words[0] == 'connect') {
        log.info('Authentication request');
        connection.write(args['authServer'].authenticate(words[1], words[2]));
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
