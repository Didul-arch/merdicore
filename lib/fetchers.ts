/* ═══════════════════════════════════════════════════
   Server-Side Data Fetchers
   Query database langsung dari Server Components.
   JANGAN import file ini di Client Components.
   ═══════════════════════════════════════════════════ */

import sql from '@/lib/db';
import type { BeritaItem, UmkmItem, PerangkatDesa } from '@/lib/types';

// ─── Berita ─────────────────────────────────────────

export async function getLatestBerita(limit = 10): Promise<BeritaItem[]> {
  const rows = await sql`
    SELECT b.id, b.judul, b.slug, b.konten, b.gambar, b.status, b.views,
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

// ─── UMKM ───────────────────────────────────────────

export async function getAllUmkm(limit = 50): Promise<UmkmItem[]> {
  const rows = await sql`
    SELECT um.id, um.nama_usaha, um.deskripsi, um.no_whatsapp, um.alamat,
           um.gambar, um.galeri_foto, um.created_at, u.nama AS pemilik_nama
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

// ─── Perangkat Desa ─────────────────────────────────

export async function getAllPerangkatDesa(limit = 50): Promise<PerangkatDesa[]> {
  const rows = await sql`
    SELECT pd.id, pd.user_id, pd.jabatan, pd.nip, pd.pendidikan_terakhir,
           pd.foto, pd.masa_jabatan, u.nama AS nama_user, u.email AS email_user
    FROM perangkat_desa pd
    LEFT JOIN users u ON pd.user_id = u.id
    ORDER BY pd.id ASC
    LIMIT ${limit}
  `;
  return rows as unknown as PerangkatDesa[];
}
