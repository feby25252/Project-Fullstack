const express = require("express");
const authRouter = require("./routes/auth");

const app = express();

// Middleware untuk parsing JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root endpoint
app.get("/", (req, res) => {
  res.send("Hello Express - Backend siap!");
});

// Pakai router auth
app.use(authRouter);

// Jalankan server
app.listen(3000, () => {
  console.log("Server berjalan di http://localhost:3000");
});





























/*const express = require("express");
const router = require("./routes/api.js");
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Pakai router
app.use(router);

// Jalankan server
app.listen(3000, () => {
  console.log("Server berjalan di http://localhost:3000");
});



/*import express
const express = require("express");
const router = require("./routes/api.js");
// Membuat object express
const app = express();*/
/*
Membuat routing.
Method get menerima 2 params.
Param 2 callback.
Param 1 adalah endpoint.
Callback menerima object req dan res

app.get("/", (req, res) => {
  res.send("Hello Express");
});
app.get("/test", (req, res) => {
  res.send("Ini endpoint test");
});
app.get("/students", (req, res) => {
    res.send("Menampilkan semua students");
});
app.post("/students", (req, res) => {
    res.send("Menambahkan data student");
});
app.put("/students", (req, res) => {
    res.send("Mengedit student");
});
app.delete("/students", (req, res) => {
    res.send(`Mengedit student`);
});
app.put("/students/:id", (req, res) => {
    const { id } = req.params;
    res.send(`Mengedit student ${id}`);
});
app.delete("/students/:id", (req, res) => {
const { id } = req.params;
res.send(`Mengedit student ${id}`);
});
// Menggunakan middleware
app.use(express.json());
app.use(express.urlencoded());
// Menggunakan routing (router)
app.use(router);


// Mendefinisikan port.
app.listen(3000, () => {
  console.log("Server berjalan di http://localhost:3000");
});
*/