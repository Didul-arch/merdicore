"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Users, Shield, Users2 } from 'lucide-react';
import type { LembagaItem } from '@/lib/types';
import { keHtml } from '@/lib/utils';

interface Props {
  lembagaList: LembagaItem[];
}

export default function LembagaTabs({ lembagaList }: Props) {
  const [activeId, setActiveId] = useState(lembagaList[0].id);
  const activeData = lembagaList.find((l) => l.id === activeId) || lembagaList[0];

  return (
    <>
      {/* Tab Selection */}
      <div className="bg-white p-3 rounded-2xl border border-gray-150 flex flex-col sm:flex-row gap-2 max-w-xl mx-auto shadow-sm">
        {lembagaList.map((l) => (
          <button
            key={l.id}
            onClick={() => setActiveId(l.id)}
            className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeId === l.id
                ? 'bg-teal-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-slate-50'
            }`}
          >
            {l.singkatan || l.nama_lengkap}
          </button>
        ))}
      </div>

      {/* Lembaga Information Card */}
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-gray-100 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-12 items-center animate-in fade-in duration-300">
        <div className="lg:col-span-5 relative">
          <div className="absolute -top-4 -left-4 w-20 h-20 bg-teal-100/60 rounded-full blur-xl -z-10" />
          <div className="absolute -bottom-4 -right-4 w-40 h-40 bg-slate-900 rounded-3xl -z-10" />
          <div className="relative w-full h-80 rounded-2xl overflow-hidden border border-gray-150 bg-slate-100 flex items-center justify-center">
            {activeData.gambar ? (
              <Image
                src={activeData.gambar}
                alt={activeData.nama_lengkap}
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <Users2 className="w-16 h-16 text-teal-200" />
            )}
          </div>
        </div>

        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-teal-600">Lembaga Resmi Kemasyarakatan</span>
            <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900">{activeData.nama_lengkap}</h3>
          </div>
          <div className="h-0.5 w-16 bg-teal-600 rounded" />
          {/* WAJIB <div>, bukan <p>: isi dari editor berisi <p> sendiri, dan
              <p> di dalam <p> itu HTML tidak sah — browser akan menutup paksa
              tag-nya saat hydration dan React melempar error ketidakcocokan. */}
          <div
            className="prose prose-sm prose-teal max-w-none text-gray-600"
            dangerouslySetInnerHTML={{
              __html: keHtml(activeData.deskripsi) || '<p>Belum ada deskripsi untuk lembaga ini.</p>',
            }}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-gray-150/50">
            <div className="space-y-1">
              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">Pimpinan Lembaga:</span>
              <span className="text-xs sm:text-sm font-bold text-gray-800 flex items-center space-x-1.5">
                <Shield className="w-4 h-4 text-teal-600 flex-shrink-0" /><span>{activeData.nama_ketua || '-'}</span>
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">Jumlah Pengurus Aktif:</span>
              <span className="text-xs sm:text-sm font-bold text-gray-800 flex items-center space-x-1.5">
                <Users className="w-4 h-4 text-teal-600 flex-shrink-0" /><span>{activeData.jumlah_anggota} Orang Anggota</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
