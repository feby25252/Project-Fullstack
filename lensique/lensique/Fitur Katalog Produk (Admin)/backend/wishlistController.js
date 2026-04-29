// ============================================
// CONTROLLER WISHLIST
// ============================================
// Menangani logika tambah/hapus/tampil wishlist user

const db = require('../../../config/database');

// ============================================
// GET WISHLIST - Ambil semua wishlist user
// ============================================
const getWishlist = async (req, res) => {
    try {
        const [items] = await db.query(
            `SELECT w.id, w.product_id, w.created_at,
                    p.name, p.base_price, p.stock,
                    c.name AS category_name,
                    (SELECT pi.image_url FROM product_images pi 
                     WHERE pi.product_id = p.id AND pi.is_primary = 1 LIMIT 1) AS image_url
             FROM wishlist w
             JOIN products p ON w.product_id = p.id
             LEFT JOIN categories c ON p.category_id = c.id
             WHERE w.user_id = ?
             ORDER BY w.created_at DESC`,
            [req.user.id]
        );

        res.json({
            success: true,
            data: items
        });

    } catch (error) {
        console.error('Get Wishlist Error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat mengambil wishlist.'
        });
    }
};

// ============================================
// TOGGLE WISHLIST - Tambah atau hapus dari wishlist
// ============================================
const toggleWishlist = async (req, res) => {
    try {
        const { product_id } = req.body;

        if (!product_id) {
            return res.status(400).json({
                success: false,
                message: 'Product ID wajib diisi.'
            });
        }

        // Cek apakah produk sudah ada di wishlist
        const [existing] = await db.query(
            'SELECT id FROM wishlist WHERE user_id = ? AND product_id = ?',
            [req.user.id, product_id]
        );

        if (existing.length > 0) {
            // Hapus dari wishlist
            await db.query(
                'DELETE FROM wishlist WHERE user_id = ? AND product_id = ?',
                [req.user.id, product_id]
            );

            return res.json({
                success: true,
                message: 'Produk dihapus dari wishlist.',
                action: 'removed'
            });
        } else {
            // Tambah ke wishlist
            await db.query(
                'INSERT INTO wishlist (user_id, product_id, created_at) VALUES (?, ?, NOW())',
                [req.user.id, product_id]
            );

            return res.json({
                success: true,
                message: 'Produk ditambahkan ke wishlist.',
                action: 'added'
            });
        }

    } catch (error) {
        console.error('Toggle Wishlist Error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan.'
        });
    }
};

// ============================================
// CEK WISHLIST STATUS - Apakah produk ada di wishlist
// ============================================
const checkWishlist = async (req, res) => {
    try {
        const { product_id } = req.params;

        const [result] = await db.query(
            'SELECT id FROM wishlist WHERE user_id = ? AND product_id = ?',
            [req.user.id, product_id]
        );

        res.json({
            success: true,
            isWishlisted: result.length > 0
        });

    } catch (error) {
        console.error('Check Wishlist Error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan.'
        });
    }
};

module.exports = { getWishlist, toggleWishlist, checkWishlist };
