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

// === Lembaga ===

export interface LembagaItem {
  id: number;
  nama_lengkap: string;
  singkatan: string | null;
  nama_ketua: string | null;
  jumlah_anggota: number;
  deskripsi: string | null;
  gambar: string | null;
}

// === Regulasi (statis, belum ada tabel DB) ===

export interface Regulation {
  id: string;
  number: string;
  year: number;
  title: string;
  category: 'Keuangan' | 'Ketertiban' | 'Kelembagaan' | 'Hukum';
  status: 'Berlaku' | 'Direvisi';
  summary: string;
  uploadedDate: string;
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
