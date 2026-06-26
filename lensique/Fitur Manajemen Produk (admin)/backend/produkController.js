// ============================================
// CONTROLLER MANAJEMEN PRODUK (ADMIN)
// ============================================
// Menangani CRUD produk oleh admin
// Termasuk upload gambar dan update stok

const db = require('../../../config/database');
const path = require('path');
const fs = require('fs');

// ============================================
// GET SEMUA PRODUK (ADMIN) - Dengan paginasi
// ============================================
const getAllProductsAdmin = async (req, res) => {
    try {
        const { search, category, page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        let query = `
            SELECT p.*, c.name AS category_name,
                   (SELECT pi.image_url FROM product_images pi 
                    WHERE pi.product_id = p.id AND pi.is_primary = 1 LIMIT 1) AS image_url
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE 1=1
        `;
        let params = [];

        if (search) {
            query += ' AND (p.name LIKE ? OR p.description LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        if (category) {
            query += ' AND p.category_id = ?';
            params.push(category);
        }

        query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        const [products] = await db.query(query, params);

        // Hitung total
        const [countResult] = await db.query(
            'SELECT COUNT(*) as total FROM products',
            []
        );

        res.json({
            success: true,
            data: products,
            pagination: {
                total: countResult[0].total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(countResult[0].total / limit)
            }
        });

    } catch (error) {
        console.error('Get Products Admin Error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat mengambil data produk.'
        });
    }
};

// ============================================
// GET DETAIL PRODUK (ADMIN)
// ============================================
const getProductByIdAdmin = async (req, res) => {
    try {
        const { id } = req.params;

        const [products] = await db.query(
            'SELECT p.*, c.name AS category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = ?',
            [id]
        );

        if (products.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Produk tidak ditemukan.'
            });
        }

        // Ambil gambar produk
        const [images] = await db.query(
            'SELECT * FROM product_images WHERE product_id = ? ORDER BY is_primary DESC',
            [id]
        );

        const product = products[0];
        product.images = images;

        res.json({
            success: true,
            data: product
        });

    } catch (error) {
        console.error('Get Product Admin Error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan.'
        });
    }
};

// ============================================
// TAMBAH PRODUK BARU
// ============================================
const createProduct = async (req, res) => {
    try {
        const { name, description, base_price, stock, category_id, is_active } = req.body;

        // Validasi input wajib
        if (!name || !base_price) {
            return res.status(400).json({
                success: false,
                message: 'Nama produk dan harga wajib diisi.'
            });
        }

        // Validasi category_id: pastikan kategori ada di database
        let validCategoryId = null;
        if (category_id && parseInt(category_id) > 0) {
            const [catCheck] = await db.query('SELECT id FROM categories WHERE id = ?', [parseInt(category_id)]);
            if (catCheck.length > 0) {
                validCategoryId = catCheck[0].id;
            }
        }

        // Buat slug dari nama produk
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

        // Simpan produk ke database
        const [result] = await db.query(
            `INSERT INTO products (name, slug, description, base_price, stock, category_id, is_active, created_at) 
             VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
            [name, slug, description, parseFloat(base_price), parseInt(stock) || 0, validCategoryId, is_active !== undefined ? is_active : 1]
        );

        const productId = result.insertId;

        // Upload gambar jika ada
        if (req.files && req.files.length > 0) {
            for (let i = 0; i < req.files.length; i++) {
                const imageUrl = '/uploads/products/' + req.files[i].filename;
                await db.query(
                    'INSERT INTO product_images (product_id, image_url, is_primary, sort_order) VALUES (?, ?, ?, ?)',
                    [productId, imageUrl, i === 0 ? 1 : 0, i]
                );
            }
        }

        // Catat ke inventory_log jika ada stok awal
        if (stock && parseInt(stock) > 0) {
            const adminId = req.user ? req.user.id : null;
            await db.query(
                `INSERT INTO inventory_log 
                 (product_id, quantity_change, type, note, old_stock, new_stock, changed_by, changed_at, created_at) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
                [productId, parseInt(stock), 'in', 'Stok awal produk baru', 0, parseInt(stock), adminId]
            );
        }

        res.status(201).json({
            success: true,
            message: 'Produk berhasil ditambahkan.',
            data: { id: productId }
        });

    } catch (error) {
        console.error('Create Product Error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat menambah produk.'
        });
    }
};

// ============================================
// UPDATE PRODUK
// ============================================
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, base_price, stock, category_id, is_active } = req.body;

        // Cek produk ada
        const [existing] = await db.query('SELECT * FROM products WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Produk tidak ditemukan.'
            });
        }

        const oldProduct = existing[0];
        const slug = name ? name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : oldProduct.slug;

        // Validasi category_id jika diberikan
        let finalCategoryId = oldProduct.category_id;
        if (category_id !== undefined && category_id !== '') {
            const parsedCatId = parseInt(category_id);
            if (parsedCatId > 0) {
                const [catCheck] = await db.query('SELECT id FROM categories WHERE id = ?', [parsedCatId]);
                if (catCheck.length > 0) {
                    finalCategoryId = catCheck[0].id;
                }
            }
        }

        // Update data produk
        await db.query(
            `UPDATE products SET name = ?, slug = ?, description = ?, base_price = ?, 
             stock = ?, category_id = ?, is_active = ?, updated_at = NOW() WHERE id = ?`,
            [
                name || oldProduct.name,
                slug,
                description !== undefined ? description : oldProduct.description,
                base_price ? parseFloat(base_price) : oldProduct.base_price,
                stock !== undefined ? parseInt(stock) : oldProduct.stock,
                finalCategoryId,
                is_active !== undefined ? is_active : oldProduct.is_active,
                id
            ]
        );

        // Upload gambar baru jika ada
        if (req.files && req.files.length > 0) {
            for (let i = 0; i < req.files.length; i++) {
                const imageUrl = '/uploads/products/' + req.files[i].filename;
                await db.query(
                    'INSERT INTO product_images (product_id, image_url, is_primary, sort_order) VALUES (?, ?, ?, ?)',
                    [id, imageUrl, 0, i + 10]
                );
            }
        }

        // Catat perubahan stok ke inventory_log
        if (stock !== undefined && parseInt(stock) !== oldProduct.stock) {
            const change = parseInt(stock) - oldProduct.stock;
            const adminId = req.user ? req.user.id : null;
            await db.query(
                `INSERT INTO inventory_log 
                 (product_id, quantity_change, type, note, old_stock, new_stock, changed_by, changed_at, created_at) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
                [id, change, change > 0 ? 'in' : 'out', `Update stok oleh admin (${oldProduct.stock} -> ${stock})`, oldProduct.stock, parseInt(stock), adminId]
            );
        }

        res.json({
            success: true,
            message: 'Produk berhasil diperbarui.'
        });

    } catch (error) {
        console.error('Update Product Error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat mengubah produk.'
        });
    }
};

// ============================================
// HAPUS PRODUK
// ============================================
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        // Hapus gambar terkait
        const [images] = await db.query('SELECT image_url FROM product_images WHERE product_id = ?', [id]);
        for (const img of images) {
            const filePath = path.join(__dirname, '..', '..', '..', img.image_url);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        // Hapus data terkait
        await db.query('DELETE FROM product_images WHERE product_id = ?', [id]);
        await db.query('DELETE FROM inventory_log WHERE product_id = ?', [id]);
        await db.query('DELETE FROM reviews WHERE product_id = ?', [id]);
        await db.query('DELETE FROM wishlist WHERE product_id = ?', [id]);
        await db.query('DELETE FROM products WHERE id = ?', [id]);

        res.json({
            success: true,
            message: 'Produk berhasil dihapus.'
        });

    } catch (error) {
        console.error('Delete Product Error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat menghapus produk.'
        });
    }
};

// ============================================
// HAPUS GAMBAR PRODUK
// ============================================
const deleteProductImage = async (req, res) => {
    try {
        const { imageId } = req.params;

        const [images] = await db.query('SELECT * FROM product_images WHERE id = ?', [imageId]);
        if (images.length === 0) {
            return res.status(404).json({ success: false, message: 'Gambar tidak ditemukan.' });
        }

        // Hapus file fisik
        const filePath = path.join(__dirname, '..', '..', '..', images[0].image_url);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        await db.query('DELETE FROM product_images WHERE id = ?', [imageId]);

        res.json({ success: true, message: 'Gambar berhasil dihapus.' });

    } catch (error) {
        console.error('Delete Image Error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan.' });
    }
};

// ============================================
// GET KATEGORI (ADMIN)
// ============================================
const getCategories = async (req, res) => {
    try {
        const [categories] = await db.query('SELECT * FROM categories ORDER BY name ASC');
        res.json({ success: true, data: categories });
    } catch (error) {
        console.error('Get Categories Error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan.' });
    }
};

module.exports = {
    getAllProductsAdmin, getProductByIdAdmin, createProduct,
    updateProduct, deleteProduct, deleteProductImage, getCategories
};
