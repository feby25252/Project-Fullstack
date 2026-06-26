// ============================================
// ROUTES KERANJANG BELANJA
// ============================================
// Endpoint untuk fitur keranjang belanja

const express = require('express');
const router = express.Router();
const { getCart, addToCart, updateCartItem, removeCartItem, clearCart } = require('./keranjangController');
const { verifyToken } = require('../../../middleware/auth');
const { validateRequired, validateTypes, validateRange, combine } = require('../../../middleware/validation');

// Validasi untuk tambah ke keranjang
const addToCartValidation = combine(
    validateRequired(['product_id']),
    validateTypes({ product_id: 'number', quantity: 'number' }),
    validateRange({ quantity: { min: 1 } })
);

// Validasi untuk update quantity
const updateCartValidation = combine(
    validateRequired(['quantity']),
    validateTypes({ quantity: 'number' }),
    validateRange({ quantity: { min: 1 } })
);

// Semua route memerlukan autentikasi
// GET /api/keranjang - Ambil keranjang user
router.get('/', verifyToken, getCart);

// POST /api/keranjang/tambah - Tambah item ke keranjang
router.post('/tambah', verifyToken, addToCartValidation, addToCart);

// PUT /api/keranjang/item/:itemId - Update quantity item
router.put('/item/:itemId', verifyToken, updateCartValidation, updateCartItem);

// DELETE /api/keranjang/item/:itemId - Hapus item dari keranjang
router.delete('/item/:itemId', verifyToken, removeCartItem);

// DELETE /api/keranjang/clear - Kosongkan keranjang
router.delete('/clear', verifyToken, clearCart);

module.exports = router;
