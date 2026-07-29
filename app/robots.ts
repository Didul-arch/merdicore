import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

// Next mengubah berkas ini jadi /robots.txt otomatis.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Halaman admin & endpoint API tidak ada gunanya di hasil pencarian.
      // Ini cuma soal kerapian, BUKAN pengaman — yang menjaga tetap requireRole
      // di server. robots.txt hanya imbauan yang bisa diabaikan.
      disallow: ['/dashboard', '/api', '/login'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
