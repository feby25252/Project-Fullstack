const express = require('express');
const router = express.Router();

// import controller (INI PENTING 👇)
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');

// =========================
// ROUTES
// =========================

// GET semua produk
router.get('/', getAllProducts);

// GET produk by ID
router.get('/:id', getProductById);

// POST tambah produk
router.post('/', createProduct);

// PUT update produk
router.put('/:id', updateProduct);

// DELETE hapus produk
router.delete('/:id', deleteProduct);

module.exports = router;