const express = require("express");
const router = express.Router();

const cartController = require("../controllers/cartController");

// contoh route
router.get("/", cartController.getCart);
router.post("/add", cartController.addToCart);
router.delete("/remove/:id", cartController.removeFromCart);

module.exports = router;