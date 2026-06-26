// ============================================
// ROUTES KATALOG PRODUK
// ============================================
// Endpoint untuk menampilkan katalog produk (user)

const express = require('express');
const router = express.Router();
const { getAllProducts, getProductById, getCategories, addReview } = require('./katalogController');
const { verifyToken } = require('../../../middleware/auth');
const { validateRequired, validateTypes, validateRange, combine } = require('../../../middleware/validation');

// Validasi untuk tambah review
const reviewValidation = combine(
    validateRequired(['rating']),
    validateTypes({ rating: 'number', comment: 'string' }),
    validateRange({ rating: { min: 1, max: 5 } })
);

// GET /api/katalog/produk - Ambil semua produk (publik)
router.get('/produk', getAllProducts);

// GET /api/katalog/produk/:id - Ambil detail produk (publik)
router.get('/produk/:id', getProductById);

// GET /api/katalog/kategori - Ambil semua kategori (publik)
router.get('/kategori', getCategories);

// POST /api/katalog/review/:product_id - Tambah review (perlu login)
router.post('/review/:product_id', verifyToken, reviewValidation, addReview);

module.exports = router;
