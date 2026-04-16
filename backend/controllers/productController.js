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
};