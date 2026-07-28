"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Eye, ShoppingBag, Search, Phone, Building } from 'lucide-react';
import type { UmkmItem } from '@/lib/types';
import { generateWhatsAppUrl } from '@/lib/utils';

interface Props {
  initialData: UmkmItem[];
}

export default function UmkmSearchableList({ initialData }: Props) {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = initialData.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      p.nama_usaha.toLowerCase().includes(q) ||
      (p.pemilik_nama || '').toLowerCase().includes(q) ||
      (p.deskripsi || '').toLowerCase().includes(q) ||
      (p.alamat || '').toLowerCase().includes(q)
    );
  });

  const handleWhatsApp = (e: React.MouseEvent, product: UmkmItem) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product.no_whatsapp) return;
    const message = `Halo, saya melihat usaha *${product.nama_usaha}* di Portal UMKM Desa Pulung Merdiko dan tertarik untuk mengetahui lebih lanjut.\n\nApakah bisa dibantu?`;
    window.open(generateWhatsAppUrl(product.no_whatsapp, message), '_blank');
  };

  return (
    <>
      {/* Search */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 flex flex-col lg:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="relative w-full lg:max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama usaha, pemilik, atau alamat..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
          />
        </div>
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((product) => (
            <Link href={`/umkm/${product.id}`} key={product.id} className="group">
              <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 hover:border-teal-500/20 hover:shadow-xl transition-all duration-300 flex flex-col h-full">
                <div className="relative h-60 overflow-hidden bg-gray-50 flex items-center justify-center p-2">
                  {product.gambar ? (
                    <img
                      src={product.gambar}
                      alt={product.nama_usaha}
                      className="w-full h-full object-cover rounded-2xl group-hover:scale-[1.03] transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full rounded-2xl flex items-center justify-center bg-gradient-to-br from-teal-50 to-emerald-50">
                      <ShoppingBag className="w-16 h-16 text-teal-200" />
                    </div>
                  )}
                </div>

                <div className="p-6 flex flex-col flex-grow space-y-4">
                  <div>
                    {product.pemilik_nama && (
                      <span className="text-[10px] font-bold text-gray-400 flex items-center space-x-1 uppercase">
                        <Building className="w-3 h-3 text-teal-600/50 mr-0.5" />
                        <span>{product.pemilik_nama}</span>
                      </span>
                    )}
                    <h4 className="text-sm sm:text-base font-extrabold text-gray-900 group-hover:text-teal-600 transition-colors mt-0.5 leading-tight">
                      {product.nama_usaha}
                    </h4>
                  </div>

                  {product.alamat && (
                    <p className="text-[11px] text-gray-400 font-medium">📍 {product.alamat}</p>
                  )}

                  <p className="text-xs text-gray-500 font-light line-clamp-3 leading-relaxed flex-grow">
                    {product.deskripsi || 'Belum ada deskripsi.'}
                  </p>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button className="border border-teal-600 text-teal-700 hover:bg-teal-50/50 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-1.5 pointer-events-none">
                      <Eye className="w-3.5 h-3.5" />
                      <span>Detail</span>
                    </button>
                    {product.no_whatsapp && (
                      <button
                        onClick={(e) => handleWhatsApp(e, product)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-1.5"
                      >
                        <Phone className="w-3.5 h-3.5 fill-emerald-100/20" />
                        <span>Hubungi WA</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
          <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-base font-semibold text-gray-700">
            {initialData.length === 0 ? 'Belum Ada UMKM Terdaftar' : 'Tidak Ada Hasil Pencarian'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {initialData.length === 0
              ? 'Silakan tambahkan data UMKM melalui dashboard admin.'
              : 'Coba sesuaikan kata kunci pencarian Anda.'}
          </p>
        </div>
      )}
    </>
  );
}
