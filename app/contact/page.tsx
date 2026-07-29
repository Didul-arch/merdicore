import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import AspirasiForm from '@/components/contact/AspirasiForm';

export default function ContactPage() {
  return (
    <div className="py-24 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">

        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-teal-600 bg-teal-50 px-3 py-1 rounded-full border border-teal-200/50">KONTAK & ASPIRASI WARGA</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-950 tracking-tight">
            Hubungi Kantor Desa & Layanan Aspirasi
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 font-light leading-relaxed">
            Membangun tata kelola desa yang responsif dan transparan. Kami membuka saluran komunikasi langsung bagi warga untuk memberikan masukan, kritik, pengaduan, maupun saran pembangunan demi kemajuan Desa Pulung Merdiko.
          </p>
          <div className="h-1 w-16 bg-teal-600 rounded mx-auto" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-6">
              <h3 className="font-extrabold text-gray-950 text-base sm:text-lg">Saluran Kontak Resmi</h3>
              <div className="h-0.5 w-10 bg-teal-600 rounded" />
              <div className="space-y-4">
                <div className="flex items-start space-x-3.5">
                  <div className="p-2.5 bg-teal-50 text-teal-700 rounded-xl mt-0.5 flex-shrink-0"><MapPin className="w-5 h-5" /></div>
                  <div>
                    <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider block">Alamat Kantor Desa:</span>
                    <p className="text-xs sm:text-sm text-gray-600 font-light leading-relaxed mt-0.5">Jl. Raya Pulung No. 45, Desa Pulung Merdiko, Kecamatan Pulung, Kabupaten Ponorogo, Jawa Timur 63481</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3.5">
                  <div className="p-2.5 bg-teal-50 text-teal-700 rounded-xl mt-0.5 flex-shrink-0"><Clock className="w-5 h-5" /></div>
                  <div>
                    <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider block">Jam Pelayanan Kantor:</span>
                    <p className="text-xs sm:text-sm text-gray-600 font-light leading-relaxed mt-0.5">Senin - Jumat: 08:00 - 15:00 WIB<br /><span className="text-teal-600 italic font-semibold">* Sabtu, Minggu, & Libur Nasional: Tutup</span></p>
                  </div>
                </div>
                <div className="flex items-start space-x-3.5">
                  <div className="p-2.5 bg-teal-50 text-teal-700 rounded-xl mt-0.5 flex-shrink-0"><Phone className="w-5 h-5" /></div>
                  <div>
                    <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider block">Telepon / WhatsApp Layanan:</span>
                    <p className="text-xs sm:text-sm text-gray-600 font-light mt-0.5">+62 812-3456-7890 (Sekretariat Desa)</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3.5">
                  <div className="p-2.5 bg-teal-50 text-teal-700 rounded-xl mt-0.5 flex-shrink-0"><Mail className="w-5 h-5" /></div>
                  <div>
                    <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider block">Alamat Email Resmi:</span>
                    <p className="text-xs sm:text-sm text-gray-600 font-light mt-0.5">pemdes@pulungmerdiko.desa.id</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 rounded-3xl p-6 text-white relative overflow-hidden h-56 flex flex-col justify-between shadow-md border border-slate-850">
              <div className="absolute top-0 right-0 w-44 h-44 bg-teal-500/10 rounded-full blur-2xl" />
              <div className="space-y-1 relative z-10">
                <span className="text-[9px] text-teal-400 font-extrabold uppercase tracking-widest">PETA LOKASI KANTOR</span>
                <h4 className="font-bold text-gray-100 text-sm sm:text-base leading-tight">Desa Pulung Merdiko</h4>
                <p className="text-[11px] text-gray-300 font-light leading-relaxed">Kecamatan Pulung, Ponorogo, Jawa Timur</p>
              </div>
              <div className="h-20 bg-slate-800/80 rounded-2xl p-3 flex items-center justify-between border border-slate-700/50 relative z-10">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-emerald-400 block">✓ Koordinat GPS Presisi</span>
                  <span className="font-mono text-[9px] text-gray-400">Lat: -7.8643, Lng: 111.6421</span>
                </div>
                <a href="https://maps.google.com/?q=Pulung+Ponorogo" target="_blank" rel="noreferrer" className="bg-teal-600 hover:bg-teal-500 text-white text-[10px] font-bold px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center space-x-1 flex-shrink-0">
                  <span>Buka Peta</span>
                </a>
              </div>
            </div>
          </div>

          <AspirasiForm />
        </div>
      </div>
    </div>
  );
}
