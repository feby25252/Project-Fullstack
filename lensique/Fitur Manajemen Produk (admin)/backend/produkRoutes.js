// ============================================
// ROUTES MANAJEMEN PRODUK (ADMIN)
// ============================================
// Endpoint CRUD produk untuk admin

const express = require('express');
const router = express.Router();
const upload = require('../../../config/upload');
const { verifyAdmin } = require('../../../middleware/auth');
const { validateRequired, validateTypes, validateRange, combine } = require('../../../middleware/validation');
const {
    getAllProductsAdmin, getProductByIdAdmin, createProduct,
    updateProduct, deleteProduct, deleteProductImage, getCategories
} = require('./produkController');

// Validasi untuk tambah produk
const createProductValidation = combine(
    validateRequired(['name', 'base_price']),
    validateTypes({ name: 'string', description: 'string', base_price: 'number', stock: 'number', category_id: 'number' }),
    validateRange({ base_price: { min: 0 }, stock: { min: 0 } })
);

// Validasi untuk update produk
const updateProductValidation = validateTypes({ name: 'string', description: 'string', base_price: 'number', stock: 'number', category_id: 'number', is_active: 'boolean' });

// Semua route memerlukan autentikasi admin
// GET /api/admin/produk - Ambil semua produk
router.get('/', verifyAdmin, getAllProductsAdmin);

// GET /api/admin/produk/kategori - Ambil kategori
router.get('/kategori', verifyAdmin, getCategories);

// GET /api/admin/produk/:id - Detail produk
router.get('/:id', verifyAdmin, getProductByIdAdmin);

// POST /api/admin/produk - Tambah produk baru (dengan upload gambar)
router.post('/', verifyAdmin, upload.array('images', 5), createProductValidation, createProduct);

// PUT /api/admin/produk/:id - Update produk
router.put('/:id', verifyAdmin, upload.array('images', 5), updateProductValidation, updateProduct);

// DELETE /api/admin/produk/:id - Hapus produk
router.delete('/:id', verifyAdmin, deleteProduct);

// DELETE /api/admin/produk/image/:imageId - Hapus gambar produk
router.delete('/image/:imageId', verifyAdmin, deleteProductImage);

module.exports = router;
