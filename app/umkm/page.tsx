import type { Metadata } from "next";
import { getAllUmkm } from '@/lib/fetchers';
import UmkmSearchableList from '@/components/umkm/UmkmSearchableList';
import UmkmMap from '@/components/umkm/UmkmMap';

export const metadata: Metadata = {
  title: "Etalase UMKM",
  description: "Produk unggulan usaha warga Desa Pulung Merdiko — kerajinan, kuliner, dan hasil tani. Hubungi pemiliknya langsung lewat WhatsApp.",
  openGraph: { title: "Etalase UMKM", description: "Produk unggulan usaha warga Desa Pulung Merdiko — kerajinan, kuliner, dan hasil tani. Hubungi pemiliknya langsung lewat WhatsApp." },
};

// Regenerate halaman maks tiap 60 detik (ISR) — biar update dari dashboard keliatan
export const revalidate = 60;

export default async function UmkmPage() {
  const products = await getAllUmkm(50);
  const titikPeta = products
    .filter((p) => p.latitude != null && p.longitude != null)
    .map((p) => ({ id: p.id, nama_usaha: p.nama_usaha, latitude: p.latitude!, longitude: p.longitude! }));

  return (
    <div className="py-24 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-150">
          <div className="space-y-3 max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-widest text-teal-600 bg-teal-50 px-3 py-1 rounded-full border border-teal-200/50">PASAR EKONOMI LOKAL</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-950 tracking-tight">
              Galeri UMKM Desa Pulung Merdiko
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 font-light leading-relaxed">
              Mendukung penuh perekonomian kerakyatan melalui digitalisasi promosi karya kreasi terbaik warga kami. Hubungi pedagang secara langsung via WhatsApp untuk pemesanan yang mudah dan terpercaya.
            </p>
          </div>
        </div>

        {titikPeta.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-extrabold text-gray-900 tracking-tight">Sebaran Lokasi UMKM</h3>
            <UmkmMap items={titikPeta} />
          </div>
        )}

        {/* Search + Grid — Client Component */}
        <UmkmSearchableList initialData={products} />

      </div>
    </div>
  );
}
