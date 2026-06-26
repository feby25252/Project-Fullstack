// ============================================
// CONTROLLER USER MANAGEMENT (ADMIN)
// ============================================
// Menangani CRUD user oleh admin
// Termasuk mengubah role dan status aktif user

const db = require('../config/database');
const bcrypt = require('bcryptjs');

// ============================================
// GET SEMUA USER - Dengan paginasi dan profil
// ============================================
const getAllUsers = async (req, res) => {
    try {
        const { search, role, page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        let query = `
            SELECT u.id, u.username, u.email, u.role_id, u.is_active, u.last_login, u.created_at, u.updated_at,
                   r.role_name,
                   up.full_name, up.avatar, up.avatar_url, up.bio, up.phone, up.address
            FROM users u
            LEFT JOIN roles r ON u.role_id = r.id
            LEFT JOIN user_profile up ON u.id = up.user_id
            WHERE 1=1
        `;
        let params = [];

        if (search) {
            query += ' AND (u.username LIKE ? OR u.email LIKE ? OR up.full_name LIKE ?)';
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        if (role) {
            query += ' AND u.role_id = ?';
            params.push(role);
        }

        query += ' ORDER BY u.created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        const [users] = await db.query(query, params);

        // Hitung total
        const [countResult] = await db.query('SELECT COUNT(*) as total FROM users');

        res.json({
            success: true,
            data: users,
            pagination: {
                total: countResult[0].total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(countResult[0].total / limit)
            }
        });

    } catch (error) {
        console.error('Get All Users Error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat mengambil data user.'
        });
    }
};

// ============================================
// GET DETAIL USER - Berdasarkan ID
// ============================================
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        const [users] = await db.query(
            `SELECT u.id, u.username, u.email, u.role_id, u.is_active, u.last_login, u.created_at, u.updated_at,
                    r.role_name,
                    up.full_name, up.avatar, up.avatar_url, up.bio, up.phone, up.address
             FROM users u
             LEFT JOIN roles r ON u.role_id = r.id
             LEFT JOIN user_profile up ON u.id = up.user_id
             WHERE u.id = ?`,
            [id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User tidak ditemukan.'
            });
        }

        res.json({
            success: true,
            data: users[0]
        });

    } catch (error) {
        console.error('Get User By Id Error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat mengambil detail user.'
        });
    }
};

// ============================================
// TAMBAH USER BARU - Oleh admin
// ============================================
const createUser = async (req, res) => {
    try {
        const { username, email, password, full_name, role_id, bio, phone, address } = req.body;

        // Validasi input wajib
        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username, email, dan password wajib diisi.'
            });
        }

        // Validasi panjang password
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password minimal 6 karakter.'
            });
        }

        // Cek email unik
        const [existingEmail] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existingEmail.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Email sudah terdaftar.'
            });
        }

        // Cek username unik
        const [existingUsername] = await db.query('SELECT id FROM users WHERE username = ?', [username]);
        if (existingUsername.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Username sudah terdaftar.'
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // Simpan user baru
        const [result] = await db.query(
            'INSERT INTO users (username, email, password_hash, role_id, is_active, created_at) VALUES (?, ?, ?, ?, 1, NOW())',
            [username, email, password_hash, role_id || 2]
        );

        // Buat profil user
        await db.query(
            'INSERT INTO user_profile (user_id, full_name, bio, phone, address, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
            [result.insertId, full_name || username, bio || null, phone || null, address || null]
        );

        res.status(201).json({
            success: true,
            message: 'User berhasil ditambahkan.',
            data: { id: result.insertId }
        });

    } catch (error) {
        console.error('Create User Error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat menambah user.'
        });
    }
};

// ============================================
// UPDATE USER - Oleh admin
// ============================================
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { username, email, full_name, bio, phone, address, role_id } = req.body;

        // Cek user ada
        const [existing] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User tidak ditemukan.'
            });
        }

        // Cek email unik jika diubah
        if (email && email !== existing[0].email) {
            const [emailCheck] = await db.query('SELECT id FROM users WHERE email = ? AND id != ?', [email, id]);
            if (emailCheck.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: 'Email sudah digunakan oleh user lain.'
                });
            }
        }

        // Cek username unik jika diubah
        if (username && username !== existing[0].username) {
            const [usernameCheck] = await db.query('SELECT id FROM users WHERE username = ? AND id != ?', [username, id]);
            if (usernameCheck.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: 'Username sudah digunakan oleh user lain.'
                });
            }
        }

        // Update tabel users
        await db.query(
            'UPDATE users SET username = ?, email = ?, role_id = ?, updated_at = NOW() WHERE id = ?',
            [
                username || existing[0].username,
                email || existing[0].email,
                role_id !== undefined ? role_id : existing[0].role_id,
                id
            ]
        );

        // Update profil
        const [profile] = await db.query('SELECT id FROM user_profile WHERE user_id = ?', [id]);
        if (profile.length > 0) {
            await db.query(
                'UPDATE user_profile SET full_name = ?, bio = ?, phone = ?, address = ?, updated_at = NOW() WHERE user_id = ?',
                [full_name, bio, phone, address, id]
            );
        } else {
            await db.query(
                'INSERT INTO user_profile (user_id, full_name, bio, phone, address, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
                [id, full_name, bio, phone, address]
            );
        }

        res.json({
            success: true,
            message: 'User berhasil diperbarui.'
        });

    } catch (error) {
        console.error('Update User Error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat memperbarui user.'
        });
    }
};

// ============================================
// HAPUS USER - Oleh admin
// ============================================
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Hindari admin menghapus dirinya sendiri
        if (parseInt(id) === req.user.id) {
            return res.status(400).json({
                success: false,
                message: 'Anda tidak dapat menghapus akun Anda sendiri.'
            });
        }

        const [existing] = await db.query('SELECT id FROM users WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User tidak ditemukan.'
            });
        }

        await db.query('DELETE FROM users WHERE id = ?', [id]);

        res.json({
            success: true,
            message: 'User berhasil dihapus.'
        });

    } catch (error) {
        console.error('Delete User Error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat menghapus user.'
        });
    }
};

// ============================================
// UBAH ROLE USER
// ============================================
const updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role_id } = req.body;

        if (!role_id) {
            return res.status(400).json({
                success: false,
                message: 'Role ID wajib diisi.'
            });
        }

        const [existing] = await db.query('SELECT id FROM users WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User tidak ditemukan.'
            });
        }

        await db.query('UPDATE users SET role_id = ?, updated_at = NOW() WHERE id = ?', [role_id, id]);

        res.json({
            success: true,
            message: 'Role user berhasil diperbarui.'
        });

    } catch (error) {
        console.error('Update User Role Error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat mengubah role user.'
        });
    }
};

// ============================================
// AKTIFKAN / NONAKTIFKAN USER
// ============================================
const toggleUserActive = async (req, res) => {
    try {
        const { id } = req.params;
        const { is_active } = req.body;

        if (is_active === undefined || is_active === null) {
            return res.status(400).json({
                success: false,
                message: 'Status is_active wajib diisi (0 atau 1).'
            });
        }

        // Hindari admin menonaktifkan dirinya sendiri
        if (parseInt(id) === req.user.id && parseInt(is_active) === 0) {
            return res.status(400).json({
                success: false,
                message: 'Anda tidak dapat menonaktifkan akun Anda sendiri.'
            });
        }

        const [existing] = await db.query('SELECT id FROM users WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User tidak ditemukan.'
            });
        }

        await db.query('UPDATE users SET is_active = ?, updated_at = NOW() WHERE id = ?', [is_active, id]);

        res.json({
            success: true,
            message: parseInt(is_active) === 1 ? 'User berhasil diaktifkan.' : 'User berhasil dinonaktifkan.'
        });

    } catch (error) {
        console.error('Toggle User Active Error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat mengubah status user.'
        });
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    updateUserRole,
    toggleUserActive
};