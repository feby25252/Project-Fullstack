// ============================================
// CONTROLLER RIWAYAT PESANAN
// ============================================
// Menangani logika tampil pesanan user
// Data dari orders, order_items, payments, shipping_info

const db = require('../../../config/database');

// ============================================
// GET RIWAYAT PESANAN USER
// ============================================
const getOrders = async (req, res) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        let query = `
            SELECT o.*, 
                   (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) AS item_count,
                   p.payment_status,
                   COALESCE(s.shipping_status, s.status) AS shipping_status, s.tracking_number
            FROM orders o
            LEFT JOIN payments p ON o.id = p.order_id
            LEFT JOIN shipping_info s ON o.id = s.order_id
            WHERE o.user_id = ?
        `;
        let params = [req.user.id];

        // Filter berdasarkan status
        if (status) {
            query += ' AND o.status = ?';
            params.push(status);
        }

        query += ' ORDER BY o.created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        const [orders] = await db.query(query, params);

        // Hitung total pesanan
        const [countResult] = await db.query(
            'SELECT COUNT(*) as total FROM orders WHERE user_id = ?',
            [req.user.id]
        );

        res.json({
            success: true,
            data: orders,
            pagination: {
                total: countResult[0].total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(countResult[0].total / limit)
            }
        });

    } catch (error) {
        console.error('Get Orders Error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat mengambil riwayat pesanan.'
        });
    }
};

// ============================================
// GET DETAIL PESANAN
// ============================================
const getOrderDetail = async (req, res) => {
    try {
        const { id } = req.params;

        // Ambil data pesanan
        const [orders] = await db.query(
            'SELECT * FROM orders WHERE id = ? AND user_id = ?',
            [id, req.user.id]
        );

        if (orders.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Pesanan tidak ditemukan.'
            });
        }

        const order = orders[0];

        // Ambil item pesanan
        const [items] = await db.query(
            `SELECT oi.*, p.name, c.name AS category_name,
                    (SELECT pi.image_url FROM product_images pi 
                     WHERE pi.product_id = p.id AND pi.is_primary = 1 LIMIT 1) AS image_url
             FROM order_items oi
             JOIN products p ON oi.product_id = p.id
             LEFT JOIN categories c ON p.category_id = c.id
             WHERE oi.order_id = ?`,
            [id]
        );

        // Ambil data pembayaran
        const [payments] = await db.query(
            'SELECT * FROM payments WHERE order_id = ?',
            [id]
        );

        // Ambil info pengiriman
        const [shipping] = await db.query(
            'SELECT * FROM shipping_info WHERE order_id = ?',
            [id]
        );

        order.items = items;
        order.payment = payments.length > 0 ? payments[0] : null;
        order.shipping = shipping.length > 0 ? shipping[0] : null;

        res.json({
            success: true,
            data: order
        });

    } catch (error) {
        console.error('Get Order Detail Error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan.'
        });
    }
};

module.exports = { getOrders, getOrderDetail };
