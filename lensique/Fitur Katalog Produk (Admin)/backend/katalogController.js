// ============================================
// CONTROLLER KATALOG PRODUK
// ============================================
// Menangani logika tampil katalog produk
// Data dari tabel products, product_images, categories

const db = require('../../../config/database');

// ============================================
// GET SEMUA PRODUK - Dengan filter & paginasi
// ============================================
const getAllProducts = async (req, res) => {
    try {
        const { category, search, sort, limit = 12, page = 1 } = req.query;
        const offset = (page - 1) * limit;

        let query = `
            SELECT p.id, p.name, p.slug, p.description, p.base_price, p.stock,
                   p.category_id, p.is_active, p.created_at,
                   c.name AS category_name,
                   (SELECT pi.image_url FROM product_images pi 
                    WHERE pi.product_id = p.id AND pi.is_primary = 1 LIMIT 1) AS image_url
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.is_active = 1
        `;
        let params = [];

        // Filter berdasarkan kategori
        if (category) {
            query += ' AND p.category_id = ?';
            params.push(category);
        }

        // Filter berdasarkan pencarian nama
        if (search) {
            query += ' AND (p.name LIKE ? OR p.description LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        // Pengurutan
        switch (sort) {
            case 'price_asc':
                query += ' ORDER BY p.base_price ASC';
                break;
            case 'price_desc':
                query += ' ORDER BY p.base_price DESC';
                break;
            case 'name_asc':
                query += ' ORDER BY p.name ASC';
                break;
            case 'oldest':
                query += ' ORDER BY p.created_at ASC';
                break;
            default:
                query += ' ORDER BY p.created_at DESC'; // Terbaru
        }

        // Hitung total data untuk paginasi
        const countQuery = query.replace(/SELECT .+ FROM/, 'SELECT COUNT(*) as total FROM').replace(/ORDER BY .+/, '');
        const [countResult] = await db.query(countQuery, params);
        const total = countResult[0].total;

        // Tambahkan limit dan offset
        query += ' LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        const [products] = await db.query(query, params);

        res.json({
            success: true,
            data: products,
            pagination: {
                total: total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Get Products Error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat mengambil produk.'
        });
    }
};

// ============================================
// GET DETAIL PRODUK - Berdasarkan ID
// ============================================
const getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        // Ambil data produk + kategori
        const [products] = await db.query(
            `SELECT p.*, c.name AS category_name
             FROM products p
             LEFT JOIN categories c ON p.category_id = c.id
             WHERE p.id = ?`,
            [id]
        );

        if (products.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Produk tidak ditemukan.'
            });
        }

        // Ambil semua gambar produk
        const [images] = await db.query(
            'SELECT * FROM product_images WHERE product_id = ? ORDER BY is_primary DESC, sort_order ASC',
            [id]
        );

        // Ambil review produk
        const [reviews] = await db.query(
            `SELECT r.*, u.username, up.avatar
             FROM reviews r
             LEFT JOIN users u ON r.user_id = u.id
             LEFT JOIN user_profile up ON r.user_id = up.user_id
             WHERE r.product_id = ?
             ORDER BY r.created_at DESC`,
            [id]
        );

        // Hitung rata-rata rating
        const avgRating = reviews.length > 0
            ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
            : 0;

        const product = products[0];
        product.images = images;
        product.reviews = reviews;
        product.avg_rating = parseFloat(avgRating);
        product.review_count = reviews.length;

        res.json({
            success: true,
            data: product
        });

    } catch (error) {
        console.error('Get Product Detail Error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat mengambil detail produk.'
        });
    }
};

// ============================================
// GET SEMUA KATEGORI
// ============================================
const getCategories = async (req, res) => {
    try {
        const [categories] = await db.query(
            'SELECT * FROM categories ORDER BY name ASC'
        );

        res.json({
            success: true,
            data: categories
        });

    } catch (error) {
        console.error('Get Categories Error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat mengambil kategori.'
        });
    }
};

// ============================================
// TAMBAH REVIEW PRODUK
// ============================================
const addReview = async (req, res) => {
    try {
        const { product_id } = req.params;
        const { rating, comment } = req.body;

        // Validasi rating
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Rating harus antara 1 sampai 5.'
            });
        }

        // Cek apakah user sudah review produk ini
        const [existing] = await db.query(
            'SELECT id FROM reviews WHERE user_id = ? AND product_id = ?',
            [req.user.id, product_id]
        );

        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Anda sudah memberikan review untuk produk ini.'
            });
        }

        await db.query(
            'INSERT INTO reviews (user_id, product_id, rating, comment, created_at) VALUES (?, ?, ?, ?, NOW())',
            [req.user.id, product_id, rating, comment]
        );

        res.status(201).json({
            success: true,
            message: 'Review berhasil ditambahkan.'
        });

    } catch (error) {
        console.error('Add Review Error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat menambah review.'
        });
    }
};

module.exports = { getAllProducts, getProductById, getCategories, addReview };
