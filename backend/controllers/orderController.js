const db = require('../config/db');

/**
 * Controller untuk mengelola fitur Checkout dan Riwayat Pesanan.
 */
const orderController = {
    
    // 1. Proses Checkout (Sesuai Sequence Diagram)
    checkout: async (req, res) => {
        const { userId, shippingAddress, paymentMethod } = req.body;
        let connection;

        try {
            // Mendapatkan koneksi dari pool untuk memulai transaksi
            connection = await db.getConnection();
            await connection.beginTransaction();

            // A. Ambil item dari keranjang belanja pengguna
            const [cartItems] = await connection.execute(
                `SELECT ci.*, p.base_price, p.product_name, p.current_stock 
                 FROM cart_items ci 
                 JOIN products p ON ci.product_id = p.product_id 
                 JOIN carts c ON ci.cart_id = c.cart_id 
                 WHERE c.user_id = ?`,
                [userId]
            );

            if (cartItems.length === 0) {
                throw new Error('Keranjang belanja Anda kosong.');
            }

            // B. Validasi stok dan hitung total harga
            let totalAmount = 0;
            for (const item of cartItems) {
                if (item.current_stock < item.quantity) {
                    throw new Error(`Stok produk ${item.product_name} tidak mencukupi.`);
                }
                totalAmount += item.base_price * item.quantity;
            }

            // C. Simpan data ke tabel 'orders'
            const orderNumber = `OPT-${Date.now()}-${userId}`;
            const [orderResult] = await connection.execute(
                `INSERT INTO orders (user_id, order_number, status, total_amount, shipping_address, payment_method, created_at) 
                 VALUES (?, ?, 'Pending', ?, ?, ?, NOW())`,
                [userId, orderNumber, totalAmount, shippingAddress, paymentMethod]
            );
            const orderId = orderResult.insertId;

            // D. Pindahkan item ke 'order_items' dan kurangi stok produk
            for (const item of cartItems) {
                // Simpan detail item pesanan
                await connection.execute(
                    `INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price) 
                     VALUES (?, ?, ?, ?, ?)`,
                    [orderId, item.product_id, item.quantity, item.base_price, (item.base_price * item.quantity)]
                );

                // Update stok di tabel products
                await connection.execute(
                    `UPDATE products SET current_stock = current_stock - ? WHERE product_id = ?`,
                    [item.quantity, item.product_id]
                );
            }

            // E. Hapus item dari keranjang (Clear Cart)
            await connection.execute(
                `DELETE ci FROM cart_items ci 
                 JOIN carts c ON ci.cart_id = c.cart_id 
                 WHERE c.user_id = ?`,
                [userId]
            );

            // Commit semua perubahan jika berhasil
            await connection.commit();

            res.status(201).json({
                success: true,
                message: 'Pesanan berhasil dibuat!',
                data: { orderId, orderNumber, totalAmount }
            });

        } catch (error) {
            // Batalkan semua perubahan jika terjadi error (Rollback)
            if (connection) await connection.rollback();
            res.status(400).json({ success: false, message: error.message });
        } finally {
            if (connection) connection.release();
        }
    },

    // 2. Mengambil Riwayat Pesanan (Sesuai Tabel Sederhana di Gambar)
    getHistory: async (req, res) => {
        const { userId } = req.params;

        try {
            const [orders] = await db.execute(
                `SELECT order_id, order_number, status, total_amount, created_at 
                 FROM orders 
                 WHERE user_id = ? 
                 ORDER BY created_at DESC`,
                [userId]
            );

            res.status(200).json({
                success: true,
                data: orders
            });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Gagal mengambil riwayat pesanan.' });
        }
    },

    // 3. Mengambil Detail Pesanan Tertentu
    getOrderDetail: async (req, res) => {
        const { orderId } = req.params;

        try {
            const [items] = await db.execute(
                `SELECT oi.*, p.product_name, p.sku 
                 FROM order_items oi 
                 JOIN products p ON oi.product_id = p.product_id 
                 WHERE oi.order_id = ?`,
                [orderId]
            );

            res.status(200).json({ success: true, data: items });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Gagal mengambil detail pesanan.' });
        }
    }
};

module.exports = orderController;