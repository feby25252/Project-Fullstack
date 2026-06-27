// ============================================
// SERVER UTAMA - LENSIQUE E-COMMERCE OPTIK
// ============================================
// File ini adalah entry point utama aplikasi
// Menginisialisasi Express server dan semua route
// Backend ini berfungsi sebagai REST API untuk frontend React

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./config/database');
const { multerErrorHandler, validationErrorHandler, databaseErrorHandler, jwtErrorHandler, globalErrorHandler } = require('./middleware/errorHandler');

// ============================================
// ENVIRONMENT DETECTION
// ============================================
const IS_VERCEL = !!process.env.VERCEL;
const UPLOAD_DIR = IS_VERCEL
    ? '/tmp/uploads'
    : path.join(__dirname, 'uploads');
let _migrationRan = false;

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// MIDDLEWARE GLOBAL
// ============================================

// Mengizinkan Cross-Origin Request
app.use(cors());

// Parsing JSON body dari request
app.use(express.json());

// Parsing URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// Menyajikan file statis (CSS, JS, gambar)
app.use('/public', express.static(path.join(__dirname, 'public')));

// Menyajikan file upload produk
app.use('/uploads', express.static(UPLOAD_DIR));

// ============================================
// LAZY AUTO-MIGRATION (VERCEL ONLY)
// ============================================
// On Vercel, run migrations on first request instead of at startup.
// This prevents the serverless function from crashing if DB is
// temporarily unreachable during cold start.
if (IS_VERCEL) {
    app.use(async (req, res, next) => {
        if (!_migrationRan) {
            _migrationRan = true;
            try { await autoMigrate(); } catch (e) {
                console.warn('Auto-migration skipped on Vercel:', e.message);
            }
        }
        next();
    });
}

// ============================================
// IMPORT ROUTES DARI SETIAP FITUR
// ============================================

// Fitur Autentikasi & Registrasi
const authRoutes = require(path.join(__dirname, 'lensique', 'Fitur Autentikasi, Registrasi, & Profile User', 'backend', 'authRoutes'));

// Fitur Profile User
const profileRoutes = require(path.join(__dirname, 'lensique', 'Fitur Autentikasi, Registrasi, & Profile User', 'backend', 'profileRoutes'));

// Fitur Katalog Produk (User)
const katalogRoutes = require(path.join(__dirname, 'lensique', 'Fitur Katalog Produk (Admin)', 'backend', 'katalogRoutes'));

// Fitur Manajemen Produk (Admin)
const produkRoutes = require(path.join(__dirname, 'lensique', 'Fitur Manajemen Produk (admin)', 'backend', 'produkRoutes'));

// Fitur Keranjang Belanja
const keranjangRoutes = require(path.join(__dirname, 'lensique', 'Fitur Keranjang Belanja', 'backend', 'keranjangRoutes'));

// Fitur Checkout & Riwayat Pesanan
const checkoutRoutes = require(path.join(__dirname, 'lensique', 'Fitur Checkout & Riwayat Pesanan', 'backend', 'checkoutRoutes'));
const pesananRoutes = require(path.join(__dirname, 'lensique', 'Fitur Checkout & Riwayat Pesanan', 'backend', 'pesananRoutes'));

// Fitur Wishlist
const wishlistRoutes = require(path.join(__dirname, 'lensique', 'Fitur Katalog Produk (Admin)', 'backend', 'wishlistRoutes'));

// Route Admin Management (baru)
const adminRoutes = require('./routes/adminRoutes');

// Route Review (baru)
const reviewRoutes = require('./routes/reviewRoutes');

// Route Orders (terpadu: checkout + riwayat)
const orderRoutes = require('./routes/orderRoutes');

// ============================================
// REGISTRASI ROUTES API
// ============================================

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/katalog', katalogRoutes);
app.use('/api/admin/produk', produkRoutes);
app.use('/api/keranjang', keranjangRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/pesanan', pesananRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', reviewRoutes);
app.use('/api/orders', orderRoutes);

// ============================================
// HEALTH CHECK & DB STATUS
// ============================================

// Endpoint untuk cek status server dan database
app.get('/api/health', async (req, res) => {
    const dbStatus = await db.testConnection();
    res.json({
        success: true,
        message: 'Server berjalan normal',
        timestamp: new Date().toISOString(),
        database: dbStatus.success ? 'connected' : 'disconnected'
    });
});

// ============================================
// ERROR HANDLING TERPUSAT
// ============================================

// Handler untuk route yang tidak ditemukan (404)
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Halaman tidak ditemukan'
    });
});

// Middleware error handler terurut
app.use(multerErrorHandler);
app.use(validationErrorHandler);
app.use(databaseErrorHandler);
app.use(jwtErrorHandler);
app.use(globalErrorHandler);

// ============================================
// JALANKAN SERVER
// ============================================

async function autoMigrate() {
    try {
        // Pastikan kolom-kolom penting ada (tanpa error jika sudah ada)
        const migrations = [
            // users table
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active TINYINT(1) DEFAULT 1",
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP NULL",
            // user_profile table
            "ALTER TABLE user_profile ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(255)",
            // orders table
            "ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_status VARCHAR(50)",
            // payments table
            "ALTER TABLE payments ADD COLUMN IF NOT EXISTS verified_by INT",
            "ALTER TABLE payments ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP NULL",
            // shipping_info table
            "ALTER TABLE shipping_info ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
            "ALTER TABLE shipping_info ADD COLUMN IF NOT EXISTS admin_notes TEXT",
            "ALTER TABLE shipping_info ADD COLUMN IF NOT EXISTS shipping_status VARCHAR(50)",
            // reviews table
            "ALTER TABLE reviews ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
            // inventory_log table
            "ALTER TABLE inventory_log ADD COLUMN IF NOT EXISTS old_stock INT DEFAULT 0",
            "ALTER TABLE inventory_log ADD COLUMN IF NOT EXISTS new_stock INT DEFAULT 0",
            "ALTER TABLE inventory_log ADD COLUMN IF NOT EXISTS changed_by INT",
            "ALTER TABLE inventory_log ADD COLUMN IF NOT EXISTS changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
        ];

        for (const sql of migrations) {
            try {
                await db.query(sql);
            } catch (e) {
                // Abaikan error jika tabel belum ada (akan dibuat saat schema.sql dijalankan)
                if (!e.code || !e.code.startsWith('ER_NO_SUCH_TABLE')) {
                    console.warn('Migration warning:', e.message);
                }
            }
        }

        // Sync order_status dari status yang ada
        try {
            await db.query("UPDATE orders SET order_status = status WHERE order_status IS NULL");
        } catch (e) { /* abaikan */ }

        // Sync shipping_status dari status yang ada
        try {
            await db.query("UPDATE shipping_info SET shipping_status = status WHERE shipping_status IS NULL");
        } catch (e) { /* abaikan */ }

        // Pastikan roles table ada
        try {
            await db.query("CREATE TABLE IF NOT EXISTS roles (id INT PRIMARY KEY AUTO_INCREMENT, role_name VARCHAR(50) NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)");
            await db.query("INSERT IGNORE INTO roles (id, role_name) VALUES (1, 'admin'), (2, 'member')");
        } catch (e) { /* abaikan */ }

        // Pastikan semua produk punya category_id
        try {
            await db.query("UPDATE products SET category_id = (SELECT id FROM categories LIMIT 1) WHERE category_id IS NULL AND (SELECT COUNT(*) FROM categories) > 0");
        } catch (e) { /* abaikan */ }

        console.log('Auto-migration selesai.');
    } catch (error) {
        console.warn('Auto-migration tidak dapat dijalankan sepenuhnya:', error.message);
    }
}

// ============================================
// SERVER STARTUP (LOCALHOST ONLY)
// ============================================
// On Vercel, the serverless runtime handles request routing.
// app.listen() and process.exit() must NOT run in serverless.

async function startServer() {
    // Verifikasi koneksi database sebelum menjalankan server
    console.log('Memverifikasi koneksi database...');
    const dbStatus = await db.testConnection();

    if (!dbStatus.success) {
        console.error('Tidak dapat terhubung ke database. Server tidak akan dijalankan.');
        console.error('Error:', dbStatus.error);
        process.exit(1);
    }

    // Jalankan auto-migration
    await autoMigrate();
    _migrationRan = true;

    app.listen(PORT, () => {
        console.log(`Server Lensique berjalan di http://localhost:${PORT}`);
        console.log(`Mode: ${process.env.NODE_ENV || 'development'}`);
    });
}

if (!IS_VERCEL) {
    startServer();
}

module.exports = app;