import { useState } from 'react';
import { Calendar, Eye, BookOpen, Search, X, User } from 'lucide-react';
import { NEWS_DATA } from '../data';
import { NewsItem } from '../types';
import { getCategoryColor } from '../utils';

const CATEGORIES = ['Semua', 'Budaya', 'Pemerintahan', 'Sejarah', 'Infrastruktur', 'Pengumuman'];

export default function Berita() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);

  const filteredNews = NEWS_DATA.filter((item) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = item.title.toLowerCase().includes(q) ||
                          item.summary.toLowerCase().includes(q) ||
                          item.author.toLowerCase().includes(q);
    const matchesCategory = selectedCategory === 'Semua' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="py-24 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

        {/* Title */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-teal-600 bg-teal-50 px-3 py-1 rounded-full border border-teal-200/50">KABAR KABUPATEN & DESA</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-950 tracking-tight">
            Pusat Berita & Informasi Desa
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 font-light leading-relaxed">
            Dapatkan informasi terkini seputar kegiatan pemerintahan, pembangunan infrastruktur, pelestarian budaya, sejarah, dan pengumuman resmi Desa Pulung Merdiko.
          </p>
          <div className="h-1 w-16 bg-teal-600 rounded mx-auto" />
        </div>

        {/* Filters */}
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

          <div className="flex flex-wrap gap-2 w-full md:w-auto justify-start md:justify-end">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'bg-slate-50 border border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* News Grid */}
        {filteredNews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredNews.map((item) => (
              <article
                key={item.id}
                onClick={() => setSelectedNews(item)}
                className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-teal-500/30 hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col h-full"
              >
                <div className="relative h-56 overflow-hidden bg-gray-100">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <span className={`absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-md z-10 ${getCategoryColor(item.category)}`}>
                    {item.category}
                  </span>
                </div>

                <div className="p-6 flex flex-col flex-grow space-y-4">
                  <div className="flex items-center space-x-2 text-gray-400 text-xs font-medium">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{item.date}</span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                    <span>Oleh: {item.author}</span>
                  </div>

                  <h4 className="text-sm sm:text-base font-bold text-gray-900 group-hover:text-teal-600 transition-colors line-clamp-2 leading-snug">
                    {item.title}
                  </h4>

                  <p className="text-xs text-gray-500 font-light line-clamp-3 leading-relaxed flex-grow">
                    {item.summary}
                  </p>

                  <div className="pt-3 border-t border-gray-100 flex justify-between items-center text-teal-600 group-hover:text-teal-700 text-xs font-semibold">
                    <span className="flex items-center space-x-1">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Baca Selengkapnya</span>
                    </span>
                    <span className="flex items-center space-x-1 text-gray-400 font-normal">
                      <Eye className="w-3.5 h-3.5" />
                      <span>{item.views} kali dilihat</span>
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 shadow-sm">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-base font-semibold text-gray-700">Berita tidak ditemukan</p>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto leading-relaxed">
              Kami tidak dapat menemukan berita yang cocok dengan kata kunci pencarian atau filter kategori yang dipilih saat ini.
            </p>
          </div>
        )}
      </div>

      {/* News Detail Modal */}
      {selectedNews && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-gray-950/60 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedNews(null)}
          />

          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[85vh] overflow-y-auto shadow-2xl relative z-10 border border-gray-100 animate-zoom-in">
            {/* Cover Image */}
            <div className="relative h-64 sm:h-80 bg-gray-100">
              <img
                src={selectedNews.image}
                alt={selectedNews.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />
              <button
                onClick={() => setSelectedNews(null)}
                className="absolute top-4 right-4 bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all focus:outline-none cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
                <span className="px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider bg-white/95 backdrop-blur-sm text-gray-800">
                  {selectedNews.category}
                </span>
                <h3 className="text-lg sm:text-2xl font-bold leading-tight">
                  {selectedNews.title}
                </h3>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 sm:p-8 space-y-6">
              <div className="flex flex-wrap items-center justify-between text-xs text-gray-400 font-medium pb-4 border-b border-gray-100">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>Tanggal Terbit: {selectedNews.date}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span>Penulis: {selectedNews.author}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Eye className="w-4 h-4 text-gray-400" />
                  <span>Dibaca: {selectedNews.views} kali</span>
                </div>
              </div>

              <div className="text-xs sm:text-sm text-gray-600 leading-relaxed font-light space-y-4 whitespace-pre-line">
                {selectedNews.content}
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end">
                <button
                  onClick={() => setSelectedNews(null)}
                  className="bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-sm"
                >
                  Tutup Bacaan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
