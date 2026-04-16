const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");

router.post("/add", cartController.addToCart);
router.get("/:user_id", cartController.getCart);
router.put("/update", cartController.updateCart);
router.delete("/:id", cartController.deleteItem);

module.exports = router;

router.get("/:user_id", cartController.getCart);

router.put("/update", cartController.updateCartItem);

router.delete("/:cart_item_id", cartController.deleteCartItem);