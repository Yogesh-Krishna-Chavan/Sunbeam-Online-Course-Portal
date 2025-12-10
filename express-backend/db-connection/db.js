const mysql = require("mysql2");
const { USERNAME, PASSWORD, DATABASE } = require("../config");

const pool = mysql.createPool({
  host: "localhost",
  user: USERNAME,
  password: PASSWORD,
  database: DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 10,
  idleTimeout: 60000,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

module.exports = { pool };
