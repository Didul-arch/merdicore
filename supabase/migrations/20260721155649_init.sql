-- 1. ENUM ROLE USER
CREATE TYPE user_role AS ENUM ('super_admin', 'perangkat_desa', 'pemilik_umkm');

-- 2. TABEL USERS (Induk Pengguna)
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  nama VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role user_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABEL PERANGKAT_DESA (Profil tambahan untuk perangkat desa)
CREATE TABLE perangkat_desa (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  jabatan VARCHAR(100) NOT NULL,
  nip VARCHAR(50),
  pendidikan_terakhir VARCHAR(100),
  foto VARCHAR(255),
  masa_jabatan VARCHAR(50)
);

-- 4. TABEL BERITA
CREATE TABLE berita (
  id SERIAL PRIMARY KEY,
  judul VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  konten TEXT NOT NULL,
  gambar VARCHAR(255),
  status VARCHAR(20) DEFAULT 'draft', -- 'draft' atau 'published'
  penulis_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. TABEL UMKM
CREATE TABLE umkm (
  id SERIAL PRIMARY KEY,
  nama_usaha VARCHAR(255) NOT NULL,
  pemilik_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  deskripsi TEXT,
  no_whatsapp VARCHAR(20),
  alamat VARCHAR(255),
  gambar VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. TABEL LEMBAGA (PKK, Gapoktan, dll)
CREATE TABLE lembaga (
  id SERIAL PRIMARY KEY,
  nama_lengkap VARCHAR(255) NOT NULL,
  singkatan VARCHAR(50),
  nama_ketua VARCHAR(150),
  jumlah_anggota INTEGER DEFAULT 0,
  deskripsi TEXT,
  gambar VARCHAR(255)
);

-- 7. TABEL PESAN (Aspirasi / Kontak Warga)
CREATE TABLE pesan (
  id SERIAL PRIMARY KEY,
  nama_pengirim VARCHAR(150) NOT NULL,
  email VARCHAR(255),
  no_hp VARCHAR(20),
  isi_pesan TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'belum_dibaca', -- 'belum_dibaca' atau 'sudah_dibaca'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);