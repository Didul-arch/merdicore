-- Titik fokus crop, disimpan langsung sebagai nilai CSS object-position
-- (contoh: "62% 18%"). NULL berarti pakai default "50% 50%" (tengah) —
-- baris lama otomatis tetap tampil sama seperti sebelum kolom ini ada.
ALTER TABLE berita ADD COLUMN gambar_fokus VARCHAR(20);
ALTER TABLE umkm ADD COLUMN gambar_fokus VARCHAR(20);
ALTER TABLE lembaga ADD COLUMN gambar_fokus VARCHAR(20);
ALTER TABLE perangkat_desa ADD COLUMN foto_fokus VARCHAR(20);
