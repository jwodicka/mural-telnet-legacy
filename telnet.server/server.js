var net = require('net');
var log = require('winston');
var connection = require('./connection.js');

var start = function(args, callback){
  var connect = connection.getConnectionHandler(args);
  var server = net.createServer(connect);
  // This is starting up the server. The callback is informing our caller that start is complete. Yay, we did it!
  server.listen(args['port'], function(){
    log.info('Server started', {port: args['port']}); 
    callback();
  });
}
// This will be available to outside packages to call.
exports.start = start;
