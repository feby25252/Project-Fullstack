// ============================================
// CONTROLLER REVIEW PRODUK
// ============================================
// Menangani logika review produk oleh user
// Hanya user yang pernah membeli produk yang dapat mereview

const db = require('../config/database');

// ============================================
// GET REVIEWS BY PRODUCT ID - Public
// ============================================
const getProductReviews = async (req, res) => {
    try {
        const { id } = req.params;
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        // Ambil reviews dengan data user
        const [reviews] = await db.query(
            `SELECT r.id, r.user_id, r.rating, r.comment, r.created_at,
                    u.username,
                    up.avatar_url
             FROM reviews r
             LEFT JOIN users u ON r.user_id = u.id
             LEFT JOIN user_profile up ON r.user_id = up.user_id
             WHERE r.product_id = ?
             ORDER BY r.created_at DESC
             LIMIT ? OFFSET ?`,
            [id, parseInt(limit), parseInt(offset)]
        );

        // Hitung rata-rata rating
        const [avgResult] = await db.query(
            'SELECT AVG(rating) as avg_rating, COUNT(*) as total FROM reviews WHERE product_id = ?',
            [id]
        );

        res.json({
            success: true,
            data: {
                reviews: reviews,
                avg_rating: parseFloat(avgResult[0].avg_rating || 0).toFixed(1),
                total_reviews: avgResult[0].total
            }
        });

    } catch (error) {
        console.error('Get Product Reviews Error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat mengambil review.'
        });
    }
};

// ============================================
// CREATE REVIEW - Hanya untuk yang sudah beli
// ============================================
const createReview = async (req, res) => {
    try {
        const { product_id, rating, comment } = req.body;
        const userId = req.user.id;

        // Validasi input
        if (!product_id || !rating || !comment) {
            return res.status(400).json({
                success: false,
                message: 'Product ID, rating, dan comment wajib diisi.'
            });
        }

        // Validasi rating range
        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Rating harus antara 1 sampai 5.'
            });
        }

        // Cek apakah produk ada
        const [products] = await db.query('SELECT id FROM products WHERE id = ?', [product_id]);
        if (products.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Produk tidak ditemukan.'
            });
        }

        // Cek apakah user sudah pernah review produk ini
        const [existingReview] = await db.query(
            'SELECT id FROM reviews WHERE user_id = ? AND product_id = ?',
            [userId, product_id]
        );
        if (existingReview.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Anda sudah memberikan review untuk produk ini.'
            });
        }

        // Cek apakah user sudah pernah membeli produk ini dan pesanan sudah selesai
        const [purchases] = await db.query(
            `SELECT oi.id
             FROM order_items oi
             JOIN orders o ON oi.order_id = o.id
             WHERE o.user_id = ? AND oi.product_id = ? AND o.status = 'delivered'`,
            [userId, product_id]
        );

        if (purchases.length === 0) {
            return res.status(403).json({
                success: false,
                message: 'Anda hanya dapat mereview produk yang sudah dibeli dan pesanan sudah selesai.'
            });
        }

        // Simpan review
        await db.query(
            'INSERT INTO reviews (user_id, product_id, rating, comment, created_at) VALUES (?, ?, ?, ?, NOW())',
            [userId, product_id, rating, comment]
        );

        res.status(201).json({
            success: true,
            message: 'Review berhasil ditambahkan.'
        });

    } catch (error) {
        console.error('Create Review Error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat menambah review.'
        });
    }
};

// ============================================
// UPDATE REVIEW - Hanya pemilik review
// ============================================
const updateReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, comment } = req.body;
        const userId = req.user.id;

        // Validasi input
        if (!rating && !comment) {
            return res.status(400).json({
                success: false,
                message: 'Rating atau comment wajib diisi.'
            });
        }

        if (rating && (rating < 1 || rating > 5)) {
            return res.status(400).json({
                success: false,
                message: 'Rating harus antara 1 sampai 5.'
            });
        }

        // Cek apakah review ada dan milik user ini
        const [reviews] = await db.query(
            'SELECT * FROM reviews WHERE id = ? AND user_id = ?',
            [id, userId]
        );

        if (reviews.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Review tidak ditemukan atau Anda tidak memiliki akses.'
            });
        }

        // Update review
        const updates = [];
        const params = [];

        if (rating) {
            updates.push('rating = ?');
            params.push(rating);
        }
        if (comment !== undefined) {
            updates.push('comment = ?');
            params.push(comment);
        }
        updates.push('updated_at = NOW()');
        params.push(id);

        await db.query(
            `UPDATE reviews SET ${updates.join(', ')} WHERE id = ?`,
            params
        );

        res.json({
            success: true,
            message: 'Review berhasil diperbarui.'
        });

    } catch (error) {
        console.error('Update Review Error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat memperbarui review.'
        });
    }
};

// ============================================
// DELETE REVIEW - Hanya pemilik review
// ============================================
const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Cek apakah review ada dan milik user ini
        const [reviews] = await db.query(
            'SELECT id FROM reviews WHERE id = ? AND user_id = ?',
            [id, userId]
        );

        if (reviews.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Review tidak ditemukan atau Anda tidak memiliki akses.'
            });
        }

        await db.query('DELETE FROM reviews WHERE id = ?', [id]);

        res.json({
            success: true,
            message: 'Review berhasil dihapus.'
        });

    } catch (error) {
        console.error('Delete Review Error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat menghapus review.'
        });
    }
};

module.exports = {
    getProductReviews,
    createReview,
    updateReview,
    deleteReview
};
