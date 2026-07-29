"use client";

import { useState, FormEvent } from 'react';
import { Send, CheckCircle, HelpCircle } from 'lucide-react';

export default function AspirasiForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'Saran',
    message: ''
  });
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.message) {
      alert('Mohon isi kolom nama dan pesan aspirasi Anda!');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/pesan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama_pengirim: formData.name,
          email: formData.email || null,
          isi_pesan: `[${formData.subject}] ${formData.message}`,
        }),
      });
      if (!res.ok) throw new Error();
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setFormData({ name: '', email: '', subject: 'Saran', message: '' });
      }, 3000);
    } catch {
      setError('Gagal mengirim aspirasi. Silakan coba lagi beberapa saat.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="lg:col-span-7 bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-gray-100 space-y-6">
      <h3 className="font-extrabold text-gray-950 text-base sm:text-lg flex items-center space-x-1.5">
        <Send className="w-5 h-5 text-teal-600" /><span>Formulir Aspirasi & Kotak Saran Digital</span>
      </h3>
      <div className="h-0.5 w-10 bg-teal-600 rounded" />

      {success ? (
        <div className="text-center py-16 space-y-4 animate-in fade-in duration-300">
          <div className="w-16 h-16 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mx-auto border border-teal-100"><CheckCircle className="w-10 h-10" /></div>
          <h4 className="font-bold text-gray-900 text-base sm:text-lg">Aspirasi Sukses Terkirim!</h4>
          <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">Terima kasih atas kepedulian Anda. Saran dan aspirasi Anda telah dicatat oleh sistem kearsipan desa untuk ditinjau oleh Kepala Desa dan sekretariat.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1">
              <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Nama Lengkap Anda</label>
              <input type="text" placeholder="Contoh: Ahmad Subardjo" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all" required />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Alamat Email / No. HP</label>
              <input type="text" placeholder="Contoh: ahmad@gmail.com" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Kategori Aspirasi</label>
            <select value={formData.subject} onChange={(e) => setFormData({...formData, subject: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all">
              <option value="Saran">Saran Pembangunan Desa</option>
              <option value="Aspirasi">Aspirasi Layanan Umum</option>
              <option value="Pengaduan">Pengaduan Infrastruktur Rusak</option>
              <option value="Lainnya">Lain-lain / Pertanyaan</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Detail Aspirasi Warga</label>
            <textarea placeholder="Sampaikan aspirasi secara jelas, santun, dan konstruktif..." rows={4} value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all resize-none" maxLength={500} required />
          </div>
          <div className="text-[10px] text-gray-400 font-light leading-relaxed bg-slate-50 p-3 rounded-xl border border-gray-100 flex items-start space-x-1.5">
            <HelpCircle className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
            <span>Pemdes Pulung Merdiko menjamin kerahasiaan identitas pelapor untuk pengaduan tertentu. Kami mengapresiasi keikutsertaan Anda demi kelangsungan pembangunan Ponorogo.</span>
          </div>
          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{error}</p>
          )}
          <button type="submit" disabled={submitting} className="w-full bg-[#0f172a] hover:bg-[#1e293b] disabled:opacity-60 text-white text-xs sm:text-sm font-bold py-3.5 rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer">
            <Send className="w-4 h-4" /><span>{submitting ? 'Mengirim...' : 'Kirim Aspirasi Saya'}</span>
          </button>
        </form>
      )}
    </div>
  );
}
