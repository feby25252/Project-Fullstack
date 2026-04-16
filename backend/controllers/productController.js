<<<<<<< HEAD
const db = require("../config/db");

// GET ALL PRODUCTS
exports.getAllProducts = (req, res) => {
  const query = "SELECT * FROM products";

  db.query(query, (err, results) => {
    if (err) {
      console.log("Error get products:", err);
      return res.status(500).json({ message: "Server error" });
    }
    res.json(results);
  });
};

// GET PRODUCT BY ID
exports.getProductById = (req, res) => {
  const { id } = req.params;

  const query = "SELECT * FROM products WHERE product_id = ?";

  db.query(query, [id], (err, results) => {
    if (err) {
      console.log("Error get product by id:", err);
      return res.status(500).json({ message: "Server error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Produk tidak ditemukan" });
    }

    res.json(results[0]);
  });
};

// SEARCH PRODUCT
exports.searchProducts = (req, res) => {
  const { keyword } = req.query;

  if (!keyword) {
    return res.status(400).json({ message: "Keyword wajib diisi" });
  }

  const query = "SELECT * FROM products WHERE product_name LIKE ?";

  db.query(query, [`%${keyword}%`], (err, results) => {
    if (err) {
      console.log("Error search products:", err);
      return res.status(500).json({ message: "Server error" });
    }

    res.json(results);
  });
};

// FILTER BY CATEGORY
exports.getProductsByCategory = (req, res) => {
  const { category_id } = req.params;

  const query = "SELECT * FROM products WHERE category_id = ?";

  db.query(query, [category_id], (err, results) => {
    if (err) {
      console.log("Error filter products:", err);
      return res.status(500).json({ message: "Server error" });
    }

    res.json(results);
  });
=======
const {
  readProducts,
  writeProducts
} = require('../models/productModel');

exports.getAllProducts = (req, res) => {
  const products = readProducts();
  res.json(products);
};

exports.getProductById = (req, res) => {
  const products = readProducts();
  const product = products.find(p => p.id == req.params.id);

  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  res.json(product);
};

exports.createProduct = (req, res) => {
  const products = readProducts();

  const newProduct = {
    id: Date.now(),
    name: req.body.name,
    price: req.body.price,
    stock: req.body.stock
  };

  products.push(newProduct);
  writeProducts(products);

  res.json({ message: 'Product added', data: newProduct });
};

exports.updateProduct = (req, res) => {
  const products = readProducts();
  const index = products.findIndex(p => p.id == req.params.id);

  if (index === -1) {
    return res.status(404).json({ message: 'Product not found' });
  }

  products[index] = {
    ...products[index],
    name: req.body.name,
    price: req.body.price,
    stock: req.body.stock
  };

  writeProducts(products);

  res.json({ message: 'Product updated', data: products[index] });
};

exports.deleteProduct = (req, res) => {
  const products = readProducts();
  const newProducts = products.filter(p => p.id != req.params.id);

  if (products.length === newProducts.length) {
    return res.status(404).json({ message: 'Product not found' });
  }

  writeProducts(newProducts);

  res.json({ message: 'Product deleted' });
>>>>>>> feature/auth
};