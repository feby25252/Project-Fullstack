// ============================================
// CONTROLLER CHECKOUT
// ============================================
// Menangani logika checkout / buat pesanan baru
// Simpan ke orders, order_items, payments, shipping_info

const db = require('../../../config/database');

// ============================================
// PROSES CHECKOUT - Buat pesanan dari keranjang
// ============================================
const processCheckout = async (req, res) => {
    const { shipping_address, payment_method, recipient_name, phone } = req.body;

    // Validasi input sebelum memulai transaksi
    if (!shipping_address || !payment_method) {
        return res.status(400).json({
            success: false,
            message: 'Alamat pengiriman dan metode pembayaran wajib diisi.'
        });
    }

    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // Ambil keranjang user
        const [carts] = await connection.query(
            'SELECT id FROM carts WHERE user_id = ?',
            [req.user.id]
        );

        if (carts.length === 0) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: 'Keranjang kosong.'
            });
        }

        const cartId = carts[0].id;

        // Ambil item keranjang
        const [cartItems] = await connection.query(
            `SELECT ci.*, p.name, p.base_price, p.stock 
             FROM cart_items ci
             JOIN products p ON ci.product_id = p.id
             WHERE ci.cart_id = ?`,
            [cartId]
        );

        if (cartItems.length === 0) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: 'Keranjang kosong. Tambahkan produk terlebih dahulu.'
            });
        }

        // Validasi stok semua item
        for (const item of cartItems) {
            if (item.stock < item.quantity) {
                await connection.rollback();
                return res.status(400).json({
                    success: false,
                    message: `Stok ${item.name} tidak mencukupi. Tersedia: ${item.stock}`
                });
            }
        }

        // Hitung total
        const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        // Generate nomor order unik (ORD-YYYYMMDD-XXXXX)
        const now = new Date();
        const dateStr = now.getFullYear().toString() +
            String(now.getMonth() + 1).padStart(2, '0') +
            String(now.getDate()).padStart(2, '0');
        const randomStr = String(Math.floor(Math.random() * 100000)).padStart(5, '0');
        const orderNumber = `ORD-${dateStr}-${randomStr}`;

        // Simpan pesanan ke tabel orders
        const [orderResult] = await connection.query(
            `INSERT INTO orders (user_id, order_number, total_amount, status, shipping_address, payment_method, created_at) 
             VALUES (?, ?, ?, 'pending', ?, ?, NOW())`,
            [req.user.id, orderNumber, totalAmount, shipping_address, payment_method]
        );

        const orderId = orderResult.insertId;

        // Simpan detail item pesanan ke order_items
        for (const item of cartItems) {
            const subtotal = item.price * item.quantity;
            await connection.query(
                'INSERT INTO order_items (order_id, product_id, quantity, price, subtotal) VALUES (?, ?, ?, ?, ?)',
                [orderId, item.product_id, item.quantity, item.price, subtotal]
            );

            // Kurangi stok produk
            await connection.query(
                'UPDATE products SET stock = stock - ? WHERE id = ?',
                [item.quantity, item.product_id]
            );

            // Catat perubahan stok ke inventory_log
            const newStock = item.stock - item.quantity;
            await connection.query(
                `INSERT INTO inventory_log 
                 (product_id, quantity_change, type, note, old_stock, new_stock, changed_by, changed_at, created_at) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
                [item.product_id, -item.quantity, 'out', `Pesanan ${orderNumber}`, item.stock, newStock, req.user.id]
            );
        }

        // Simpan data pembayaran ke tabel payments
        await connection.query(
            `INSERT INTO payments (order_id, payment_method, payment_status, amount, created_at) 
             VALUES (?, ?, 'pending', ?, NOW())`,
            [orderId, payment_method, totalAmount]
        );

        // Simpan info pengiriman ke tabel shipping_info
        await connection.query(
            `INSERT INTO shipping_info (order_id, courier, tracking_number, status, shipping_status, created_at) 
             VALUES (?, ?, ?, 'pending', 'pending', NOW())`,
            [orderId, 'Belum ditentukan', null]
        );

        // Kosongkan keranjang setelah checkout berhasil
        await connection.query('DELETE FROM cart_items WHERE cart_id = ?', [cartId]);

        await connection.commit();

        res.status(201).json({
            success: true,
            message: 'Pesanan berhasil dibuat!',
            data: {
                order_id: orderId,
                order_number: orderNumber,
                total_amount: totalAmount
            }
        });

    } catch (error) {
        await connection.rollback();
        console.error('Checkout Error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat memproses checkout.'
        });
    } finally {
        connection.release();
    }
};

// ============================================
// GET DATA UNTUK HALAMAN CHECKOUT
// ============================================
const getCheckoutData = async (req, res) => {
    try {
        // Ambil keranjang
        const [carts] = await db.query(
            'SELECT id FROM carts WHERE user_id = ?',
            [req.user.id]
        );

        if (carts.length === 0) {
            return res.json({ success: true, data: { items: [], total: 0 } });
        }

        // Ambil item keranjang
        const [items] = await db.query(
            `SELECT ci.*, p.name, p.base_price, p.stock,
                    (SELECT pi.image_url FROM product_images pi 
                     WHERE pi.product_id = p.id AND pi.is_primary = 1 LIMIT 1) AS image_url
             FROM cart_items ci
             JOIN products p ON ci.product_id = p.id
             WHERE ci.cart_id = ?`,
            [carts[0].id]
        );

        const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        // Ambil profil user untuk auto-fill alamat
        const [profiles] = await db.query(
            'SELECT full_name, phone, address FROM user_profile WHERE user_id = ?',
            [req.user.id]
        );

        res.json({
            success: true,
            data: {
                items: items,
                total: total,
                profile: profiles.length > 0 ? profiles[0] : null
            }
        });

    } catch (error) {
        console.error('Get Checkout Data Error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan.'
        });
    }
};

module.exports = { processCheckout, getCheckoutData };
