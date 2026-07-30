-- perangkat_desa jadi entitas berdiri sendiri: tidak semua pejabat desa yang
-- tampil di halaman publik perlu akun login, tapi identitas & kontaknya harus
-- selalu ada. Tabelnya masih kosong (fitur lama gak pernah berhasil dipakai),
-- jadi NOT NULL langsung aman tanpa backfill.
ALTER TABLE perangkat_desa ADD COLUMN nama VARCHAR(255) NOT NULL;
ALTER TABLE perangkat_desa ADD COLUMN no_hp VARCHAR(20) NOT NULL;
ALTER TABLE perangkat_desa ALTER COLUMN user_id DROP NOT NULL;

-- Dulu ON DELETE CASCADE: hapus akun login ikut menghapus data pejabatnya.
-- Sekarang datanya berdiri sendiri -- hapus akun cuma boleh melepas
-- kaitannya (jadi NULL), orangnya tetap terdaftar sebagai perangkat desa.
ALTER TABLE perangkat_desa DROP CONSTRAINT perangkat_desa_user_id_fkey;
ALTER TABLE perangkat_desa
  ADD CONSTRAINT perangkat_desa_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
