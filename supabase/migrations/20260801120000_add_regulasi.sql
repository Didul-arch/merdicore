-- Regulasi (Peraturan Desa) & Persyaratan Surat digabung 1 tabel, dibedakan
-- kolom `jenis`. Alasan digabung: sama-sama "dokumen publik + PDF unduhan",
-- dan biar situsnya gak nambah halaman baru buat surat-menyurat.
CREATE TABLE regulasi (
  id SERIAL PRIMARY KEY,
  jenis VARCHAR(20) NOT NULL CHECK (jenis IN ('peraturan', 'surat')),
  judul VARCHAR(255) NOT NULL,
  -- nomor/tahun/kategori/status cuma relevan buat jenis='peraturan',
  -- dibiarkan NULL untuk 'surat'.
  nomor VARCHAR(100),
  tahun INTEGER,
  kategori VARCHAR(20),
  status VARCHAR(20) DEFAULT 'Berlaku',
  deskripsi TEXT,
  file_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
