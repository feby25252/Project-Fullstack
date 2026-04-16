<<<<<<< HEAD
 feature/product
require("dotenv").config();
const app = require("./app");

// const cartRoutes = require("./routes/cartRoutes");  // sementara matiin dulu
const productRoutes = require("./routes/productRoutes");

// app.use("/api/cart", cartRoutes);  // sementara matiin dulu
app.use("/api/products", productRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);

feature/checkout
const app = require('./app');

/**
 * Menentukan PORT server. Default 3000 atau dari environment variable.
 */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log('==============================================');
    console.log(` SERVER BACKEND OPTIK BERJALAN AKTIF `);
    console.log(` Lokasi: http://localhost:${PORT} `);
    console.log('==============================================');

require("dotenv").config();
const app = require("./app");

const cartRoutes = require("./routes/cartRoutes");

// daftar route 
app.use("/api/cart", cartRoutes);

const PORT = process.env.PORT || 3000;

// jalankan server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
develop
 develop
=======
const express = require('express');
const app = express();
const PORT = 3000;

const productRoutes = require('./routes/productRoutes');

app.use(express.json());

app.use('/products', productRoutes);

app.get('/', (req, res) => {
  res.send('API jalan');
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
>>>>>>> feature/auth
});