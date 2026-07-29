import { S3Client, PutObjectCommand, DeleteObjectsCommand } from '@aws-sdk/client-s3';

export const BUCKET = 'public-assets';

const endpoint = process.env.PUBLIC_BUCKET_ENDPOINT || '';

export const s3 = new S3Client({
  forcePathStyle: true,
  region: 'auto',
  endpoint,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
  },
});

/** Host untuk S3 API beda dengan host URL publik, jadi perlu ditukar. */
export function urlPublik(key: string): string {
  const base = endpoint.replace('.storage.supabase.co/storage/v1/s3', '.supabase.co');
  return `${base}/storage/v1/object/public/${BUCKET}/${key}`;
}

export async function unggah(key: string, body: Buffer<ArrayBufferLike>, contentType: string) {
  await s3.send(new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: body, ContentType: contentType }));
}

/** Ubah URL publik jadi path di dalam bucket. Balikin null kalau bukan URL kita. */
export function keKey(url: string | null | undefined): string | null {
  if (!url) return null;
  const setelah = String(url).split(`/${BUCKET}/`)[1];
  return setelah ? decodeURIComponent(setelah.split('?')[0]) : null;
}

/**
 * Kumpulkan semua URL gambar milik kita dari sekumpulan nilai.
 * Nilai boleh berupa URL tunggal, array URL, atau HTML dari editor teks kaya
 * (gambar yang disisipkan di tengah tulisan nempel di dalam <img src="...">).
 */
export function kumpulkanGambar(...nilai: (string | string[] | null | undefined)[]): string[] {
  const hasil = new Set<string>();
  for (const v of nilai) {
    if (!v) continue;
    if (Array.isArray(v)) {
      v.forEach((u) => { const k = keKey(u); if (k) hasil.add(k); });
      continue;
    }
    const teks = String(v);
    const key = keKey(teks);
    if (key) hasil.add(key);
    // Sapu juga URL yang tertanam di dalam HTML.
    for (const m of teks.matchAll(new RegExp(`[^"'\\s<>()]+/${BUCKET}/[^"'\\s<>()]+`, 'g'))) {
      const k = keKey(m[0]);
      if (k) hasil.add(k);
    }
  }
  return [...hasil];
}

/**
 * Hapus file dari storage.
 *
 * SENGAJA tidak melempar error: ini dipanggil SETELAH perubahan database
 * berhasil. Kalau penghapusan file gagal lalu error-nya dilempar, pengguna
 * melihat "gagal menyimpan" padahal datanya sudah tersimpan. File yang gagal
 * dihapus paling banter jadi sampah — dan itu yang disapu `pnpm cleanup-storage`.
 */
export async function hapusGambar(keys: string[]): Promise<void> {
  if (keys.length === 0) return;
  try {
    for (let i = 0; i < keys.length; i += 1000) {
      await s3.send(new DeleteObjectsCommand({
        Bucket: BUCKET,
        Delete: { Objects: keys.slice(i, i + 1000).map((Key) => ({ Key })) },
      }));
    }
  } catch (err) {
    console.error('Gagal menghapus file storage:', keys, err);
  }
}

/**
 * Hapus gambar yang ADA di data lama tapi SUDAH TIDAK ADA di data baru.
 *
 * Perbandingannya berdasarkan isi database sebelum dan sesudah — bukan
 * berdasarkan klik di layar. Ini penting: kalau admin membuang foto lalu
 * membatalkan formnya, tidak ada yang tersimpan sehingga tidak ada yang
 * terhapus. Fotonya aman.
 */
export async function hapusGambarYangDilepas(
  lama: (string | string[] | null | undefined)[],
  baru: (string | string[] | null | undefined)[],
): Promise<void> {
  const sebelum = kumpulkanGambar(...lama);
  const sesudah = new Set(kumpulkanGambar(...baru));
  await hapusGambar(sebelum.filter((k) => !sesudah.has(k)));
}
