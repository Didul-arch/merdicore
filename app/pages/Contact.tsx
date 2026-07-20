import { useState, FormEvent } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle, HelpCircle } from 'lucide-react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'Saran',
    message: '',
  });
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.message) {
      alert('Mohon isi kolom nama dan pesan aspirasi Anda!');
      return;
    }
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setFormData({ name: '', email: '', subject: 'Saran', message: '' });
    }, 3000);
  };

  const updateForm = (field: string, value: string) => setFormData({ ...formData, [field]: value });

  return (
    <div className="py-24 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">

        {/* Title */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-teal-600 bg-teal-50 px-3 py-1 rounded-full border border-teal-200/50">KONTAK & ASPIRASI WARGA</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-950 tracking-tight">
            Hubungi Kantor Desa & Layanan Aspirasi
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 font-light leading-relaxed">
            Kami membuka saluran komunikasi langsung bagi warga untuk memberikan masukan, kritik, pengaduan, maupun saran pembangunan.
          </p>
          <div className="h-1 w-16 bg-teal-600 rounded mx-auto" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* Contact Info */}
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-6">
              <h3 className="font-extrabold text-gray-950 text-base sm:text-lg">Saluran Kontak Resmi</h3>
              <div className="h-0.5 w-10 bg-teal-600 rounded" />

              <div className="space-y-4">
                {[
                  {
                    icon: MapPin,
                    label: 'Alamat Kantor Desa:',
                    content: 'Jl. Raya Pulung No. 45, Desa Pulung Merdiko, Kecamatan Pulung, Kabupaten Ponorogo, Jawa Timur 63481',
                  },
                  {
                    icon: Clock,
                    label: 'Jam Pelayanan Kantor:',
                    content: 'Senin - Jumat: 08:00 - 15:00 WIB',
                  },
                  {
                    icon: Phone,
                    label: 'Telepon / WhatsApp:',
                    content: '+62 812-3456-7890 (Sekretariat Desa)',
                  },
                  {
                    icon: Mail,
                    label: 'Email Resmi:',
                    content: 'pemdes@pulungmerdiko.desa.id',
                  },
                ].map((item) => (
                  <div key={item.label} className="flex items-start space-x-3.5">
                    <div className="p-2.5 bg-teal-50 text-teal-700 rounded-xl mt-0.5 flex-shrink-0">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider block">{item.label}</span>
                      <p className="text-xs sm:text-sm text-gray-600 font-light leading-relaxed mt-0.5">
                        {item.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Map Card */}
            <div className="bg-slate-900 rounded-3xl p-6 text-white relative overflow-hidden h-56 flex flex-col justify-between shadow-md">
              <div className="absolute top-0 right-0 w-44 h-44 bg-teal-500/10 rounded-full blur-2xl" />
              <div className="space-y-1 relative z-10">
                <span className="text-[9px] text-teal-400 font-extrabold uppercase tracking-widest">PETA LOKASI KANTOR</span>
                <h4 className="font-bold text-gray-100 text-sm sm:text-base leading-tight">Desa Pulung Merdiko</h4>
                <p className="text-[11px] text-gray-300 font-light leading-relaxed">Kecamatan Pulung, Ponorogo, Jawa Timur</p>
              </div>

              <div className="h-20 bg-slate-800/80 rounded-2xl p-3 flex items-center justify-between border border-slate-700/50 relative z-10">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-emerald-400 block">✓ Koordinat GPS</span>
                  <span className="font-mono text-[9px] text-gray-400">Lat: -7.8643, Lng: 111.6421</span>
                </div>
                <button
                  onClick={() => window.open('https://maps.google.com/?q=Pulung+Ponorogo', '_blank')}
                  className="bg-teal-600 hover:bg-teal-500 text-white text-[10px] font-bold px-3.5 py-2 rounded-xl transition-all cursor-pointer flex-shrink-0"
                >
                  Buka Peta
                </button>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-gray-100 space-y-6">
            <h3 className="font-extrabold text-gray-950 text-base sm:text-lg flex items-center space-x-1.5">
              <Send className="w-5 h-5 text-teal-600" />
              <span>Formulir Aspirasi & Kotak Saran</span>
            </h3>
            <div className="h-0.5 w-10 bg-teal-600 rounded" />

            {success ? (
              <div className="text-center py-16 space-y-4 animate-fade-in">
                <div className="w-16 h-16 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mx-auto border border-teal-100">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <h4 className="font-bold text-gray-900 text-base sm:text-lg">Aspirasi Sukses Terkirim!</h4>
                <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
                  Terima kasih atas kepedulian Anda. Aspirasi Anda telah dicatat untuk ditinjau oleh Kepala Desa.
                </p>
                <p className="text-[10px] text-gray-400 italic">* Demo: pesan tidak terkirim ke server.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Nama Lengkap</label>
                    <input
                      type="text"
                      placeholder="Contoh: Ahmad Subardjo"
                      value={formData.name}
                      onChange={(e) => updateForm('name', e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Email / No. HP</label>
                    <input
                      type="text"
                      placeholder="Contoh: ahmad@gmail.com"
                      value={formData.email}
                      onChange={(e) => updateForm('email', e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Kategori Aspirasi</label>
                  <select
                    value={formData.subject}
                    onChange={(e) => updateForm('subject', e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
                  >
                    <option value="Saran">Saran Pembangunan Desa</option>
                    <option value="Aspirasi">Aspirasi Layanan Umum</option>
                    <option value="Pengaduan">Pengaduan Infrastruktur Rusak</option>
                    <option value="Lainnya">Lain-lain / Pertanyaan</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Detail Aspirasi</label>
                  <textarea
                    placeholder="Sampaikan aspirasi secara jelas dan konstruktif..."
                    rows={4}
                    value={formData.message}
                    onChange={(e) => updateForm('message', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all resize-none"
                    maxLength={500}
                    required
                  />
                </div>

                <div className="text-[10px] text-gray-400 font-light leading-relaxed bg-slate-50 p-3 rounded-xl border border-gray-100 flex items-start space-x-1.5">
                  <HelpCircle className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span>
                    Demo: formulir ini belum terhubung ke backend. Data tidak tersimpan.
                  </span>
                </div>

                <button
                  type="submit"
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold py-3.5 rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Kirim Aspirasi Saya</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
