var net = require('net');
var log = require('winston');

var start = function(port, callback){
  var server = net.createServer(function(connection){
    log.info('Connection established');
    connection.on('end', function(){
      log.info('Connection ended');
    });
    connection.write('Welcome to Mural!');
  });
  server.listen(port, function(){
    log.info('Server started', {port: port}); 
    callback();
  });
}
exports.start = start;
