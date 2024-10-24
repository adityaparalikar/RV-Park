var mysql2 = require('mysql2/promise');

var dbCon = require('../lib/database');

let sql = "CREATE DATABASE IF NOT EXISTS NodeExpressSessionStorage";
console.log("sessionPool.js: sql message will be " + sql);
dbCon.execute(sql, function(err, results, fields) {
  if (err) {
    console.log("sessionPool.js: Problem: Is the MySQL server running?");
    console.log(err.message);
    throw err;
  } else {
    console.log("sessionPool.js: Created session database if it didn't already exist");
  }
});

var options = require('../lib/connectioninfo');
options.database = 'NodeExpressSessionStorage';

var pool = mysql2.createPool(options);

module.exports = pool;
