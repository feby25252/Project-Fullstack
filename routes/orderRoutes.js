// ============================================
// ROUTES ORDERS (USER)
// ============================================
// Endpoint terpadu untuk checkout dan riwayat pesanan user
// Menggunakan controller yang sudah ada dari fitur checkout & pesanan

const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { validateRequired, validateTypes, combine } = require('../middleware/validation');

// Import controller checkout dan pesanan
const { processCheckout, getCheckoutData } = require('../lensique/Fitur Checkout & Riwayat Pesanan/backend/checkoutController');
const { getOrders, getOrderDetail } = require('../lensique/Fitur Checkout & Riwayat Pesanan/backend/pesananController');

// Validasi untuk proses checkout
const checkoutValidation = combine(
    validateRequired(['shipping_address', 'payment_method']),
    validateTypes({ shipping_address: 'string', payment_method: 'string', recipient_name: 'string', phone: 'string' })
);

// ============================================
// CHECKOUT
// ============================================

// GET /api/orders/checkout-data - Ambil data untuk halaman checkout
router.get('/checkout-data', verifyToken, getCheckoutData);

// POST /api/orders/checkout - Proses checkout
router.post('/checkout', verifyToken, checkoutValidation, processCheckout);

// ============================================
// RIWAYAT PESANAN
// ============================================

// GET /api/orders/history - Ambil semua pesanan user
router.get('/history', verifyToken, getOrders);

// GET /api/orders/:id - Detail pesanan user
router.get('/:id', verifyToken, getOrderDetail);

module.exports = router;
