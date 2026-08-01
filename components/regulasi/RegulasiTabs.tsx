"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Search, FileText, Download, Calendar, Eye, ShieldAlert, Landmark, ScrollText } from 'lucide-react';
import type { RegulasiItem } from '@/lib/types';
import { teksPolos, formatDate } from '@/lib/utils';

interface Props {
  regulasi: RegulasiItem[];
}

const KATEGORI_LIST = ['Semua', 'Keuangan', 'Ketertiban', 'Kelembagaan', 'Hukum'];

export default function RegulasiTabs({ regulasi }: Props) {
  const [tab, setTab] = useState<'peraturan' | 'surat'>('peraturan');
  const [search, setSearch] = useState('');
  const [kategori, setKategori] = useState('Semua');

  const filtered = regulasi.filter((r) => {
    if (r.jenis !== tab) return false;
    const q = search.toLowerCase();
    const cocokCari = !q || r.judul.toLowerCase().includes(q) || (r.nomor || '').toLowerCase().includes(q) || teksPolos(r.deskripsi).toLowerCase().includes(q);
    const cocokKategori = tab === 'surat' || kategori === 'Semua' || r.kategori === kategori;
    return cocokCari && cocokKategori;
  });

  return (
    <>
      <div className="flex justify-center">
        <div className="bg-white p-1.5 rounded-2xl border border-gray-150 inline-flex gap-1 shadow-sm w-full sm:w-auto">
          <button
            onClick={() => setTab('peraturan')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${tab === 'peraturan' ? 'bg-teal-600 text-white shadow-md' : 'text-gray-600 hover:bg-slate-50'}`}
          >
            <Landmark className="w-4 h-4" /> Peraturan Desa
          </button>
          <button
            onClick={() => setTab('surat')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${tab === 'surat' ? 'bg-teal-600 text-white shadow-md' : 'text-gray-600 hover:bg-slate-50'}`}
          >
            <ScrollText className="w-4 h-4" /> Persyaratan Surat
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="relative w-full md:max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={tab === 'peraturan' ? "Cari nomor peraturan, judul, atau kata kunci..." : "Cari jenis surat atau kata kunci..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
          />
        </div>
        {tab === 'peraturan' && (
          <div className="flex flex-wrap gap-2 w-full md:w-auto justify-start md:justify-end">
            {KATEGORI_LIST.map((cat) => (
              <button
                key={cat}
                onClick={() => setKategori(cat)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${kategori === cat ? 'bg-teal-600 text-white shadow-sm' : 'bg-slate-50 border border-gray-200 text-gray-600 hover:bg-gray-100'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {filtered.length > 0 ? (
        <div className="space-y-4">
          {filtered.map((r) => (
            <div key={r.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:border-teal-500/20 transition-all group">
              <div className="flex items-start space-x-4 max-w-3xl">
                <div className="p-3 bg-red-50 text-red-500 rounded-xl mt-1 flex-shrink-0"><FileText className="w-6 h-6" /></div>
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    {r.nomor && <span className="text-xs font-bold text-red-600 uppercase tracking-wide">{r.nomor}</span>}
                    {r.tahun && <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded-md">Tahun {r.tahun}</span>}
                    {r.kategori && <span className="px-2 py-0.5 bg-teal-50 text-teal-700 text-[10px] font-bold rounded-md border border-teal-200/30">{r.kategori}</span>}
                  </div>
                  <h3 className="font-extrabold text-gray-900 text-sm sm:text-base group-hover:text-teal-600 transition-colors leading-tight">{r.judul}</h3>
                  <p className="text-xs text-gray-500 font-light line-clamp-2 leading-relaxed">{teksPolos(r.deskripsi) || 'Belum ada rincian.'}</p>
                </div>
              </div>
              <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-4 sm:pt-0 border-gray-50 flex-shrink-0 gap-3">
                <span className="text-[10px] text-gray-400 font-semibold flex items-center space-x-1"><Calendar className="w-3.5 h-3.5 text-gray-400" /><span>{formatDate(r.created_at)}</span></span>
                <div className="flex gap-2">
                  <Link href={`/regulasi/${r.id}`} className="border border-teal-600 text-teal-700 hover:bg-teal-50/50 text-xs font-bold px-4 py-2 rounded-xl transition-all flex items-center space-x-1">
                    <Eye className="w-3.5 h-3.5" /><span>Rincian</span>
                  </Link>
                  {r.file_url && (
                    <a href={r.file_url} target="_blank" rel="noopener noreferrer" className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm transition-all flex items-center space-x-1">
                      <Download className="w-3.5 h-3.5" /><span>PDF</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
          <ShieldAlert className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-base font-semibold text-gray-700">{tab === 'peraturan' ? 'Regulasi' : 'Persyaratan surat'} tidak ditemukan</p>
          <p className="text-xs text-gray-500 mt-1">Coba gunakan kata kunci lain{tab === 'peraturan' ? ', atau pilih semua kategori hukum.' : '.'}</p>
        </div>
      )}
    </>
  );
}
