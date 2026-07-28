import { getLatestBerita } from '@/lib/fetchers';
import BeritaSearchableList from '@/components/berita/BeritaSearchableList';

export default async function BeritaPage() {
  const beritaList = await getLatestBerita(50);

  return (
    <div className="py-24 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-teal-600 bg-teal-50 px-3 py-1 rounded-full border border-teal-200/50">KABAR KABUPATEN &amp; DESA</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-950 tracking-tight">
            Pusat Berita &amp; Informasi Desa
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 font-light leading-relaxed">
            Dapatkan informasi terkini seputar kegiatan pemerintahan, pembangunan infrastruktur, pelestarian budaya, sejarah, dan pengumuman resmi Desa Pulung Merdiko.
          </p>
          <div className="h-1 w-16 bg-teal-600 rounded mx-auto" />
        </div>

        {/* Search + Grid — Client Component */}
        <BeritaSearchableList initialData={beritaList} />

      </div>
    </div>
  );
}
