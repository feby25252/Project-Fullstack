// ============================================
// ROUTES REVIEW PRODUK
// ============================================
// Endpoint publik untuk review produk

const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { validateRequired, validateTypes, validateRange, combine } = require('../middleware/validation');
const reviewController = require('../controllers/reviewController');

// Validasi untuk tambah review
const reviewValidation = combine(
    validateRequired(['product_id', 'rating', 'comment']),
    validateTypes({ product_id: 'number', rating: 'number', comment: 'string' }),
    validateRange({ rating: { min: 1, max: 5 } })
);

// GET /api/products/:id/reviews - Ambil review produk (publik)
router.get('/products/:id/reviews', reviewController.getProductReviews);

// POST /api/reviews - Tambah review (perlu login)
router.post('/reviews', verifyToken, reviewValidation, reviewController.createReview);

// PUT /api/reviews/:id - Edit review sendiri (perlu login)
router.put('/reviews/:id', verifyToken, reviewController.updateReview);

// DELETE /api/reviews/:id - Hapus review sendiri (perlu login)
router.delete('/reviews/:id', verifyToken, reviewController.deleteReview);

module.exports = router;
