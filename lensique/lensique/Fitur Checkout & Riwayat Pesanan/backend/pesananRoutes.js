// ============================================
// ROUTES RIWAYAT PESANAN
// ============================================
// Endpoint untuk riwayat pesanan user

const express = require('express');
const router = express.Router();
const { getOrders, getOrderDetail } = require('./pesananController');
const { verifyToken } = require('../../../middleware/auth');

// GET /api/pesanan - Ambil semua pesanan user
router.get('/', verifyToken, getOrders);

// GET /api/pesanan/:id - Detail pesanan
router.get('/:id', verifyToken, getOrderDetail);

module.exports = router;
