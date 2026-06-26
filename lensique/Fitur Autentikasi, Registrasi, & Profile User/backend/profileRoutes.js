// ============================================
// ROUTES PROFILE USER
// ============================================
// Mendefinisikan endpoint API untuk profil user

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { getProfile, updateProfile } = require('./profileController');
const { verifyToken } = require('../../../middleware/auth');
const { validateTypes, validateLength } = require('../../../middleware/validation');

// Konfigurasi multer untuk upload avatar
const avatarStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '..', '..', '..', 'uploads', 'avatars'));
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        cb(null, 'avatar-' + req.user.id + '-' + Date.now() + ext);
    }
});

const uploadAvatar = multer({
    storage: avatarStorage,
    limits: { fileSize: 2 * 1024 * 1024 }, // Maksimal 2MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Format file tidak didukung. Gunakan JPG, JPEG, atau PNG.'), false);
        }
    }
});

// GET /api/profile - Ambil profil user saat ini
router.get('/', verifyToken, getProfile);

// PUT /api/profile - Update profil user
router.put('/', verifyToken, uploadAvatar.single('avatar'), validateTypes({ full_name: 'string', bio: 'string', phone: 'string', address: 'string' }), validateLength({ full_name: { max: 150 }, bio: { max: 500 }, phone: { max: 20 } }), updateProfile);

module.exports = router;
