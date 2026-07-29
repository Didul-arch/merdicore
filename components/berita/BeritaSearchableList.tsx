"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Eye, BookOpen, Search } from 'lucide-react';
import type { BeritaItem } from '@/lib/types';
import { formatDate } from '@/lib/utils';

interface Props {
  initialData: BeritaItem[];
}

export default function BeritaSearchableList({ initialData }: Props) {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = initialData.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      item.judul.toLowerCase().includes(q) ||
      (item.konten || '').toLowerCase().includes(q) ||
      (item.penulis_nama || '').toLowerCase().includes(q)
    );
  });

  return (
    <>
      <div className="bg-white p-6 rounded-2xl border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="relative w-full md:max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari berita atau pengumuman..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
          />
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((item) => (
            <Link href={`/berita/${item.id}`} key={item.id} className="group">
              <article className="bg-white rounded-2xl overflow-hidden border border-gray-150 hover:border-teal-500/30 hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col h-full">
                <div className="relative h-56 overflow-hidden bg-gray-100">
                  {item.gambar ? (
                    <Image src={item.gambar} alt={item.judul} fill sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-teal-50 to-sky-50">
                      <BookOpen className="w-12 h-12 text-teal-300" />
                    </div>
                  )}
                </div>
                <div className="p-6 flex flex-col flex-grow space-y-4">
                  <div className="flex items-center space-x-2 text-gray-400 text-xs font-medium">
                    <Calendar className="w-3.5 h-3.5" /><span>{formatDate(item.created_at)}</span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                    <span>Oleh: {item.penulis_nama || 'Admin'}</span>
                  </div>
                  <h4 className="text-sm sm:text-base font-bold text-gray-900 group-hover:text-teal-600 transition-colors line-clamp-2 leading-snug">{item.judul}</h4>
                  <p className="text-xs text-gray-500 font-light line-clamp-3 leading-relaxed flex-grow">{(item.konten || '').substring(0, 150)}...</p>
                  <div className="pt-3 border-t border-gray-100 flex justify-between items-center text-teal-600 group-hover:text-teal-700 text-xs font-semibold">
                    <span className="flex items-center space-x-1"><BookOpen className="w-3.5 h-3.5" /><span>Baca Selengkapnya</span></span>
                    <span className="flex items-center space-x-1 text-gray-400 font-normal"><Eye className="w-3.5 h-3.5" /><span>{item.views} kali dilihat</span></span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 shadow-sm">
          <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-base font-semibold text-gray-700">Berita tidak ditemukan</p>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto leading-relaxed">
            {initialData.length === 0
              ? 'Belum ada berita yang dipublikasikan. Silakan tambahkan berita melalui dashboard admin.'
              : 'Kami tidak dapat menemukan berita yang cocok dengan kata kunci pencarian saat ini.'}
          </p>
        </div>
      )}
    </>
  );
}
