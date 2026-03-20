const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

/**
 * Definisi rute API untuk pesanan.
 * Semua rute ini akan memiliki prefix /api/orders (dikonfigurasi di app.js)
 */

// POST: Menjalankan proses checkout
router.post('/checkout', orderController.checkout);

// GET: Mengambil riwayat pesanan berdasarkan ID pengguna
router.get('/history/:userId', orderController.getHistory);

// GET: Mengambil detail item dari satu pesanan
router.get('/detail/:orderId', orderController.getOrderDetail);

module.exports = router;