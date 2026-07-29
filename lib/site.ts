/**
 * Alamat kanonik situs. Dipakai untuk metadataBase (biar gambar preview
 * WhatsApp/Facebook dapat URL absolut) dan untuk sitemap.
 *
 * Sengaja menumpang NEXTAUTH_URL, bukan bikin env var baru: nilainya sudah
 * wajib diisi benar di lokal maupun Vercel, dan artinya memang sama —
 * alamat situs ini. Satu env var lebih sedikit yang bisa kelupaan.
 */
export const SITE_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';

export const SITE_NAME = 'Desa Pulung Merdiko';

export const SITE_DESCRIPTION =
  'Portal resmi Desa Pulung Merdiko, Kecamatan Pulung, Kabupaten Ponorogo. ' +
  'Berita desa, etalase UMKM warga, profil perangkat, dan layanan aspirasi.';

/** Potong teks jadi panjang yang pas untuk deskripsi hasil pencarian (~160 huruf). */
export function ringkas(teks: string, maks = 160): string {
  const bersih = teks.trim();
  if (bersih.length <= maks) return bersih;
  // Potong di spasi terdekat supaya tidak memotong kata di tengah.
  return bersih.slice(0, maks).replace(/\s+\S*$/, '') + '…';
}
