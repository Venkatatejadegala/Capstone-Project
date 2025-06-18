const mysql = require('mysql2/promise');

// MySQL connection pool
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'gunmaxx',           // enter your actual password if any
  database: 'capstone_db'
});

module.exports = db;
