const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "fullstack_db"
});

db.connect((err) => {
  if (err) {
    console.log("Database connection error:", err);
    return;
  }
  console.log("MySQL Connected!");
});

module.exports = db;