import type { MetadataRoute } from 'next';
import sql from '@/lib/db';
import { SITE_URL } from '@/lib/site';

// Next mengubah berkas ini jadi /sitemap.xml otomatis.
// Ikut aturan ISR halaman publik: cukup segar tanpa query DB tiap kunjungan bot.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const halamanTetap: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/berita`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/umkm`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/tentang`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/lembaga`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/regulasi`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/contact`, changeFrequency: 'yearly', priority: 0.5 },
  ];

  try {
    // Hanya berita berstatus published — draft belum layak ditemukan publik.
    const [berita, umkm] = await Promise.all([
      sql`SELECT id, updated_at FROM berita WHERE status = 'published' ORDER BY id`,
      sql`SELECT id, created_at FROM umkm ORDER BY id`,
    ]);

    return [
      ...halamanTetap,
      ...berita.map((b) => ({
        url: `${SITE_URL}/berita/${b.id}`,
        lastModified: new Date(b.updated_at as string),
        changeFrequency: 'monthly' as const,
        priority: 0.8,
      })),
      ...umkm.map((u) => ({
        url: `${SITE_URL}/umkm/${u.id}`,
        lastModified: new Date(u.created_at as string),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      })),
    ];
  } catch (err) {
    // Kalau database sedang bermasalah, tetap sajikan halaman tetapnya —
    // sitemap separuh jauh lebih baik daripada sitemap error.
    console.error('Sitemap gagal mengambil data:', err);
    return halamanTetap;
  }
}
