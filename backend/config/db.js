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