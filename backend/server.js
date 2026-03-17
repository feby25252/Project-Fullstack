require("dotenv").config();
const app = require("./app");

const cartRoutes = require("./routes/cartRoutes");

// daftar route 
app.use("/api/cart", cartRoutes);

const PORT = process.env.PORT || 3000;

// jalankan server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});