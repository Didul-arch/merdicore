import type { Regulation } from '@/lib/types';
import RegulasiFilter from '@/components/regulasi/RegulasiFilter';

const REGULATIONS: Regulation[] = [
  { id: 'reg-1', number: 'Perdes No 02 Tahun 2026', year: 2026, category: 'Keuangan', title: 'Anggaran Pendapatan dan Belanja Desa (APBDes) Tahun Anggaran 2026', status: 'Berlaku', summary: 'Peraturan desa yang mengatur rincian rencana alokasi penerimaan pendapatan asli desa, dana desa dari APBN, alokasi dana desa dari APBD kabupaten, serta rencana pengeluaran belanja desa untuk program pembangunan infrastruktur jalan Dusun Mulyorejo, pemberdayaan tani, dan pelayanan warga.', uploadedDate: '15 Jan 2026' },
  { id: 'reg-2', number: 'Perdes No 05 Tahun 2025', year: 2025, category: 'Ketertiban', title: 'Ketertiban Umum, Kebersihan Lingkungan, dan Sistem Keamanan Pos Ronda', status: 'Berlaku', summary: 'Mengatur hak dan kewajiban warga dalam menjaga kerukunan, ketenteraman lingkungan bersama, wajib lapor bagi tamu menginap 1x24 jam ke Ketua RT setempat, pembagian piket ronda siskamling, serta larangan membuang sampah sembarangan di aliran sungai irigasi sawah.', uploadedDate: '10 Sep 2025' },
  { id: 'reg-3', number: 'Perdes No 01 Tahun 2025', year: 2025, category: 'Kelembagaan', title: 'Tata Kerja Organisasi Pemerintah Desa dan Standar Pelayanan Publik Prima', status: 'Berlaku', summary: 'Mengatur rincian kewenangan, wewenang, deskripsi tugas pokok, fungsi, serta standar waktu pelayanan administrasi kepengurusan surat kependudukan (KTP, KK, Surat Pengantar Nikah) di Kantor Desa Pulung Merdiko demi meningkatkan akuntabilitas aparatur.', uploadedDate: '28 Jan 2025' },
  { id: 'reg-4', number: 'Perdes No 04 Tahun 2024', year: 2024, category: 'Hukum', title: 'Pelestarian Seni Kebudayaan Reog dan Warisan Sejarah Makam Eyang Djajengrana', status: 'Berlaku', summary: 'Peraturan pelindungan aset wisata cagar budaya desa, pengaturan sistem retribusi kebersihan kawasan makam bersejarah Eyang Djajengrana, serta pendampingan pendanaan pelestarian alat musik Karawitan dan paguyuban seni Reog Ponorogo tingkat dusun.', uploadedDate: '14 Nov 2024' },
];

export default function RegulasiPage() {
  return (
    <div className="py-24 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-teal-600 bg-teal-50 px-3 py-1 rounded-full border border-teal-200/50">TRANSPARANSI HUKUM & ATURAN</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-950 tracking-tight">Produk Hukum & Regulasi Desa</h2>
          <p className="text-xs sm:text-sm text-gray-500 font-light leading-relaxed">Menjamin keterbukaan informasi publik kependudukan. Temukan rincian draf Peraturan Desa (Perdes) dan keputusan resmi hasil musyawarah bersama Badan Permusyawaratan Desa (BPD).</p>
          <div className="h-1 w-16 bg-teal-600 rounded mx-auto" />
        </div>

        <RegulasiFilter regulations={REGULATIONS} />
      </div>
    </div>
  );
}
