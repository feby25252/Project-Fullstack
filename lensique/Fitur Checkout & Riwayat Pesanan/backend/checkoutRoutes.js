// ============================================
// ROUTES CHECKOUT
// ============================================
// Endpoint untuk proses checkout

const express = require('express');
const router = express.Router();
const { processCheckout, getCheckoutData } = require('./checkoutController');
const { verifyToken } = require('../../../middleware/auth');
const { validateRequired, validateTypes, combine } = require('../../../middleware/validation');

// Validasi untuk proses checkout
const checkoutValidation = combine(
    validateRequired(['shipping_address', 'payment_method']),
    validateTypes({ shipping_address: 'string', payment_method: 'string', recipient_name: 'string', phone: 'string' })
);

// GET /api/checkout - Ambil data untuk halaman checkout
router.get('/', verifyToken, getCheckoutData);

// POST /api/checkout - Proses checkout
router.post('/', verifyToken, checkoutValidation, processCheckout);

module.exports = router;
