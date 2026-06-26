// ============================================
// CONTROLLER KERANJANG BELANJA
// ============================================
// Menangani logika keranjang belanja
// Data dari tabel carts dan cart_items

const db = require('../../../config/database');

// ============================================
// GET KERANJANG - Ambil isi keranjang user
// ============================================
const getCart = async (req, res) => {
    try {
        // Cari atau buat keranjang untuk user ini
        let [carts] = await db.query(
            'SELECT id FROM carts WHERE user_id = ?',
            [req.user.id]
        );

        if (carts.length === 0) {
            // Buat keranjang baru jika belum ada
            const [result] = await db.query(
                'INSERT INTO carts (user_id, created_at) VALUES (?, NOW())',
                [req.user.id]
            );
            carts = [{ id: result.insertId }];
        }

        const cartId = carts[0].id;

        // Ambil item keranjang beserta data produk
        const [items] = await db.query(
            `SELECT ci.id, ci.product_id, ci.quantity, ci.price,
                    p.name, p.base_price, p.stock,
                    (SELECT pi.image_url FROM product_images pi 
                     WHERE pi.product_id = p.id AND pi.is_primary = 1 LIMIT 1) AS image_url
             FROM cart_items ci
             JOIN products p ON ci.product_id = p.id
             WHERE ci.cart_id = ?
             ORDER BY ci.id DESC`,
            [cartId]
        );

        // Hitung total harga
        const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        res.json({
            success: true,
            data: {
                cart_id: cartId,
                items: items,
                total: total,
                item_count: items.length
            }
        });

    } catch (error) {
        console.error('Get Cart Error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat mengambil keranjang.'
        });
    }
};

// ============================================
// TAMBAH KE KERANJANG
// ============================================
const addToCart = async (req, res) => {
    try {
        const { product_id, quantity = 1 } = req.body;

        if (!product_id) {
            return res.status(400).json({
                success: false,
                message: 'Product ID wajib diisi.'
            });
        }

        // Cek produk tersedia
        const [products] = await db.query(
            'SELECT id, base_price, stock FROM products WHERE id = ? AND is_active = 1',
            [product_id]
        );

        if (products.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Produk tidak ditemukan atau tidak aktif.'
            });
        }

        const product = products[0];

        // Cek stok
        if (product.stock < quantity) {
            return res.status(400).json({
                success: false,
                message: `Stok tidak mencukupi. Tersedia: ${product.stock}`
            });
        }

        // Cari atau buat keranjang
        let [carts] = await db.query(
            'SELECT id FROM carts WHERE user_id = ?',
            [req.user.id]
        );

        if (carts.length === 0) {
            const [result] = await db.query(
                'INSERT INTO carts (user_id, created_at) VALUES (?, NOW())',
                [req.user.id]
            );
            carts = [{ id: result.insertId }];
        }

        const cartId = carts[0].id;

        // Cek apakah produk sudah ada di keranjang
        const [existingItem] = await db.query(
            'SELECT id, quantity FROM cart_items WHERE cart_id = ? AND product_id = ?',
            [cartId, product_id]
        );

        if (existingItem.length > 0) {
            // Update quantity jika sudah ada
            const newQty = existingItem[0].quantity + parseInt(quantity);
            if (newQty > product.stock) {
                return res.status(400).json({
                    success: false,
                    message: `Stok tidak mencukupi. Tersedia: ${product.stock}`
                });
            }

            await db.query(
                'UPDATE cart_items SET quantity = ? WHERE id = ?',
                [newQty, existingItem[0].id]
            );
        } else {
            // Tambah item baru ke keranjang
            await db.query(
                'INSERT INTO cart_items (cart_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
                [cartId, product_id, parseInt(quantity), product.base_price]
            );
        }

        res.status(201).json({
            success: true,
            message: 'Produk berhasil ditambahkan ke keranjang.'
        });

    } catch (error) {
        console.error('Add to Cart Error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat menambah ke keranjang.'
        });
    }
};

// ============================================
// UPDATE QUANTITY ITEM KERANJANG
// ============================================
const updateCartItem = async (req, res) => {
    try {
        const { itemId } = req.params;
        const { quantity } = req.body;

        if (!quantity || quantity < 1) {
            return res.status(400).json({
                success: false,
                message: 'Quantity minimal 1.'
            });
        }

        // Ambil item keranjang
        const [items] = await db.query(
            `SELECT ci.*, p.stock FROM cart_items ci
             JOIN products p ON ci.product_id = p.id
             JOIN carts c ON ci.cart_id = c.id
             WHERE ci.id = ? AND c.user_id = ?`,
            [itemId, req.user.id]
        );

        if (items.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Item tidak ditemukan.'
            });
        }

        // Cek stok
        if (quantity > items[0].stock) {
            return res.status(400).json({
                success: false,
                message: `Stok tidak mencukupi. Tersedia: ${items[0].stock}`
            });
        }

        await db.query(
            'UPDATE cart_items SET quantity = ? WHERE id = ?',
            [parseInt(quantity), itemId]
        );

        res.json({
            success: true,
            message: 'Quantity berhasil diperbarui.'
        });

    } catch (error) {
        console.error('Update Cart Error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan.'
        });
    }
};

// ============================================
// HAPUS ITEM DARI KERANJANG
// ============================================
const removeCartItem = async (req, res) => {
    try {
        const { itemId } = req.params;

        // Pastikan item milik user yang login
        const [items] = await db.query(
            `SELECT ci.id FROM cart_items ci
             JOIN carts c ON ci.cart_id = c.id
             WHERE ci.id = ? AND c.user_id = ?`,
            [itemId, req.user.id]
        );

        if (items.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Item tidak ditemukan.'
            });
        }

        await db.query('DELETE FROM cart_items WHERE id = ?', [itemId]);

        res.json({
            success: true,
            message: 'Item berhasil dihapus dari keranjang.'
        });

    } catch (error) {
        console.error('Remove Cart Item Error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan.'
        });
    }
};

// ============================================
// KOSONGKAN KERANJANG
// ============================================
const clearCart = async (req, res) => {
    try {
        const [carts] = await db.query(
            'SELECT id FROM carts WHERE user_id = ?',
            [req.user.id]
        );

        if (carts.length > 0) {
            await db.query('DELETE FROM cart_items WHERE cart_id = ?', [carts[0].id]);
        }

        res.json({
            success: true,
            message: 'Keranjang berhasil dikosongkan.'
        });

    } catch (error) {
        console.error('Clear Cart Error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan.'
        });
    }
};

module.exports = { getCart, addToCart, updateCartItem, removeCartItem, clearCart };
