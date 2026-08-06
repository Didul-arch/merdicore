import type { Metadata } from "next";
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import AspirasiForm from '@/components/contact/AspirasiForm';
import { getPengaturanDesa } from '@/lib/fetchers';

export const metadata: Metadata = {
  title: "Kontak & Aspirasi",
  description: "Alamat kantor, jam pelayanan, dan formulir aspirasi warga Desa Pulung Merdiko.",
  openGraph: { title: "Kontak & Aspirasi", description: "Alamat kantor, jam pelayanan, dan formulir aspirasi warga Desa Pulung Merdiko." },
};

// Regenerate halaman maks tiap 60 detik (ISR) — biar update dari dashboard keliatan
export const revalidate = 60;

export default async function ContactPage() {
  const pengaturan = await getPengaturanDesa();
  return (
    <div className="pt-32 pb-24 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">

        <div className="text-center max-w-3xl mx-auto space-y-4">
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
                    <p className="text-xs sm:text-sm text-gray-600 font-light leading-relaxed mt-0.5">{pengaturan.alamat_kantor}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3.5">
                  <div className="p-2.5 bg-teal-50 text-teal-700 rounded-xl mt-0.5 flex-shrink-0"><Clock className="w-5 h-5" /></div>
                  <div>
                    <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider block">Jam Pelayanan Kantor:</span>
                    <p className="text-xs sm:text-sm text-gray-600 font-light leading-relaxed mt-0.5">{pengaturan.jam_pelayanan}<br /><span className="text-teal-600 italic font-semibold">{pengaturan.jam_pelayanan_catatan}</span></p>
                  </div>
                </div>
                <div className="flex items-start space-x-3.5">
                  <div className="p-2.5 bg-teal-50 text-teal-700 rounded-xl mt-0.5 flex-shrink-0"><Phone className="w-5 h-5" /></div>
                  <div>
                    <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider block">Telepon / WhatsApp Layanan:</span>
                    <p className="text-xs sm:text-sm text-gray-600 font-light mt-0.5">{pengaturan.telepon}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3.5">
                  <div className="p-2.5 bg-teal-50 text-teal-700 rounded-xl mt-0.5 flex-shrink-0"><Mail className="w-5 h-5" /></div>
                  <div>
                    <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider block">Alamat Email Resmi:</span>
                    <p className="text-xs sm:text-sm text-gray-600 font-light mt-0.5">{pengaturan.email}</p>
                  </div>
                </div>
              </div>
            </div>

            {pengaturan.peta_embed_url && (
              <div className="rounded-3xl overflow-hidden border border-gray-100 shadow-sm h-56">
                <iframe
                  src={pengaturan.peta_embed_url}
                  title="Peta wilayah Desa Pulung Merdiko"
                  className="w-full h-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
            )}
          </div>

          <AspirasiForm />
        </div>
      </div>
    </div>
  );
}
