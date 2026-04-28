// ============================================
// ROUTES ADMIN MANAGEMENT
// ============================================
// Endpoint untuk dashboard, user CRUD, review management,
// dan product CRUD (alias dari existing produkRoutes)

const express = require('express');
const router = express.Router();
const { verifyAdmin } = require('../middleware/auth');
const { validateRequired, validateTypes, validateRange, combine } = require('../middleware/validation');

// Import controllers
const adminController = require('../controllers/adminController');
const userController = require('../controllers/userController');
const orderController = require('../controllers/orderController');

// Import existing product controller untuk alias /api/admin/products
const {
    getAllProductsAdmin, getProductByIdAdmin, createProduct,
    updateProduct, deleteProduct, deleteProductImage, getCategories
} = require('../lensique/Fitur Manajemen Produk (admin)/backend/produkController');
const upload = require('../config/upload');

// ============================================
// DASHBOARD
// ============================================
router.get('/dashboard', verifyAdmin, adminController.getDashboardStats);

// ============================================
// USER MANAGEMENT
// ============================================

// Validasi untuk tambah/edit user
const userValidation = combine(
    validateRequired(['username', 'email', 'password']),
    validateTypes({ username: 'string', email: 'email', password: 'string', role_id: 'number', full_name: 'string' })
);

const userUpdateValidation = validateTypes({
    username: 'string', email: 'email', full_name: 'string',
    bio: 'string', phone: 'string', address: 'string', role_id: 'number'
});

// GET /api/admin/users - List semua user
router.get('/users', verifyAdmin, userController.getAllUsers);

// GET /api/admin/users/:id - Detail user
router.get('/users/:id', verifyAdmin, userController.getUserById);

// POST /api/admin/users - Tambah user baru
router.post('/users', verifyAdmin, userValidation, userController.createUser);

// PUT /api/admin/users/:id - Update user
router.put('/users/:id', verifyAdmin, userUpdateValidation, userController.updateUser);

// DELETE /api/admin/users/:id - Hapus user
router.delete('/users/:id', verifyAdmin, userController.deleteUser);

// PUT /api/admin/users/:id/role - Ubah role user
router.put('/users/:id/role', verifyAdmin, userController.updateUserRole);

// PUT /api/admin/users/:id/active - Aktifkan/nonaktifkan user
router.put('/users/:id/active', verifyAdmin, userController.toggleUserActive);

// ============================================
// PRODUCT MANAGEMENT (ALIAS dari /api/admin/produk)
// ============================================

const productValidation = combine(
    validateRequired(['name', 'base_price']),
    validateTypes({ name: 'string', description: 'string', base_price: 'number', stock: 'number', category_id: 'number' }),
    validateRange({ base_price: { min: 0 }, stock: { min: 0 } })
);

const productUpdateValidation = validateTypes({
    name: 'string', description: 'string', base_price: 'number',
    stock: 'number', category_id: 'number', is_active: 'boolean'
});

// GET /api/admin/products - List produk
router.get('/products', verifyAdmin, getAllProductsAdmin);

// GET /api/admin/products/kategori - List kategori
router.get('/products/kategori', verifyAdmin, getCategories);

// GET /api/admin/products/:id - Detail produk
router.get('/products/:id', verifyAdmin, getProductByIdAdmin);

// POST /api/admin/products - Tambah produk
router.post('/products', verifyAdmin, upload.array('images', 5), productValidation, createProduct);

// PUT /api/admin/products/:id - Update produk
router.put('/products/:id', verifyAdmin, upload.array('images', 5), productUpdateValidation, updateProduct);

// DELETE /api/admin/products/:id - Hapus produk
router.delete('/products/:id', verifyAdmin, deleteProduct);

// DELETE /api/admin/products/image/:imageId - Hapus gambar produk
router.delete('/products/image/:imageId', verifyAdmin, deleteProductImage);

// ============================================
// REVIEW MANAGEMENT
// ============================================

// GET /api/admin/reviews - List semua review
router.get('/reviews', verifyAdmin, adminController.getAllReviews);

// DELETE /api/admin/reviews/:id - Hapus review
router.delete('/reviews/:id', verifyAdmin, adminController.deleteReview);

// ============================================
// ORDER MANAGEMENT
// ============================================

// GET /api/admin/orders - List semua pesanan
router.get('/orders', verifyAdmin, orderController.getAllOrdersAdmin);

// GET /api/admin/orders/stats - Statistik pesanan
router.get('/orders/stats', verifyAdmin, orderController.getOrderStats);

// GET /api/admin/orders/:id - Detail pesanan
router.get('/orders/:id', verifyAdmin, orderController.getOrderByIdAdmin);

// PUT /api/admin/orders/:id/status - Update status pesanan
router.put('/orders/:id/status', verifyAdmin, orderController.updateOrderStatus);

module.exports = router;
