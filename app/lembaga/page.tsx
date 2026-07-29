import { Users2 } from 'lucide-react';
import { getAllLembaga } from '@/lib/fetchers';
import LembagaTabs from '@/components/lembaga/LembagaTabs';

// Regenerate halaman maks tiap 60 detik (ISR) — biar update dari dashboard keliatan
export const revalidate = 60;

export default async function LembagaPage() {
  const lembagaList = await getAllLembaga();

  return (
    <div className="py-24 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

        {/* Title */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-teal-600 bg-teal-50 px-3 py-1 rounded-full border border-teal-200/50">WADAH SOSIAL KEMASYARAKATAN</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-950 tracking-tight">
            Lembaga Kemasyarakatan Desa
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 font-light leading-relaxed">
            Menelusuri peran penting organisasi kemasyarakatan yang aktif menggerakkan roda pemberdayaan, kemandirian pemuda, dan pembangunan swadaya warga di Desa Pulung Merdiko.
          </p>
          <div className="h-1 w-16 bg-teal-600 rounded mx-auto" />
        </div>

        {lembagaList.length > 0 ? (
          <LembagaTabs lembagaList={lembagaList} />
        ) : (
          <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-200">
            <Users2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-base font-semibold text-gray-700">Belum Ada Data Lembaga</p>
            <p className="text-xs text-gray-500 mt-1">Silakan tambahkan data melalui dashboard admin.</p>
          </div>
        )}
      </div>
    </div>
  );
}
