let mysql = require('mysql2');

var con = mysql.createConnection(require('./connectioninfo'))

con.connect((err)=>{
  if(err) {
    throw err;
  }
  console.log("Connected to database");
  con.query("CREATE DATABASE IF NOT EXISTS rv_park", (err, result)=>{
    if(err) {
      throw err;
    }
    console.log("Database created");
    selectDatabase();
  })
});

function selectDatabase() {
  let sql = "USE rv_park";
  con.query(sql, (err, result)=>{
    if(err) {
      throw err;
    }
    console.log("Selected database");
    createTables();
    createStoredProcedures();
    addTableData();
  })
}

function createTables() {
  let sql = "CREATE TABLE IF NOT EXISTS user_types (\n" +
    "user_type_id INT NOT NULL AUTO_INCREMENT, \n" +
    "user_type VARCHAR(25) NOT NULL,\n" +
    "PRIMARY KEY (user_type_id)\n" +
    ");";
  con.execute(sql, function(err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: table user_types created if it didn't exist");
    }
  });

  sql = "CREATE TABLE IF NOT EXISTS users (\n" +
    "user_id INT NOT NULL AUTO_INCREMENT,\n" +
    "name VARCHAR(255) NOT NULL,\n" +
    "username VARCHAR(255) NOT NULL,\n" +
    "user_type_id INT NOT NULL,\n" +
    "hashed_password VARCHAR(255) NOT NULL,\n" +
    "salt VARCHAR(255) NOT NULL,\n" +
    "PRIMARY KEY (user_id),\n" +
    "FOREIGN KEY (user_type_id) REFERENCES user_types(user_type_id)\n" +
    ")";
  con.execute(sql, function(err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: table users created if it didn't exist");
    }
  });
}

function createStoredProcedures() {

  let sql = "CREATE PROCEDURE IF NOT EXISTS `insert_user_type`(\n" +
      "IN user_type VARCHAR(45)\n" +
    ")\n" +
    "BEGIN\n" +
    "INSERT INTO user_types (user_type)\n" +
    "SELECT user_type FROM DUAL\n" +
    "WHERE NOT EXISTS (\n" +
    "SELECT * FROM user_types\n" +
    "WHERE user_types.user_type=user_type LIMIT 1\n" +
    ");\n" +
    "END;";

  con.query(sql, function(err, results, fields) {
    if (err) {
      console.log(err.message);
    throw err;
    } else {
      console.log("database.js: procedure insert_user_type created if it didn't exist");
    }
  });

  sql = "CREATE PROCEDURE IF NOT EXISTS `register_user`(\n" +
    "IN  name VARCHAR(255), \n" +
    "IN  username VARCHAR(255), \n" +
    "IN  hashed_password VARCHAR(255), \n" +
    "IN  salt VARCHAR(255),\n" +
    "OUT result INT\n" +
    ")\n" +
    "BEGIN\n" +
    "DECLARE nCount INT DEFAULT 0;\n" +
    "SET result = 0;\n" +
    "SELECT Count(*) INTO nCount FROM users WHERE users.username = username;\n" +
    "IF nCount = 0 THEN\n" +
      "INSERT INTO users (name, username, user_type_id, hashed_password, salt)\n" +
      "VALUES (name, username, (SELECT user_type_id FROM user_types WHERE user_types.user_type = 'customer'), hashed_password, salt);\n" +
    "ELSE\n" +
      "SET result = 1;\n" +
    "END IF;\n" +
    "END;"
    ");\n" +
  con.query(sql, function(err, results, fields) {
    if (err) {
      console.log(err.message);
    throw err;
    } else {
      console.log("database.js: procedure register_user created if it didn't exist");
    }
  });

  sql = "CREATE PROCEDURE IF NOT EXISTS `get_salt`(\n" +
    "IN username VARCHAR(255)\n" +
    ")\n" +
    "BEGIN\n" +
    "SELECT salt FROM users\n" +
    "WHERE users.username = username\n" +
    "LIMIT 1;\n" +
    "END;";

  con.query(sql, function(err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: procedure get_salt created if it didn't exist");
    }
  });

  sql = "CREATE PROCEDURE IF NOT EXISTS `check_credentials`(\n" +
    "IN username VARCHAR(255),\n" +
    "IN hashed_password VARCHAR(255)\n" +
    ")\n" +
    "BEGIN\n" +
    "SELECT EXISTS(\n" +
    "SELECT * FROM users\n" +
    "WHERE users.username = username AND users.hashed_password = hashed_password\n" +
    ") AS result;\n" +
    "END;";

  con.query(sql, function(err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: procedure check_credentials created if it didn't exist");
    }
  });

  sql = "CREATE PROCEDURE IF NOT EXISTS `change_user_type`(\n" +
    "IN username VARCHAR(255),\n" +
    "IN user_type VARCHAR(255)\n" +
    ")\n" +
    "BEGIN\n" +
    "UPDATE users\n" +
    "SET users.user_type_id = (SELECT user_type_id FROM user_types WHERE user_types.user_type = user_type)\n" +
    "WHERE users.username = username;\n" +
    "END;";
  con.query(sql, function(err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: procedure change_user_type created if it didn't exist");
    }
  });

  // sql = "CREATE PROCEDURE IF NOT EXISTS `has_user_type`(\n" +
  //   "IN username VARCHAR(255)\n," +
  //   "IN user_type VARCHAR(255)\n," +
  //   "OUT result INT\n" +
  //   ")\n" +
  //   "BEGIN\n" +
  //   "DECLARE nCount INT DEFAULT 0;\n" +
  //   "SET result = 0;\n" +
  //   "SELECT Count(*) INTO nCount FROM users\n"+
  //   "INNER JOIN user_types on users.user_type_id = user_types.user_type_id\n"+
  //   "WHERE users.username = username and user_types.user_type = user_type;\n" +
  //   "IF nCount = 0 THEN\n" +
  //     "SET result = 1;\n" +
  //   "END IF;\n" +
  //   "END;";
  // con.query(sql, function(err, results, fields) {
  //   if (err) {
  //     console.log(err.message);
  //     throw err;
  //   } else {
  //     console.log("database.js: procedure has_user_type created if it didn't exist");
  //   }
  // });

  sql = "CREATE PROCEDURE IF NOT EXISTS `get_user_type`(\n" +
    "IN username VARCHAR(255)\n" +
    ")\n" +
    "BEGIN\n" +
    "SELECT user_types.user_type FROM users\n"+
    "INNER JOIN user_types on users.user_type_id = user_types.user_type_id\n"+
    "WHERE users.username = username LIMIT 1;\n" +
    "END;";
  con.query(sql, function(err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: procedure get_user_type created if it didn't exist");
    }
  });

}

function addTableData() {

  let sql = "CALL insert_user_type('customer')";
  con.query(sql, function(err,rows){
  if (err) {
    console.log(err.message);
    throw err;
  }
    console.log("database.js: Added 'customer' to user_types");
  });
  sql = "CALL insert_user_type('employee')";
  con.query(sql, function(err,rows){
  if (err) {
    console.log(err.message);
    throw err;
  }
    console.log("database.js: Added 'employee' to user_types");
  });
  sql = "CALL insert_user_type('admin')";
  con.query(sql, function(err,rows){
  if (err) {
    console.log(err.message);
    throw err;
  }
    console.log("database.js: Added 'admin' to user_types");
  });

  sql = "CALL register_user('admin', 'admin', '041f2520d744f70672ed2d31bdfc0065c61278998462e2adab2b19629e5c3850', '5de8439cb0c63356', @result); SELECT @result";
  con.query(sql, function(err,rows){
  if (err) {
    console.log(err.message);
    throw err;
  }
    console.log("database.js: Added 'admin' to users");
  });

  sql = "CALL change_user_type('admin', 'admin')";
  con.query(sql, function(err,rows){
  if (err) {
    console.log(err.message);
    throw err;
  }
    console.log("database.js: Promoted 'admin' to 'admin'");
  });
}

module.exports = con;
