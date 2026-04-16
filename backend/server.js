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
});