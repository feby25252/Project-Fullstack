// ============================================
// KONFIGURASI MULTER UNTUK UPLOAD FILE
// ============================================
// Mengatur penyimpanan file upload produk
// Mendukung format gambar: jpg, jpeg, png, gif, webp

const multer = require('multer');
const path = require('path');

// Konfigurasi penyimpanan file
const storage = multer.diskStorage({
    // Tentukan folder tujuan upload
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '..', 'uploads', 'products'));
    },
    // Tentukan nama file (timestamp + nama asli)
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'product-' + uniqueSuffix + ext);
    }
});

// Filter hanya menerima file gambar JPG, JPEG, PNG
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Format file tidak didukung. Gunakan JPG, JPEG, atau PNG.'), false);
    }
};

// Konfigurasi multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 2 * 1024 * 1024 // Maksimal 2MB
    }
});

module.exports = upload;
