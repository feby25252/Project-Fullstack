 feature/product

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

 develop
const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
 feature/product
  password: "",
  database: "fullstack_db"

  password: "",
  database: "ecommerce_db"
 develop
});

db.connect((err) => {
  if (err) {
 feature/product
    console.log("Database connection error:", err);
    return;
  }
  console.log("MySQL Connected!");
});

module.exports = db;

    console.log("DB Error:", err);
  } else {
    console.log("Database Connected!");
  }
});

module.exports = db;
develop
 develop
