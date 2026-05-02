// ============================================
// SERVER UTAMA - LENSIQUE E-COMMERCE OPTIK
// ============================================
// File ini adalah entry point utama aplikasi
// Menginisialisasi Express server dan semua route

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./config/database');
const { multerErrorHandler, validationErrorHandler, databaseErrorHandler, jwtErrorHandler, globalErrorHandler } = require('./middleware/errorHandler');

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
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
// ROUTE HALAMAN FRONTEND
// ============================================

// Halaman utama (Home)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Halaman Login
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'lensique', 'Fitur Autentikasi, Registrasi, & Profile User', 'frontend', 'login.html'));
});

// Halaman Register
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'lensique', 'Fitur Autentikasi, Registrasi, & Profile User', 'frontend', 'register.html'));
});

// Halaman Profile
app.get('/profile', (req, res) => {
    res.sendFile(path.join(__dirname, 'lensique', 'Fitur Autentikasi, Registrasi, & Profile User', 'frontend', 'profile.html'));
});

// Halaman Katalog Produk
app.get('/katalog', (req, res) => {
    res.sendFile(path.join(__dirname, 'lensique', 'Fitur Katalog Produk (Admin)', 'frontend', 'katalog.html'));
});

// Halaman Detail Produk
app.get('/produk/:id', (req, res) => {
    res.sendFile(path.join(__dirname, 'lensique', 'Fitur Katalog Produk (Admin)', 'frontend', 'detail-produk.html'));
});

// Halaman Admin Kelola Produk
app.get('/admin/produk', (req, res) => {
    res.sendFile(path.join(__dirname, 'lensique', 'Fitur Manajemen Produk (admin)', 'frontend', 'kelola-produk.html'));
});

// Halaman Admin Tambah/Edit Produk
app.get('/admin/produk/form', (req, res) => {
    res.sendFile(path.join(__dirname, 'lensique', 'Fitur Manajemen Produk (admin)', 'frontend', 'form-produk.html'));
});

// ============================================
// ROUTE HALAMAN ADMIN PANEL (BARU)
// ============================================

// Static files untuk admin panel
app.use('/admin', express.static(path.join(__dirname, 'public', 'admin')));

// Halaman Admin Login
app.get('/admin/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin', 'login.html'));
});

// Halaman Admin Dashboard
app.get('/admin/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin', 'dashboard.html'));
});

// Halaman Admin Users
app.get('/admin/users', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin', 'users.html'));
});

// Halaman Admin Products
app.get('/admin/products', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin', 'products.html'));
});

// Halaman Admin Reviews
app.get('/admin/reviews', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin', 'reviews.html'));
});

// Halaman Admin Orders
app.get('/admin/orders', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin', 'orders.html'));
});

// Halaman Admin Order Detail
app.get('/admin/orders/:id', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin', 'order-detail.html'));
});

// Halaman Keranjang
app.get('/keranjang', (req, res) => {
    res.sendFile(path.join(__dirname, 'lensique', 'Fitur Keranjang Belanja', 'frontend', 'keranjang.html'));
});

// Halaman Checkout
app.get('/checkout', (req, res) => {
    res.sendFile(path.join(__dirname, 'lensique', 'Fitur Checkout & Riwayat Pesanan', 'frontend', 'checkout.html'));
});

// Halaman Riwayat Pesanan
app.get('/pesanan', (req, res) => {
    res.sendFile(path.join(__dirname, 'lensique', 'Fitur Checkout & Riwayat Pesanan', 'frontend', 'riwayat-pesanan.html'));
});

// Halaman Detail Pesanan User
app.get('/user/orders', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'user', 'orders.html'));
});

app.get('/user/orders/:id', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'user', 'order-detail.html'));
});

// Halaman Wishlist
app.get('/wishlist', (req, res) => {
    res.sendFile(path.join(__dirname, 'lensique', 'Fitur Katalog Produk (Admin)', 'frontend', 'wishlist.html'));
});

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

async function startServer() {
    // Verifikasi koneksi database sebelum menjalankan server
    console.log('Memverifikasi koneksi database...');
    const dbStatus = await db.testConnection();

    if (!dbStatus.success) {
        console.error('Tidak dapat terhubung ke database. Server tidak akan dijalankan.');
        console.error('Error:', dbStatus.error);
        process.exit(1);
    }

    app.listen(PORT, () => {
        console.log(`Server Lensique berjalan di http://localhost:${PORT}`);
        console.log(`Mode: ${process.env.NODE_ENV || 'development'}`);
    });
}

startServer();

module.exports = app;
