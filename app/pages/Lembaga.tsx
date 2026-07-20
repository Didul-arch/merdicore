import { useState } from 'react';
import { Users, Shield, Award, CheckCircle } from 'lucide-react';

interface LembagaData {
  id: string;
  name: string;
  fullname: string;
  description: string;
  leader: string;
  membersCount: number;
  programs: string[];
  image: string;
}

const LEMBAGA_LIST: LembagaData[] = [
  {
    id: 'pkk',
    name: 'PKK',
    fullname: 'Pemberdayaan Kesejahteraan Keluarga',
    leader: 'Ibu Slamet Raharjo (Ketua TP PKK)',
    membersCount: 48,
    description: 'Lembaga kemasyarakatan yang memberdayakan kaum wanita dan ibu-ibu dalam berpartisipasi meningkatkan kesejahteraan keluarga, gizi anak, kesehatan balita, dan keterampilan kerajinan industri rumah tangga.',
    programs: [
      'Posyandu Balita & Lansia rutin bulanan untuk mengontrol kesehatan.',
      'Penyuluhan Gizi Seimbang dan Pencegahan Stunting Anak Usia Dini.',
      'Pelatihan Kewirausahaan Ibu Rumah Tangga membuat Anyaman Bambu dan Keripik Tempe.',
      'Taman Gizi Keluarga melalui pemanfaatan lahan pekarangan rumah.',
    ],
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'poktan_segrobyak',
    name: 'Poktan Segrobyak',
    fullname: 'Kelompok Tani Unggul Makmur (Dukuh Segrobyak)',
    leader: 'Ketua Kelompok Tani',
    membersCount: 25,
    description: 'Wadah para petani di wilayah Dukuh Segrobyak untuk bertukar informasi, bekerja sama dalam pengelolaan lahan pertanian, dan meningkatkan hasil panen secara bersama-sama.',
    programs: [
      'Penyediaan pupuk dan bibit unggul bersama.',
      'Pengembangan teknik pertanian modern.',
      'Gotong royong perbaikan saluran irigasi.',
    ],
    image: 'https://images.unsplash.com/photo-1592982537447-6f296bc8e6df?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'poktan_krajan',
    name: 'Poktan Krajan',
    fullname: 'Kelompok Tani Tani Mulyo (Dukuh Krajan)',
    leader: 'Ketua Kelompok Tani',
    membersCount: 25,
    description: 'Wadah berkumpul dan musyawarah para petani di Dukuh Krajan guna memecahkan masalah pertanian, berbagi pengalaman, dan menerapkan teknologi tepat guna di bidang pertanian.',
    programs: [
      'Pertemuan rutin kelompok tani membahas masa tanam.',
      'Pengendalian hama dan penyakit tanaman terpadu.',
      'Peningkatan kapasitas anggota melalui penyuluhan.',
    ],
    image: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'gapoktan',
    name: 'Gapoktan',
    fullname: 'Gabungan Kelompok Tani',
    leader: 'Ketua Gapoktan',
    membersCount: 50,
    description: 'Gabungan dari Kelompok Tani Unggul Makmur (Dukuh Segrobyak) dan Kelompok Tani Tani Mulyo (Dukuh Krajan), yang bersatu bekerja sama mengelola dan meningkatkan kesejahteraan petani di seluruh desa.',
    programs: [
      'Fasilitasi bantuan sarana dan prasarana pertanian dari pemerintah.',
      'Pengembangan unit usaha otonom (simpan pinjam, pemasaran hasil bumi).',
      'Koordinasi dan pengawasan distribusi pupuk bersubsidi untuk kedua poktan.',
    ],
    image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=800&q=80',
  },
];

export default function Lembaga() {
  const [activeTab, setActiveTab] = useState('pkk');
  const activeData = LEMBAGA_LIST.find((l) => l.id === activeTab) ?? LEMBAGA_LIST[0];

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
            Peran penting organisasi kemasyarakatan yang aktif menggerakkan pemberdayaan dan pembangunan swadaya warga di Desa Pulung Merdiko.
          </p>
          <div className="h-1 w-16 bg-teal-600 rounded mx-auto" />
        </div>

        {/* Tabs */}
        <div className="bg-white p-3 rounded-2xl border border-gray-100 flex flex-col sm:flex-row gap-2 max-w-xl mx-auto shadow-sm">
          {LEMBAGA_LIST.map((lembaga) => (
            <button
              key={lembaga.id}
              onClick={() => setActiveTab(lembaga.id)}
              className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${activeTab === lembaga.id
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-slate-50'
                }`}
            >
              {lembaga.name}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-gray-100 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 relative">
            <div className="absolute -top-4 -left-4 w-20 h-20 bg-teal-100/60 rounded-full blur-xl -z-10" />
            <div className="absolute -bottom-4 -right-4 w-40 h-40 bg-slate-900 rounded-3xl -z-10" />
            <img
              src={activeData.image}
              alt={activeData.fullname}
              className="w-full h-80 object-cover rounded-2xl border border-gray-100"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-teal-600">
                Lembaga Resmi Kemasyarakatan
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900">
                {activeData.fullname}
              </h3>
            </div>

            <div className="h-0.5 w-16 bg-teal-600 rounded" />

            <p className="text-xs sm:text-sm text-gray-600 font-light leading-relaxed">
              {activeData.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-gray-100">
              <div className="space-y-1">
                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">Pimpinan:</span>
                <span className="text-xs sm:text-sm font-bold text-gray-800 flex items-center space-x-1.5">
                  <Shield className="w-4 h-4 text-teal-600 flex-shrink-0" />
                  <span>{activeData.leader}</span>
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">Pengurus Aktif:</span>
                <span className="text-xs sm:text-sm font-bold text-gray-800 flex items-center space-x-1.5">
                  <Users className="w-4 h-4 text-teal-600 flex-shrink-0" />
                  <span>{activeData.membersCount} Orang</span>
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-extrabold text-gray-800 uppercase tracking-widest flex items-center space-x-1">
                <Award className="w-4 h-4 text-teal-600" />
                <span>Program Kerja Unggulan:</span>
              </h4>
              <ul className="space-y-2">
                {activeData.programs.map((prog, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span className="text-xs text-gray-600 font-light leading-relaxed">{prog}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
