// ============================================
// ROUTES AUTENTIKASI
// ============================================
// Mendefinisikan endpoint API untuk register, login

const express = require('express');
const router = express.Router();
const { register, login, getCurrentUser } = require('./authController');
const { verifyToken } = require('../../../middleware/auth');
const { validateRequired, validateTypes, validateLength, combine } = require('../../../middleware/validation');

// Validasi untuk registrasi
const registerValidation = combine(
    validateRequired(['username', 'email', 'password']),
    validateTypes({ username: 'string', email: 'email', password: 'string', full_name: 'string' }),
    validateLength({ username: { min: 3, max: 100 }, password: { min: 6, max: 255 }, full_name: { max: 150 } })
);

// Validasi untuk login
const loginValidation = combine(
    validateRequired(['email', 'password']),
    validateTypes({ email: 'email', password: 'string' }),
    validateLength({ password: { min: 6 } })
);

// POST /api/auth/register - Daftar user baru
router.post('/register', registerValidation, register);

// POST /api/auth/login - Login user
router.post('/login', loginValidation, login);

// GET /api/auth/me - Ambil data user saat ini (perlu token)
router.get('/me', verifyToken, getCurrentUser);

module.exports = router;
