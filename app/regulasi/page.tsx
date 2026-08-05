import type { Metadata } from "next";
import { getAllRegulasi } from '@/lib/fetchers';
import RegulasiTabs from '@/components/regulasi/RegulasiTabs';

export const metadata: Metadata = {
  title: "Produk Hukum & Layanan",
  description: "Peraturan Desa (Perdes) dan persyaratan surat-menyurat resmi Desa Pulung Merdiko yang terbuka untuk umum.",
  openGraph: { title: "Produk Hukum & Layanan", description: "Peraturan Desa (Perdes) dan persyaratan surat-menyurat resmi Desa Pulung Merdiko yang terbuka untuk umum." },
};

// Regenerate halaman maks tiap 60 detik (ISR) — biar update dari dashboard keliatan
export const revalidate = 60;

export default async function RegulasiPage() {
  const regulasi = await getAllRegulasi();

  return (
    <div className="pt-32 pb-24 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-950 tracking-tight">Produk Hukum & Persyaratan Surat</h2>
          <p className="text-xs sm:text-sm text-gray-500 font-light leading-relaxed">Menjamin keterbukaan informasi publik. Temukan draf Peraturan Desa (Perdes) resmi, serta syarat dan alur pengurusan surat-menyurat.</p>
          <div className="h-1 w-16 bg-teal-600 rounded mx-auto" />
        </div>

        <RegulasiTabs regulasi={regulasi} />
      </div>
    </div>
  );
}
