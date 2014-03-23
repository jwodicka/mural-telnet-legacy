'use strict';
var log = require('winston');

var fakeUserDatabase = [
  {username: 'testUser', password: 'testPassword', user: 'testUser'},
  {username: 'user2', password: 'password2', user: 'user2'}
];

var checkUsernameAndPassword = function (username, password) {
  var user = fakeUserDatabase.filter(function (user) {
    return (user.username === username && user.password === password);
  });
  if (user[0]) {
    return user[0].username;
  }
  return false;
};

var authenticate = function (args, callback) {
  if (args.username && args.password) {
    callback(checkUsernameAndPassword(args.username, args.password));
  } else { callback(false); }
};

var start = function (args, callback) {
  // Step one, it should talk to a database.
  // Ignoring that for now.

  callback();
};
exports.start = start;
exports.authenticate = authenticate;
