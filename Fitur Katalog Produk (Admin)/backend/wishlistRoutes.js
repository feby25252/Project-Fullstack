// ============================================
// ROUTES WISHLIST
// ============================================
// Endpoint untuk fitur wishlist (perlu login)

const express = require('express');
const router = express.Router();
const { getWishlist, toggleWishlist, checkWishlist } = require('./wishlistController');
const { verifyToken } = require('../../../middleware/auth');
const { validateRequired, validateTypes } = require('../../../middleware/validation');

// Validasi untuk toggle wishlist
const wishlistValidation = validateTypes({ product_id: 'number' });

// GET /api/wishlist - Ambil semua wishlist user
router.get('/', verifyToken, getWishlist);

// POST /api/wishlist/toggle - Tambah/hapus wishlist
router.post('/toggle', verifyToken, wishlistValidation, toggleWishlist);

// GET /api/wishlist/check/:product_id - Cek status wishlist
router.get('/check/:product_id', verifyToken, checkWishlist);

module.exports = router;
