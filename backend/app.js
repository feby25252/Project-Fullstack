const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); // Tambahkan cors jika frontend berbeda domain/port
const orderRoutes = require('./routes/orderRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Registrasi Route API
app.use('/api/orders', orderRoutes);

// Penanganan rute tidak ditemukan (404)
app.use((req, res) => {
    res.status(404).json({ message: 'Resource API tidak ditemukan.' });
});

module.exports = app;