 feature/checkout
const mysql = require('mysql2/promise');

/**
 * Konfigurasi koneksi database MySQL.
 * Gunakan 'pool' untuk manajemen koneksi yang lebih efisien dan stabil.
 */
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'optik_db', // Pastikan nama database ini sesuai dengan di MySQL kamu
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool;

const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "sapphire291106@_",
  database: "ecommerce_db"
});

db.connect((err) => {
  if (err) {
    console.log("DB Error:", err);
  } else {
    console.log("Database Connected!");
  }
});

module.exports = db;
develop
