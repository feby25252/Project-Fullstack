require("dotenv").config();
const app = require("./app");

// const cartRoutes = require("./routes/cartRoutes");  // sementara matiin dulu
const productRoutes = require("./routes/productRoutes");

// app.use("/api/cart", cartRoutes);  // sementara matiin dulu
app.use("/api/products", productRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});