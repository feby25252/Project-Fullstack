// ============================================
// MIDDLEWARE AUTENTIKASI JWT
// ============================================
// Middleware ini memverifikasi token JWT
// untuk melindungi route yang membutuhkan login

const jwt = require('jsonwebtoken');
require('dotenv').config();

// Middleware verifikasi token JWT
const verifyToken = (req, res, next) => {
    // Ambil token dari header Authorization
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Akses ditolak. Token tidak ditemukan.'
        });
    }

    try {
        // Verifikasi token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Simpan data user ke request
        next();
    } catch (error) {
        return res.status(403).json({
            success: false,
            message: 'Token tidak valid atau sudah kedaluwarsa.'
        });
    }
};

// Middleware khusus admin (role_id = 1)
const verifyAdmin = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user.role_id === 1) {
            next();
        } else {
            return res.status(403).json({
                success: false,
                message: 'Akses ditolak. Hanya admin yang dapat mengakses.'
            });
        }
    });
};

module.exports = { verifyToken, verifyAdmin };
