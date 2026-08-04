// Query database langsung dari Server Component — tanpa lewat API route.
// JANGAN import file ini di Client Component: kodenya bakal ikut terkirim
// ke browser bareng kredensial database.
import sql from '@/lib/db';
import type { BeritaItem, UmkmItem, LembagaItem, PerangkatDesa, RegulasiItem } from '@/lib/types';

export async function getLatestBerita(limit = 10): Promise<BeritaItem[]> {
  const rows = await sql`
    SELECT b.id, b.judul, b.slug, b.konten, b.gambar, b.gambar_fokus, b.status, b.views,
           b.created_at, b.updated_at, u.nama AS penulis_nama
    FROM berita b
    LEFT JOIN users u ON b.penulis_id = u.id
    WHERE b.status = 'published'
    ORDER BY b.created_at DESC
    LIMIT ${limit}
  `;
  return rows as unknown as BeritaItem[];
}

export async function getBeritaById(id: number): Promise<BeritaItem | null> {
  const rows = await sql`
    SELECT b.*, u.nama AS penulis_nama
    FROM berita b
    LEFT JOIN users u ON b.penulis_id = u.id
    WHERE b.id = ${id}
  `;
  return (rows[0] as BeritaItem) ?? null;
}

export async function incrementBeritaViews(id: number): Promise<void> {
  await sql`UPDATE berita SET views = views + 1 WHERE id = ${id}`;
}

export async function getAllUmkm(limit = 50): Promise<UmkmItem[]> {
  const rows = await sql`
    SELECT um.id, um.nama_usaha, um.deskripsi, um.no_whatsapp, um.alamat,
           um.gambar, um.gambar_fokus, um.galeri_foto, um.peta_embed_url,
           um.created_at, u.nama AS pemilik_nama
    FROM umkm um
    LEFT JOIN users u ON um.pemilik_id = u.id
    ORDER BY um.created_at DESC
    LIMIT ${limit}
  `;
  return rows as unknown as UmkmItem[];
}

export async function getUmkmById(id: number): Promise<UmkmItem | null> {
  const rows = await sql`
    SELECT um.*, u.nama AS pemilik_nama
    FROM umkm um
    LEFT JOIN users u ON um.pemilik_id = u.id
    WHERE um.id = ${id}
  `;
  return (rows[0] as UmkmItem) ?? null;
}

export async function getAllLembaga(limit = 50): Promise<LembagaItem[]> {
  const rows = await sql`
    SELECT id, nama_lengkap, singkatan, nama_ketua, jumlah_anggota, deskripsi, gambar, gambar_fokus
    FROM lembaga
    ORDER BY id ASC
    LIMIT ${limit}
  `;
  return rows as unknown as LembagaItem[];
}

export async function getAllRegulasi(limit = 100): Promise<RegulasiItem[]> {
  const rows = await sql`
    SELECT * FROM regulasi ORDER BY jenis ASC, created_at DESC LIMIT ${limit}
  `;
  return rows as unknown as RegulasiItem[];
}

export async function getRegulasiById(id: number): Promise<RegulasiItem | null> {
  const rows = await sql`SELECT * FROM regulasi WHERE id = ${id}`;
  return (rows[0] as RegulasiItem) ?? null;
}

export async function getAllPerangkatDesa(limit = 50): Promise<PerangkatDesa[]> {
  const rows = await sql`
    SELECT pd.id, pd.user_id, pd.nama, pd.no_hp, pd.jabatan, pd.nip, pd.pendidikan_terakhir,
           pd.foto, pd.foto_fokus, pd.masa_jabatan, u.nama AS nama_user, u.email AS email_user
    FROM perangkat_desa pd
    LEFT JOIN users u ON pd.user_id = u.id
    ORDER BY pd.id ASC
    LIMIT ${limit}
  `;
  return rows as unknown as PerangkatDesa[];
}
