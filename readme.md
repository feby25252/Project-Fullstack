# 🚀 Lensique Backend API

Backend API sederhana menggunakan **Express.js** untuk fitur autentikasi user.

---

## 📌 Deskripsi

Project ini merupakan backend untuk aplikasi Lensique yang menyediakan fitur:

* Register user
* Login user (menggunakan JWT)
* Melihat profile user
* Logout

Backend ini dibuat menggunakan **Node.js** dan **Express.js** tanpa database (menggunakan dummy data).

---

## 🛠️ Teknologi yang Digunakan

* Node.js
* Express.js
* JSON Web Token (JWT)
* bcrypt
* Nodemon

---

## 📁 Struktur Folder

```
Lensique-Backend/
│
├── app.js
├── package.json
├── routes/
│   └── auth.js
├── controllers/
│   └── AuthController.js
├── models/
│   └── User.js
```

---

## ⚙️ Cara Menjalankan Project

1. Clone repository:

```
git clone https://github.com/USERNAME/NAMA-REPO.git
```

2. Masuk ke folder project:

```
cd Lensique-Backend
```

3. Install dependencies:

```
npm install
```

4. Jalankan server:

```
npm run dev
```

5. Buka di browser:

```
http://localhost:3000/
```

---

## 🔗 Endpoint API

### 🔐 Auth

#### 1. Register

* **POST** `/register`

Body:

```json
{
  "username": "lira",
  "password": "1234"
}
```

---

#### 2. Login

* **POST** `/login`

Body:

```json
{
  "username": "lira",
  "password": "1234"
}
```

Response:

```json
{
  "message": "Login sukses",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImxpcmEiLCJpYXQiOjE3NzM5NDE4NDQsImV4cCI6MTc3Mzk0NTQ0NH0.kLOQAWZC_MMtCpRE0BItJXLjzfr0-emiuWobFhl-x3U"
}
```

---

#### 3. Profile

* **GET** `/profile`

Headers:

```
Authorization: <token>
```

---

#### 4. Logout

* **POST** `/logout`

---

## Testing

saya menggunakan Postman untuk menguji endpoint API.

---

## Catatan

* Data user masih menggunakan **array (dummy)**, belum menggunakan database.
* Token JWT digunakan untuk autentikasi user.

---

## Author

* Nama: Lira Liska
* NIM: 0110224195


