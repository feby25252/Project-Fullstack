// ============================================
// CONTROLLER ORDER MANAGEMENT (ADMIN)
// ============================================
// Menangani logika manajemen pesanan untuk admin
// Admin dapat melihat, memperbarui status pesanan, pembayaran, dan pengiriman

const db = require('../config/database');

// ============================================
// GET SEMUA PESANAN - Admin list dengan filter
// ============================================
const getAllOrdersAdmin = async (req, res) => {
    try {
        const {
            status,
            payment_status,
            shipping_status,
            search,
            page = 1,
            limit = 10
        } = req.query;

        const offset = (page - 1) * limit;

        let query = `
            SELECT o.id, o.order_number, o.total_amount, o.status, o.order_status,
                   o.shipping_address, o.payment_method, o.created_at, o.updated_at,
                   u.id AS user_id, u.username, u.email,
                   up.full_name,
                   p.payment_status, p.verified_at,
                   COALESCE(s.shipping_status, s.status) AS shipping_status, s.tracking_number, s.courier
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            LEFT JOIN user_profile up ON u.id = up.user_id
            LEFT JOIN payments p ON o.id = p.order_id
            LEFT JOIN shipping_info s ON o.id = s.order_id
            WHERE 1=1
        `;
        let params = [];

        // Filter berdasarkan status pesanan
        if (status) {
            query += ' AND (o.status = ? OR o.order_status = ?)';
            params.push(status, status);
        }

        // Filter berdasarkan status pembayaran
        if (payment_status) {
            query += ' AND p.payment_status = ?';
            params.push(payment_status);
        }

        // Filter berdasarkan status pengiriman
        if (shipping_status) {
            query += ' AND s.status = ?';
            params.push(shipping_status);
        }

        // Pencarian berdasarkan nomor order, username, atau email
        if (search) {
            query += ' AND (o.order_number LIKE ? OR u.username LIKE ? OR u.email LIKE ?)';
            const like = `%${search}%`;
            params.push(like, like, like);
        }

        // Hitung total untuk paginasi
        const countQuery = query.replace(/SELECT .+ FROM/, 'SELECT COUNT(*) as total FROM').replace(/ORDER BY .+/, '');
        const [countResult] = await db.query(countQuery, params);
        const total = countResult[0].total;

        query += ' ORDER BY o.created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        const [orders] = await db.query(query, params);

        res.json({
            success: true,
            data: orders,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Get All Orders Admin Error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat mengambil daftar pesanan.'
        });
    }
};

// ============================================
// GET DETAIL PESANAN - Admin view detail
// ============================================
const getOrderByIdAdmin = async (req, res) => {
    try {
        const { id } = req.params;

        // Ambil data pesanan + user
        const [orders] = await db.query(
            `SELECT o.*, u.username, u.email, up.full_name
             FROM orders o
             LEFT JOIN users u ON o.user_id = u.id
             LEFT JOIN user_profile up ON u.id = up.user_id
             WHERE o.id = ?`,
            [id]
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
            `SELECT oi.*, p.name, p.base_price, c.name AS category_name,
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
            `SELECT p.*, u.username as verified_by_name
             FROM payments p
             LEFT JOIN users u ON p.verified_by = u.id
             WHERE p.order_id = ?`,
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
        console.error('Get Order Detail Admin Error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat mengambil detail pesanan.'
        });
    }
};

// ============================================
// UPDATE STATUS PESANAN - Admin update
// ============================================

// Map admin order status values to valid ENUM values for orders.status column
const ORDER_STATUS_ENUM_MAP = {
    'pending': 'pending',
    'paid': 'processing',
    'processing': 'processing',
    'packed': 'processing',
    'shipped': 'shipped',
    'delivered': 'delivered',
    'cancelled': 'cancelled'
};

// Map admin shipping status values to valid ENUM values for shipping_info.status column
const SHIPPING_STATUS_ENUM_MAP = {
    'waiting': 'pending',
    'pending': 'pending',
    'sent': 'shipped',
    'shipped': 'shipped',
    'in_transit': 'in_transit',
    'received': 'delivered',
    'delivered': 'delivered'
};

const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            order_status,
            payment_status,
            shipping_status,
            tracking_number,
            courier,
            admin_notes
        } = req.body;

        const adminId = req.user.id;

        // Cek apakah pesanan ada
        const [orders] = await db.query('SELECT id, status FROM orders WHERE id = ?', [id]);
        if (orders.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Pesanan tidak ditemukan.'
            });
        }

        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();

            // Update status pesanan jika diberikan
            if (order_status) {
                // Map to valid ENUM for orders.status, store exact value in order_status
                const enumStatus = ORDER_STATUS_ENUM_MAP[order_status] || order_status;
                await connection.query(
                    'UPDATE orders SET status = ?, order_status = ?, updated_at = NOW() WHERE id = ?',
                    [enumStatus, order_status, id]
                );
            }

            // Update status pembayaran jika diberikan
            if (payment_status) {
                await connection.query(
                    `UPDATE payments SET payment_status = ?, 
                     verified_by = ?, verified_at = NOW() 
                     WHERE order_id = ?`,
                    [payment_status, adminId, id]
                );
            }

            // Update info pengiriman jika ada data yang diberikan
            if (shipping_status || tracking_number || courier || admin_notes) {
                const updates = [];
                const params = [];

                if (shipping_status) {
                    // Map to valid ENUM for shipping_info.status column
                    const enumShipping = SHIPPING_STATUS_ENUM_MAP[shipping_status] || shipping_status;
                    updates.push('status = ?');
                    params.push(enumShipping);
                    // Also store in shipping_status VARCHAR column for detailed tracking
                    updates.push('shipping_status = ?');
                    params.push(shipping_status);
                }
                if (tracking_number !== undefined) {
                    updates.push('tracking_number = ?');
                    params.push(tracking_number);
                }
                if (courier) {
                    updates.push('courier = ?');
                    params.push(courier);
                }
                if (admin_notes !== undefined) {
                    updates.push('admin_notes = ?');
                    params.push(admin_notes);
                }
                updates.push('updated_at = NOW()');

                if (updates.length > 0) {
                    // Check if shipping_info record exists for this order
                    const [existingShipping] = await connection.query(
                        'SELECT id FROM shipping_info WHERE order_id = ?', [id]
                    );
                    if (existingShipping.length > 0) {
                        const query = `UPDATE shipping_info SET ${updates.join(', ')} WHERE order_id = ?`;
                        params.push(id);
                        await connection.query(query, params);
                    } else {
                        // Insert shipping_info if it doesn't exist
                        const enumShipping = SHIPPING_STATUS_ENUM_MAP[shipping_status] || shipping_status || 'pending';
                        await connection.query(
                            `INSERT INTO shipping_info (order_id, courier, tracking_number, status, shipping_status, admin_notes, created_at)
                             VALUES (?, ?, ?, ?, ?, ?, NOW())`,
                            [id, courier || null, tracking_number || null, enumShipping, shipping_status || null, admin_notes || null]
                        );
                    }
                }
            }

            await connection.commit();

            res.json({
                success: true,
                message: 'Status pesanan berhasil diperbarui.'
            });

        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('Update Order Status Error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat memperbarui status pesanan.'
        });
    }
};

// ============================================
// GET STATISTIK PESANAN - Untuk dashboard
// ============================================
const getOrderStats = async (req, res) => {
    try {
        // Total pesanan
        const [totalOrders] = await db.query('SELECT COUNT(*) as total FROM orders');

        // Pesanan hari ini
        const [todayOrders] = await db.query(
            `SELECT COUNT(*) as total FROM orders WHERE DATE(created_at) = CURDATE()`
        );

        // Pesanan pending
        const [pendingOrders] = await db.query(
            `SELECT COUNT(*) as total FROM orders WHERE status = 'pending'`
        );

        // Pesanan diproses
        const [processingOrders] = await db.query(
            `SELECT COUNT(*) as total FROM orders WHERE status = 'processing'`
        );

        // Pesanan dikirim
        const [shippedOrders] = await db.query(
            `SELECT COUNT(*) as total FROM orders WHERE status = 'shipped'`
        );

        // Pesanan selesai
        const [deliveredOrders] = await db.query(
            `SELECT COUNT(*) as total FROM orders WHERE status = 'delivered'`
        );

        // Total pendapatan
        const [revenue] = await db.query(
            `SELECT SUM(total_amount) as total FROM orders WHERE status != 'cancelled'`
        );

        res.json({
            success: true,
            data: {
                total: totalOrders[0].total,
                today: todayOrders[0].total,
                pending: pendingOrders[0].total,
                processing: processingOrders[0].total,
                shipped: shippedOrders[0].total,
                delivered: deliveredOrders[0].total,
                revenue: revenue[0].total || 0
            }
        });

    } catch (error) {
        console.error('Get Order Stats Error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat mengambil statistik pesanan.'
        });
    }
};

module.exports = {
    getAllOrdersAdmin,
    getOrderByIdAdmin,
    updateOrderStatus,
    getOrderStats
};
