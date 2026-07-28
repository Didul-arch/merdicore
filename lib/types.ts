/* ═══════════════════════════════════════════════════
   Shared Types — Database model interfaces
   Sumber kebenaran tunggal untuk semua halaman.
   ═══════════════════════════════════════════════════ */

// === Berita ===

export interface BeritaItem {
  id: number;
  judul: string;
  slug: string;
  konten: string;
  gambar: string | null;
  status: string;
  views: number;
  penulis_nama: string | null;
  created_at: string;
  updated_at: string;
}

// === UMKM ===

export interface UmkmItem {
  id: number;
  nama_usaha: string;
  deskripsi: string | null;
  no_whatsapp: string | null;
  alamat: string | null;
  gambar: string | null;
  galeri_foto: string[] | null;
  pemilik_nama: string | null;
  created_at: string;
}

// === Perangkat Desa ===

export interface PerangkatDesa {
  id: number;
  user_id: number | null;
  jabatan: string;
  nip: string | null;
  pendidikan_terakhir: string | null;
  foto: string | null;
  masa_jabatan: string | null;
  nama_user: string | null;
  email_user: string | null;
}
