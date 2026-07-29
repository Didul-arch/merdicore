-- Tambah nomor HP ke users.
--
-- Dibikin nullable di database supaya 2 user yang sudah ada tidak error.
-- Kewajiban mengisi ditegakkan di API waktu menambah user BARU
-- (app/api/users/route.ts), bukan lewat constraint database.
ALTER TABLE users
ADD COLUMN no_hp VARCHAR(20);
