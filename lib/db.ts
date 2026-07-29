import postgres from 'postgres';

declare global {
  var postgres: postgres.Sql | undefined;
}

const connectionString = process.env.DATABASE_URL!;

/*
 * Setelan ini penting karena app-nya jalan serverless (Vercel).
 *
 * Tiap request bisa bikin instance baru, dan tiap instance punya pool koneksi
 * sendiri. Tanpa diatur, postgres.js buka sampai 10 koneksi per instance —
 * 2 instance aja udah 20, padahal jatah pooler Supabase cuma 15. Hasilnya:
 * "max clients reached in session mode".
 *
 * max: 1        -> tiap instance cukup 1 koneksi, dia cuma layani 1 request.
 * idle_timeout  -> lepas koneksi yang nganggur, jangan dipegang terus.
 * prepare: false-> WAJIB kalau pakai pooler transaction mode (port 6543).
 *                  Di mode itu koneksi dipakai gantian antar klien, jadi
 *                  prepared statement gak bisa disimpan.
 */
const sql =
  globalThis.postgres ||
  postgres(connectionString, {
    max: 1,
    idle_timeout: 20,
    prepare: false,
  });

if (process.env.NODE_ENV !== 'production') {
  globalThis.postgres = sql;
}

export default sql;
