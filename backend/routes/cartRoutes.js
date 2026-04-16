const express = require("express");
const router = express.Router();
 feature/product

const cartController = require("../controllers/cartController");

// contoh route
router.get("/", cartController.getCart);
router.post("/add", cartController.addToCart);
router.delete("/remove/:id", cartController.removeFromCart);

module.exports = router;

const cartController = require("../controllers/cartController");

router.post("/add", cartController.addToCart);
router.get("/:user_id", cartController.getCart);
router.put("/update", cartController.updateCart);
router.delete("/:id", cartController.deleteItem);

module.exports = router;

router.get("/:user_id", cartController.getCart);

router.put("/update", cartController.updateCartItem);

router.delete("/:cart_item_id", cartController.deleteCartItem);
 develop
