-- ============================================
-- LENSIQUE - DATABASE MIGRATIONS
-- ============================================
-- File ini berisi ALTER TABLE untuk menambah kolom baru
-- Tanpa menghapus atau merusak data yang sudah ada.
-- Jalankan perintah ini satu per satu di MySQL.
-- ============================================

-- --------------------------------------------
-- Tabel users
-- --------------------------------------------
-- Tambah kolom is_active untuk mengaktifkan/menonaktifkan user
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active TINYINT(1) DEFAULT 1;

-- Tambah kolom last_login untuk mencatat waktu login terakhir
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP NULL;

-- --------------------------------------------
-- Tabel user_profile
-- --------------------------------------------
-- Tambah kolom avatar_url sebagai alternatif dari avatar
ALTER TABLE user_profile ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(255);

-- --------------------------------------------
-- Tabel inventory_log
-- --------------------------------------------
-- Tambah kolom old_stock untuk stok sebelum perubahan
ALTER TABLE inventory_log ADD COLUMN IF NOT EXISTS old_stock INT DEFAULT 0;

-- Tambah kolom new_stock untuk stok setelah perubahan
ALTER TABLE inventory_log ADD COLUMN IF NOT EXISTS new_stock INT DEFAULT 0;

-- Tambah kolom changed_by untuk mencatat siapa yang mengubah stok
ALTER TABLE inventory_log ADD COLUMN IF NOT EXISTS changed_by INT;

-- Tambah kolom changed_at untuk waktu perubahan stok
ALTER TABLE inventory_log ADD COLUMN IF NOT EXISTS changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- --------------------------------------------
-- Update data lama (opsional)
-- --------------------------------------------
-- Set semua user yang sudah ada menjadi aktif
UPDATE users SET is_active = 1 WHERE is_active IS NULL;

-- Update avatar_url dari avatar yang sudah ada
UPDATE user_profile SET avatar_url = avatar WHERE avatar_url IS NULL AND avatar IS NOT NULL;

-- --------------------------------------------
-- Tabel payments
-- --------------------------------------------
-- Tambah kolom verified_by untuk mencatat admin yang verifikasi pembayaran
ALTER TABLE payments ADD COLUMN IF NOT EXISTS verified_by INT;

-- Tambah kolom verified_at untuk waktu verifikasi pembayaran
ALTER TABLE payments ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP NULL;

-- --------------------------------------------
-- Tabel shipping_info
-- --------------------------------------------
-- Tambah kolom updated_at untuk waktu terakhir update pengiriman
ALTER TABLE shipping_info ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Tambah kolom admin_notes untuk catatan admin
ALTER TABLE shipping_info ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- --------------------------------------------
-- Tabel reviews
-- --------------------------------------------
-- Tambah kolom updated_at untuk waktu edit review
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- --------------------------------------------
-- Tabel orders
-- --------------------------------------------
-- Tambah kolom order_status sebagai status detail pesanan (jika belum ada)
-- Note: kolom status sudah ada, tapi kita tambahkan updated_at eksplisit
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_status VARCHAR(50);

-- Update order_status dari status yang sudah ada
UPDATE orders SET order_status = status WHERE order_status IS NULL;
