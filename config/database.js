// ============================================
// KONFIGURASI KONEKSI DATABASE MYSQL
// ============================================
// File ini mengatur koneksi ke database MySQL
// Menggunakan mysql2 dengan promise untuk async/await
// Menyediakan pool connection dan helper query reusable

const mysql = require('mysql2/promise');
require('dotenv').config();

// Membuat connection pool untuk performa lebih baik
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'lensique',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,        // Maksimal 10 koneksi bersamaan
    queueLimit: 0,              // Tidak ada batas antrian
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

// Fungsi untuk mengecek koneksi database
async function testConnection() {
    let connection;
    try {
        connection = await pool.getConnection();
        const [rows] = await connection.query('SELECT 1 as test');
        console.log('Koneksi database MySQL berhasil!');
        return { success: true, data: rows[0] };
    } catch (error) {
        console.error('Gagal koneksi ke database:', error.message);
        return { success: false, error: error.message };
    } finally {
        if (connection) connection.release();
    }
}

// Helper untuk menjalankan query dalam transaksi
async function withTransaction(callback) {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const result = await callback(connection);
        await connection.commit();
        return result;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

// Helper untuk query satu row
async function queryOne(sql, params) {
    const [rows] = await pool.query(sql, params);
    return rows.length > 0 ? rows[0] : null;
}

// Helper untuk query banyak row
async function queryMany(sql, params) {
    const [rows] = await pool.query(sql, params);
    return rows;
}

// Helper untuk insert dan return insertId
async function insert(sql, params) {
    const [result] = await pool.query(sql, params);
    return result.insertId;
}

// Helper untuk update/delete dan return affectedRows
async function execute(sql, params) {
    const [result] = await pool.query(sql, params);
    return result.affectedRows;
}

// Test koneksi saat modul dimuat
testConnection();

// Export pool sebagai default untuk backward compatibility
// Semua controller yang menggunakan db.query() tetap berfungsi
module.exports = pool;

// Tambahkan helper sebagai property untuk akses mudah
module.exports.testConnection = testConnection;
module.exports.withTransaction = withTransaction;
module.exports.queryOne = queryOne;
module.exports.queryMany = queryMany;
module.exports.insert = insert;
module.exports.execute = execute;
