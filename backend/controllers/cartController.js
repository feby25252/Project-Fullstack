const db = require("../config/db");

// ADD TO CART
exports.addToCart = (req, res) => {
    const { user_id, product_id, quantity } = req.body;

    if (!user_id || !product_id || !quantity) {
        return res.status(400).json({ message: "Data tidak lengkap" });
    }

    // cek cart user
    db.query(
        "INSERT INTO carts (user_id, created_at) VALUES (?, NOW())",
        [user_id],
        (err, result) => {
            if (err) {
                console.log("ERROR INSERT CART:", err);
                return res.status(500).json(err);
            }

            const cart_id = result.insertId;
            insertItem(cart_id);
        }
    );

    function insertItem(cart_id) {
        db.query(
            "INSERT INTO cart_items (cart_id, product_id, quantity, added_at) VALUES (?, ?, ?, NOW())",
            [cart_id, product_id, quantity],
            (err) => {
                if (err) return res.json(err);
                res.json({ message: "Added to cart" });
            }
        );
    }
};

// GET CART
exports.getCart = (req, res) => {
    const user_id = req.params.user_id;

    const query = `
    SELECT ci.cart_item_id, p.product_name, p.base_price, ci.quantity
    FROM carts c
    JOIN cart_items ci ON c.cart_id = ci.cart_id
    JOIN products p ON ci.product_id = p.product_id
    WHERE c.user_id = ?
  `;

    db.query(query, [user_id], (err, result) => {
        if (err) return res.json(err);
        res.json(result);
    });
};

// UPDATE QUANTITY
exports.updateCart = (req, res) => {
    const { cart_item_id, quantity } = req.body;

    db.query(
        "UPDATE cart_items SET quantity = ? WHERE cart_item_id = ?",
        [quantity, cart_item_id],
        (err) => {
            if (err) return res.json(err);
            res.json({ message: "Updated" });
        }
    );
};

// DELETE ITEM
exports.deleteItem = (req, res) => {
    const cart_item_id = req.params.id;

    db.query(
        "DELETE FROM cart_items WHERE cart_item_id = ?",
        [cart_item_id],
        (err) => {
            if (err) return res.json(err);
            res.json({ message: "Deleted" });
        }
    );
};


//GET CART LIAT ISI KERANJANG
exports.getCart = (req, res) => {
  const user_id = req.params.user_id;

  const query = `
    SELECT 
      c.cart_id,
      ci.cart_item_id,
      ci.quantity,
      p.product_id,
      p.product_name,
      p.base_price
    FROM carts c
    JOIN cart_items ci ON c.cart_id = ci.cart_id
    JOIN products p ON ci.product_id = p.product_id
    WHERE c.user_id = ?
  `;

  db.query(query, [user_id], (err, results) => {
    if (err) {
      console.log("ERROR GET CART:", err);
      return res.status(500).json(err);
    }

    res.json(results);
  });
};


//UPDATE QUANTITY BARANG
exports.updateCartItem = (req, res) => {
  const { cart_item_id, quantity } = req.body;

  const query = `
    UPDATE cart_items 
    SET quantity = ? 
    WHERE cart_item_id = ?
  `;

  db.query(query, [quantity, cart_item_id], (err, result) => {
    if (err) {
      console.log("ERROR UPDATE CART:", err);
      return res.status(500).json(err);
    }

    res.json({ message: "Cart updated!" });
  });
};

//DELETE ITEM TAMBAHAN
exports.deleteCartItem = (req, res) => {
  const { cart_item_id } = req.params;

  const query = "DELETE FROM cart_items WHERE cart_item_id = ?";

  db.query(query, [cart_item_id], (err, result) => {
    if (err) {
      console.log("ERROR DELETE CART:", err);
      return res.status(500).json(err);
    }

    res.json({ message: "Item deleted!" });
  });
};