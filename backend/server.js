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
});