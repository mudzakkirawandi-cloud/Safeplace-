-- Tambahkan kolom is_online ke tabel users
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_online boolean DEFAULT false;
