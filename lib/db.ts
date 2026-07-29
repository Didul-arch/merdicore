import postgres from 'postgres';

declare global {
  var postgres: postgres.Sql | undefined;
}

const connectionString = process.env.DATABASE_URL!;

// Setelan wajib untuk serverless + pooler Supabase (DATABASE_URL port 6543):
//   max: 5       JANGAN turunkan ke 1 — /dashboard jalanin 5 query sekaligus
//                pakai Promise.all, dengan 1 koneksi halamannya gantung.
//   prepare:false wajib di transaction mode, koneksi dipakai gantian antar klien.
const sql =
  globalThis.postgres ||
  postgres(connectionString, {
    max: 5,
    idle_timeout: 20,
    prepare: false,
  });

if (process.env.NODE_ENV !== 'production') {
  globalThis.postgres = sql;
}

export default sql;
