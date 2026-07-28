-- Tambahkan kolom galeri_foto sebagai Array of Text ke tabel umkm
ALTER TABLE umkm 
ADD COLUMN galeri_foto TEXT[] DEFAULT '{}'::TEXT[];
