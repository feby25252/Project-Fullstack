// ============================================
// CONTROLLER AUTENTIKASI
// ============================================
// Menangani logika register dan login user
// Menggunakan bcrypt untuk hashing password
// Menggunakan JWT untuk token autentikasi

const db = require('../../../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ============================================
// REGISTER - Mendaftarkan user baru
// ============================================
const register = async (req, res) => {
    try {
        const { username, email, password, full_name } = req.body;

        // Validasi input wajib
        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username, email, dan password wajib diisi.'
            });
        }

        // Validasi panjang password minimal 6 karakter
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password minimal 6 karakter.'
            });
        }

        // Cek apakah email atau username sudah terdaftar
        const [existingUser] = await db.query(
            'SELECT id FROM users WHERE email = ? OR username = ?',
            [email, username]
        );

        if (existingUser.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Email atau username sudah terdaftar.'
            });
        }

        // Hash password menggunakan bcrypt
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // Simpan user baru ke database (role_id = 2 untuk user biasa)
        const [result] = await db.query(
            'INSERT INTO users (username, email, password_hash, role_id, created_at) VALUES (?, ?, ?, 2, NOW())',
            [username, email, password_hash]
        );

        // Buat profil user baru
        await db.query(
            'INSERT INTO user_profile (user_id, full_name, created_at) VALUES (?, ?, NOW())',
            [result.insertId, full_name || username]
        );

        res.status(201).json({
            success: true,
            message: 'Registrasi berhasil! Silakan login.',
            data: {
                id: result.insertId,
                username: username,
                email: email
            }
        });

    } catch (error) {
        console.error('Register Error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat registrasi.'
        });
    }
};

// ============================================
// LOGIN - Autentikasi user
// ============================================
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validasi input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email dan password wajib diisi.'
            });
        }

        // Cari user berdasarkan email
        // Menggunakan subquery untuk role_name agar tidak error jika tabel roles belum ada
        // Menggunakan COALESCE untuk is_active agar kompatibel jika kolom belum ada
        let users;
        try {
            [users] = await db.query(
                `SELECT u.id, u.username, u.email, u.password_hash, u.role_id,
                        COALESCE(u.is_active, 1) AS is_active,
                        (SELECT r.role_name FROM roles r WHERE r.id = u.role_id) AS role_name
                 FROM users u
                 WHERE u.email = ?`,
                [email]
            );
        } catch (dbErr) {
            // Fallback: jika kolom is_active belum ada, query tanpa kolom tersebut
            [users] = await db.query(
                `SELECT u.id, u.username, u.email, u.password_hash, u.role_id,
                        1 AS is_active,
                        (SELECT r.role_name FROM roles r WHERE r.id = u.role_id) AS role_name
                 FROM users u
                 WHERE u.email = ?`,
                [email]
            );
        }

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Email atau password salah.'
            });
        }

        const user = users[0];

        // Cek apakah akun masih aktif
        if (user.is_active === 0) {
            return res.status(403).json({
                success: false,
                message: 'Akun Anda dinonaktifkan. Silakan hubungi admin.'
            });
        }

        // Verifikasi password dengan bcrypt
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Email atau password salah.'
            });
        }

        // Update last_login (gunakan try-catch agar tidak gagal jika kolom belum ada)
        try {
            await db.query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);
        } catch (e) {
            // Abaikan jika kolom last_login belum ada
        }

        // Default role_name jika null (misalnya tabel roles belum terisi)
        const roleName = user.role_name || (user.role_id === 1 ? 'admin' : 'member');

        // Buat token JWT
        const token = jwt.sign(
            {
                id: user.id,
                username: user.username,
                email: user.email,
                role_id: user.role_id,
                role_name: roleName
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );

        res.json({
            success: true,
            message: 'Login berhasil!',
            data: {
                token: token,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role_id: user.role_id,
                    role_name: roleName
                }
            }
        });

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat login.'
        });
    }
};

// ============================================
// GET CURRENT USER - Ambil data user saat ini
// ============================================
const getCurrentUser = async (req, res) => {
    try {
        const [users] = await db.query(
            `SELECT u.id, u.username, u.email, u.role_id, r.role_name 
             FROM users u 
             LEFT JOIN roles r ON u.role_id = r.id 
             WHERE u.id = ?`,
            [req.user.id]
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
        console.error('Get User Error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan.'
        });
    }
};

module.exports = { register, login, getCurrentUser };
