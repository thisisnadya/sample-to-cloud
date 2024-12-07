const mysql = require("mysql2");
require("dotenv").config();

const connectMySql = () => {
  const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
  });

  connection.connect((error) => {
    if (error) {
      console.error("Error connecting to MySQL", error.message);
      return;
    }
    console.log("Connected to MySQL!");
  });
  return connection;
};

module.exports = connectMySql;
