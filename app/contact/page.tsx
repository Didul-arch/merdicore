import type { Metadata } from "next";
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import AspirasiForm from '@/components/contact/AspirasiForm';

export const metadata: Metadata = {
  title: "Kontak & Aspirasi",
  description: "Alamat kantor, jam pelayanan, dan formulir aspirasi warga Desa Pulung Merdiko.",
  openGraph: { title: "Kontak & Aspirasi", description: "Alamat kantor, jam pelayanan, dan formulir aspirasi warga Desa Pulung Merdiko." },
};

export default function ContactPage() {
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

            <div className="rounded-3xl overflow-hidden border border-gray-100 shadow-sm h-56">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d19616.56775967318!2d111.6008402!3d-7.8813414!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e79a76e1b735f29%3A0x535c125eec828e68!2sPulung%20Merdiko%2C%20Kec.%20Pulung%2C%20Kabupaten%20Ponorogo%2C%20Jawa%20Timur!5e1!3m2!1sid!2sid!4v1785942416008!5m2!1sid!2sid"
                title="Peta wilayah Desa Pulung Merdiko"
                className="w-full h-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </div>

          <AspirasiForm />
        </div>
      </div>
    </div>
  );
}
