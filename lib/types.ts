// === Berita ===

export interface BeritaItem {
  id: number;
  judul: string;
  slug: string;
  konten: string;
  gambar: string | null;
  gambar_fokus: string | null;
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
  gambar_fokus: string | null;
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
  gambar_fokus: string | null;
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
  nama: string;
  no_hp: string;
  jabatan: string;
  nip: string | null;
  pendidikan_terakhir: string | null;
  foto: string | null;
  foto_fokus: string | null;
  masa_jabatan: string | null;
  // Terisi kalau baris ini dikaitkan ke akun login (opsional).
  nama_user: string | null;
  email_user: string | null;
}
