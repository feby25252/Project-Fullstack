// controllers/AuthController.js
const users = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const SECRET_KEY = "rahasia123"; // bisa diganti bebas

class AuthController {
  // Register user
  async register(req, res) {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).send("Username dan password dibutuhkan");

    const exist = users.find(u => u.username === username);
    if (exist) return res.status(400).send("Username sudah terdaftar");

    const hashed = await bcrypt.hash(password, 10);
    users.push({ username, password: hashed });
    res.send(`User ${username} berhasil daftar`);
  }

  // Login user
  async login(req, res) {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username);
    if (!user) return res.status(401).send("User tidak ditemukan");

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).send("Password salah");

    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: "1h" });
    res.json({ message: "Login sukses", token });
  }

  // Profile user
  profile(req, res) {
    res.json({ message: "Ini data profile", user: req.user });
  }

  // Logout
  logout(req, res) {
    res.send("Logout sukses (hapus token di client)");
  }
}

module.exports = new AuthController();