<<<<<<< HEAD
const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");

router.get("/", productController.getAllProducts);
router.get("/search", productController.searchProducts);
router.get("/category/:category_id", productController.getProductsByCategory);
router.get("/:id", productController.getProductById);
=======
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
>>>>>>> feature/auth

module.exports = router;