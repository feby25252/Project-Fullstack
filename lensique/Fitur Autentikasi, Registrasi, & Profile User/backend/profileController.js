// ============================================
// CONTROLLER PROFILE USER
// ============================================
// Menangani logika tampil dan update profil user
// Data diambil dari tabel users + user_profile

const db = require('../../../config/database');

// ============================================
// GET PROFILE - Ambil data profil user
// ============================================
const getProfile = async (req, res) => {
    try {
        // Join tabel users dan user_profile
        const [profiles] = await db.query(
            `SELECT u.id, u.username, u.email, u.role_id,
                    up.full_name, up.avatar, up.bio, up.phone, up.address,
                    up.created_at, up.updated_at
             FROM users u
             LEFT JOIN user_profile up ON u.id = up.user_id
             WHERE u.id = ?`,
            [req.user.id]
        );

        if (profiles.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Profil tidak ditemukan.'
            });
        }

        res.json({
            success: true,
            data: profiles[0]
        });

    } catch (error) {
        console.error('Get Profile Error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat mengambil profil.'
        });
    }
};

// ============================================
// UPDATE PROFILE - Perbarui data profil user
// ============================================
const updateProfile = async (req, res) => {
    try {
        const { full_name, bio, phone, address } = req.body;
        let avatar = null;

        // Jika ada file avatar yang diupload
        if (req.file) {
            avatar = '/uploads/avatars/' + req.file.filename;
        }

        // Cek apakah profil sudah ada
        const [existing] = await db.query(
            'SELECT id FROM user_profile WHERE user_id = ?',
            [req.user.id]
        );

        if (existing.length > 0) {
            // Update profil yang sudah ada
            let query = 'UPDATE user_profile SET full_name = ?, bio = ?, phone = ?, address = ?, updated_at = NOW()';
            let params = [full_name, bio, phone, address];

            // Tambahkan avatar hanya jika ada file baru
            if (avatar) {
                query += ', avatar = ?';
                params.push(avatar);
            }

            query += ' WHERE user_id = ?';
            params.push(req.user.id);

            await db.query(query, params);
        } else {
            // Buat profil baru jika belum ada
            await db.query(
                'INSERT INTO user_profile (user_id, full_name, avatar, bio, phone, address, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
                [req.user.id, full_name, avatar, bio, phone, address]
            );
        }

        // Update username di tabel users jika dikirim
        if (req.body.username) {
            await db.query(
                'UPDATE users SET username = ? WHERE id = ?',
                [req.body.username, req.user.id]
            );
        }

        res.json({
            success: true,
            message: 'Profil berhasil diperbarui.'
        });

    } catch (error) {
        console.error('Update Profile Error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat memperbarui profil.'
        });
    }
};

module.exports = { getProfile, updateProfile };
