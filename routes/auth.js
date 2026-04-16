// routes/auth.js
const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/AuthController");
const jwt = require("jsonwebtoken");

const SECRET_KEY = "rahasia123";

// Middleware auth
function authMiddleware(req, res, next) {
  const token = req.headers["authorization"];
  if (!token) return res.status(401).send("Token diperlukan");

  try {
    const payload = jwt.verify(token, SECRET_KEY);
    req.user = payload;
    next();
  } catch (err) {
    res.status(401).send("Token invalid");
  }
}

// Routes
router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.post("/logout", AuthController.logout);
router.get("/profile", authMiddleware, AuthController.profile);

module.exports = router;