/**
 * Jaring pengaman: hapus file di Supabase Storage yang sudah tidak dipakai.
 *
 * Normalnya ini TIDAK menemukan apa-apa. API sudah menghapus file secara
 * otomatis begitu gambar dilepas dari data (lihat lib/storage.ts) — baik saat
 * mengubah maupun menghapus berita/UMKM/lembaga/perangkat/user.
 *
 * Yang masih bisa lolos cuma satu kasus: admin mengunggah gambar lalu
 * MEMBATALKAN formnya. File terlanjur naik, tapi tidak pernah tercatat di
 * database. Script inilah yang menyapunya.
 *
 * Cara pakai:
 *   pnpm cleanup-storage            -> cuma NAMPILIN apa yang bakal dihapus
 *   pnpm cleanup-storage --delete   -> beneran hapus
 *
 * Aman: file yang masih dipakai DB tidak akan kesentuh, karena dicek dulu.
 */
const { S3Client, ListObjectsV2Command, DeleteObjectsCommand } = require('@aws-sdk/client-s3');
const postgres = require('postgres');

const BUCKET = 'public-assets';
const DELETE = process.argv.includes('--delete');

const s3 = new S3Client({
  forcePathStyle: true,
  region: 'auto',
  endpoint: process.env.PUBLIC_BUCKET_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
});

const sql = postgres(process.env.DATABASE_URL);

/** Ubah URL publik jadi path di dalam bucket. */
function toKey(url) {
  if (!url) return null;
  const after = String(url).split(`/${BUCKET}/`)[1];
  return after ? decodeURIComponent(after) : null;
}

async function main() {
  // 1. Semua file yang ADA di storage (ListObjectsV2 dibatasi 1000/panggilan)
  const files = [];
  let token;
  do {
    const res = await s3.send(new ListObjectsV2Command({ Bucket: BUCKET, ContinuationToken: token }));
    (res.Contents || []).forEach((o) => files.push({ key: o.Key, size: o.Size }));
    token = res.NextContinuationToken;
  } while (token);

  // 2. Semua file yang MASIH DIPAKAI menurut database
  const [berita, umkm, perangkat, lembaga, regulasi] = await Promise.all([
    sql`SELECT gambar, konten FROM berita`,
    sql`SELECT gambar, galeri_foto FROM umkm`,
    sql`SELECT foto FROM perangkat_desa WHERE foto IS NOT NULL`,
    sql`SELECT gambar, deskripsi FROM lembaga`,
    sql`SELECT file_url, deskripsi FROM regulasi`,
  ]);

  const used = new Set();
  const mark = (v) => { const k = toKey(v); if (k) used.add(k); };

  // Gambar yang disisipkan lewat editor teks kaya nempel DI DALAM HTML, bukan
  // di kolom tersendiri. Tanpa penyisiran ini, semuanya dikira nyangkut lalu
  // ikut terhapus — kehilangan data yang senyap.
  const markTeks = (teks) =>
    (String(teks || '').match(/[^"'\s<>()]+\/public-assets\/[^"'\s<>()]+/g) || []).forEach(mark);

  berita.forEach((r) => { mark(r.gambar); markTeks(r.konten); });
  umkm.forEach((r) => { mark(r.gambar); (r.galeri_foto || []).forEach(mark); });
  perangkat.forEach((r) => mark(r.foto));
  lembaga.forEach((r) => { mark(r.gambar); markTeks(r.deskripsi); });
  regulasi.forEach((r) => { mark(r.file_url); markTeks(r.deskripsi); });

  // 3. Sisanya = nyangkut. Penanda folder bawaan Supabase jangan disentuh.
  const orphans = files.filter(
    (f) => !used.has(f.key) && !f.key.endsWith('.emptyFolderPlaceholder')
  );

  const mb = (bytes) => (bytes / 1024 / 1024).toFixed(2);
  console.log(`File di storage : ${files.length} (${mb(files.reduce((s, f) => s + f.size, 0))} MB)`);
  console.log(`Masih dipakai   : ${used.size}`);
  console.log(`Nyangkut        : ${orphans.length} (${mb(orphans.reduce((s, f) => s + f.size, 0))} MB)`);

  if (orphans.length === 0) {
    console.log('\nStorage udah bersih.');
    return;
  }

  console.log();
  orphans.forEach((o) => console.log(`  ${o.key}  (${(o.size / 1024).toFixed(0)} KB)`));

  if (!DELETE) {
    console.log('\nIni cuma pratinjau, belum ada yang dihapus.');
    console.log('Kalau daftar di atas udah bener, jalankan: pnpm cleanup-storage --delete');
    return;
  }

  // DeleteObjects maksimal 1000 key sekali panggil
  for (let i = 0; i < orphans.length; i += 1000) {
    await s3.send(new DeleteObjectsCommand({
      Bucket: BUCKET,
      Delete: { Objects: orphans.slice(i, i + 1000).map((o) => ({ Key: o.key })) },
    }));
  }
  console.log(`\n${orphans.length} file dihapus (${mb(orphans.reduce((s, f) => s + f.size, 0))} MB dibebaskan).`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => { console.error('Gagal:', err.message); process.exit(1); });
