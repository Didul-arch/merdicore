"use client";

import { useState } from 'react';
import { Search, FileText, Download, Calendar, Eye, ShieldAlert, CheckCircle2 } from 'lucide-react';
import type { Regulation } from '@/lib/types';

interface Props {
  regulations: Regulation[];
}

export default function RegulasiFilter({ regulations }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [selectedReg, setSelectedReg] = useState<Regulation | null>(null);

  const categories = ['Semua', 'Keuangan', 'Ketertiban', 'Kelembagaan', 'Hukum'];

  const filteredRegs = regulations.filter((reg) => {
    const matchesSearch = reg.title.toLowerCase().includes(searchQuery.toLowerCase()) || reg.number.toLowerCase().includes(searchQuery.toLowerCase()) || reg.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Semua' || reg.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <div className="bg-white p-6 rounded-2xl border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="relative w-full md:max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input type="text" placeholder="Cari nomor peraturan, judul, atau kata kunci..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all" />
        </div>
        <div className="flex flex-wrap gap-2 w-full md:w-auto justify-start md:justify-end">
          {categories.map((cat) => (
            <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${selectedCategory === cat ? 'bg-teal-600 text-white shadow-sm' : 'bg-slate-50 border border-gray-200 text-gray-600 hover:bg-gray-100'}`}>{cat}</button>
          ))}
        </div>
      </div>

      {filteredRegs.length > 0 ? (
        <div className="space-y-4">
          {filteredRegs.map((reg) => (
            <div key={reg.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:border-teal-500/20 transition-all group">
              <div className="flex items-start space-x-4 max-w-3xl">
                <div className="p-3 bg-red-50 text-red-500 rounded-xl mt-1 flex-shrink-0"><FileText className="w-6 h-6" /></div>
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-red-600 uppercase tracking-wide">{reg.number}</span>
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded-md">Tahun {reg.year}</span>
                    <span className="px-2 py-0.5 bg-teal-50 text-teal-700 text-[10px] font-bold rounded-md border border-teal-200/30">{reg.category}</span>
                  </div>
                  <h3 className="font-extrabold text-gray-900 text-sm sm:text-base group-hover:text-teal-600 transition-colors leading-tight">{reg.title}</h3>
                  <p className="text-xs text-gray-500 font-light line-clamp-2 leading-relaxed">{reg.summary}</p>
                </div>
              </div>
              <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-4 sm:pt-0 border-gray-50 flex-shrink-0 gap-3">
                <span className="text-[10px] text-gray-400 font-semibold flex items-center space-x-1"><Calendar className="w-3.5 h-3.5 text-gray-400" /><span>Diunggah: {reg.uploadedDate}</span></span>
                <div className="flex gap-2">
                  <button onClick={() => setSelectedReg(reg)} className="border border-teal-600 text-teal-700 hover:bg-teal-50/50 text-xs font-bold px-4 py-2 rounded-xl transition-all flex items-center space-x-1 cursor-pointer"><Eye className="w-3.5 h-3.5" /><span>Rincian</span></button>
                  <button onClick={() => alert(`File draf ${reg.number} siap diunduh dalam format PDF. Hubungi sekretariat desa untuk salinan fisik berstempel resmi.`)} className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm transition-all flex items-center space-x-1 cursor-pointer"><Download className="w-3.5 h-3.5" /><span>PDF</span></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
          <ShieldAlert className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-base font-semibold text-gray-700">Regulasi tidak ditemukan</p>
          <p className="text-xs text-gray-500 mt-1">Coba gunakan kata kunci lain atau pilih semua kategori hukum.</p>
        </div>
      )}

      {selectedReg && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-gray-950/60 backdrop-blur-sm" onClick={() => setSelectedReg(null)} />
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative z-10 border border-gray-100 animate-in fade-in zoom-in-95 duration-200 space-y-6">
            <div className="flex justify-between items-start pb-3 border-b border-gray-100">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-red-600 uppercase tracking-wider">{selectedReg.number}</span>
                <h3 className="text-base sm:text-lg font-extrabold text-gray-950 leading-tight">{selectedReg.title}</h3>
              </div>
              <button onClick={() => setSelectedReg(null)} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-slate-50">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl text-xs text-gray-600 border border-gray-100">
              <div><span className="text-[10px] text-gray-400 font-bold block uppercase">Kategori:</span><span className="font-bold text-gray-800">{selectedReg.category}</span></div>
              <div><span className="text-[10px] text-gray-400 font-bold block uppercase">Tahun Produk Hukum:</span><span className="font-bold text-gray-800">{selectedReg.year}</span></div>
              <div><span className="text-[10px] text-gray-400 font-bold block uppercase">Status Keberlakuan:</span><span className="font-bold text-emerald-600 flex items-center space-x-1"><CheckCircle2 className="w-4 h-4 text-emerald-500" /><span>{selectedReg.status}</span></span></div>
              <div><span className="text-[10px] text-gray-400 font-bold block uppercase">Dokumen Resmi:</span><span className="font-bold text-gray-800">Verifikasi BPD Ponorogo</span></div>
            </div>
            <div className="space-y-1.5">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Ringkasan Ketetapan:</span>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-light whitespace-pre-line">{selectedReg.summary}</p>
            </div>
            <div className="pt-4 border-t border-gray-50 flex gap-3">
              <button onClick={() => setSelectedReg(null)} className="border border-gray-200 hover:bg-slate-50 text-gray-600 text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl transition-all cursor-pointer flex-1">Kembali</button>
              <button onClick={() => alert(`File draf ${selectedReg.number} siap diunduh dalam format PDF. Hubungi sekretariat desa untuk salinan fisik berstempel resmi.`)} className="bg-red-600 hover:bg-red-500 text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 flex-1 cursor-pointer"><Download className="w-4 h-4" /><span>Unduh Draf PDF</span></button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
