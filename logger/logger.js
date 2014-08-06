'use strict';
var log = require('winston');
var sqlite = require('sqlite3');

var userlog = {};

userlog.start = function (pubsub, callback) {
  sqlite.verbose();
  userlog.db = new sqlite.cached.Database('muralUserLogs', function () {
    userlog.db.run('CREATE TABLE IF NOT EXISTS userlog(messageSource, messageDest, timeStamp, message);');
    pubsub.onAny(function (message) {
      var insert = "INSERT INTO userlog (messageSource, messageDest, timeStamp, message) VALUES ($from, $to, $time, $message);";
      var postInsertCallback = function (err) { log.info('(UL): in callback for insert'); };  
      var time = new Date().getTime();
      var insertParams = {$from: message.from, $to: message.to, $time: time, $message: message.message}; 
      userlog.db.run(insert, 
                     insertParams,
                     postInsertCallback
                     );
      if(message.to == 'userLog') {
        log.info('(UL): The onAny got a message to userLog');
      }
    });
    pubsub.on('query', function (message) {
      log.info('Query recieved: ' + message.to);
      if(message.to == 'userLog') {
        log.info('Query to userlog being processed: ' + message.toString());
        // this wants to parse the options/query given
        // For now it will use a default set.
        var options = {};
        log.info('here');
        options.end = new Date().getTime();
        options.begin = new Date().getTime() - 24 * 60 * 60 * 1000; 
        options.limit = 50;
        if(message.query.limit) {
          options.limit = message.query.limit;
        }
        options.PoP = message.query.PoP;

        var query = 'SELECT * FROM userlog' + 
          ' WHERE messageDest = $PoP AND messageSource <> $from AND timeStamp BETWEEN $begin AND $end ORDER BY timeStamp DESC LIMIT $limit;';
        log.info(query);
        userlog.db.all(query, {$PoP: options.PoP, $from: message.from, $begin: options.begin, $end: options.end, $limit: options.limit}, function (err, results) {
          results.reverse();
          log.info('(UL): Rows callback');
          log.info('(UL): Results: ' + results.toString());
          pubsub.emit(message.from, {from: 'userLog', to: message.from, message: results});
        });
      }
    });
    callback();
  });
};

module.exports = userlog; 
