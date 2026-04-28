// ============================================
// CONTROLLER ADMIN DASHBOARD & MANAGEMENT
// ============================================
// Menangani statistik dashboard dan operasi admin lainnya
// Termasuk manajemen review

const db = require('../config/database');

// ============================================
// GET DASHBOARD STATS - Ringkasan data
// ============================================
const getDashboardStats = async (req, res) => {
    try {
        // Total users
        const [usersCount] = await db.query('SELECT COUNT(*) as total FROM users');

        // Total products
        const [productsCount] = await db.query('SELECT COUNT(*) as total FROM products');

        // Total orders
        const [ordersCount] = await db.query('SELECT COUNT(*) as total FROM orders');

        // Total reviews
        const [reviewsCount] = await db.query('SELECT COUNT(*) as total FROM reviews');

        // Total wishlist
        const [wishlistCount] = await db.query('SELECT COUNT(*) as total FROM wishlist');

        // Low stock products (stok <= 5)
        const [lowStock] = await db.query(
            `SELECT p.id, p.name, p.stock, c.name AS category_name
             FROM products p
             LEFT JOIN categories c ON p.category_id = c.id
             WHERE p.stock <= 5 AND p.is_active = 1
             ORDER BY p.stock ASC
             LIMIT 10`
        );

        // Recent orders
        const [recentOrders] = await db.query(
            `SELECT o.*, u.username
             FROM orders o
             LEFT JOIN users u ON o.user_id = u.id
             ORDER BY o.created_at DESC
             LIMIT 5`
        );

        res.json({
            success: true,
            data: {
                total_users: usersCount[0].total,
                total_products: productsCount[0].total,
                total_orders: ordersCount[0].total,
                total_reviews: reviewsCount[0].total,
                total_wishlist: wishlistCount[0].total,
                low_stock_products: lowStock,
                recent_orders: recentOrders
            }
        });

    } catch (error) {
        console.error('Dashboard Stats Error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat mengambil statistik dashboard.'
        });
    }
};

// ============================================
// GET SEMUA REVIEW - Untuk admin
// ============================================
const getAllReviews = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        const [reviews] = await db.query(
            `SELECT r.*, u.username, up.avatar_url, p.name AS product_name
             FROM reviews r
             LEFT JOIN users u ON r.user_id = u.id
             LEFT JOIN user_profile up ON r.user_id = up.user_id
             LEFT JOIN products p ON r.product_id = p.id
             ORDER BY r.created_at DESC
             LIMIT ? OFFSET ?`,
            [parseInt(limit), parseInt(offset)]
        );

        const [countResult] = await db.query('SELECT COUNT(*) as total FROM reviews');

        res.json({
            success: true,
            data: reviews,
            pagination: {
                total: countResult[0].total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(countResult[0].total / limit)
            }
        });

    } catch (error) {
        console.error('Get All Reviews Error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat mengambil data review.'
        });
    }
};

// ============================================
// HAPUS REVIEW - Oleh admin
// ============================================
const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;

        const [existing] = await db.query('SELECT id FROM reviews WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Review tidak ditemukan.'
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
    getDashboardStats,
    getAllReviews,
    deleteReview
};
