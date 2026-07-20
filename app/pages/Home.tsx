import { Compass, ChevronRight, Eye, Calendar, BookOpen, Star, ArrowRight, ShieldCheck, PhoneCall, Award } from 'lucide-react';
import { NEWS_DATA, PRODUCTS_DATA } from '../data';
import { formatCurrency, getCategoryColor } from '../utils';

interface HomeProps {
  onNavigate: (page: string) => void;
}

export default function Home({ onNavigate }: HomeProps) {
  const latestNews = NEWS_DATA.slice(0, 3);
  const featuredProducts = PRODUCTS_DATA.slice(0, 3);

  return (
    <div className="space-y-0">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center pt-16 overflow-hidden">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1555561331-50d48100300c?auto=format&fit=crop&w=1920&q=80')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-950/90 via-gray-900/85 to-gray-800/40 z-10" />

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full text-white">
          <div className="max-w-3xl">
            <h2 className="animate-slide-up-d1 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
              Selamat Datang di <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-sky-400 to-emerald-400 font-extrabold">
                Desa Pulung Merdiko
              </span>
            </h2>

            <p className="animate-slide-up-d2 text-base sm:text-lg text-gray-200 mb-10 leading-relaxed max-w-2xl font-light">
              Pusat informasi, layanan publik mandiri, dan galeri promosi UMKM Desa Pulung Merdiko. Membangun transparansi melalui inovasi teknologi untuk kesejahteraan masyarakat Ponorogo.
            </p>

            <div className="animate-slide-up-d3 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-5">
              <button
                onClick={() => onNavigate('about')}
                className="bg-teal-600 hover:bg-teal-500 text-white font-semibold px-6 py-3.5 rounded-xl shadow-lg hover:shadow-teal-500/20 flex items-center justify-center space-x-2 transition-all cursor-pointer group"
              >
                <Compass className="w-5 h-5 group-hover:rotate-45 transition-transform duration-300" />
                <span>Mengenal Profil Desa</span>
                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>

              <button
                onClick={() => onNavigate('umkm')}
                className="bg-white/10 hover:bg-white/20 border border-white/25 text-white font-semibold px-6 py-3.5 rounded-xl flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                <span>Kunjungi Pasar UMKM</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 z-20">
          <svg className="fill-white w-full h-12 sm:h-16" viewBox="0 0 1440 100" preserveAspectRatio="none">
            <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,100L1360,100C1280,100,1120,100,960,100C800,100,640,100,480,100C320,100,160,100,80,100L0,100Z"></path>
          </svg>
        </div>
      </section>

      {/* About Preview */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 relative">
              <div className="absolute -top-6 -left-6 w-32 h-32 bg-teal-100/50 rounded-full -z-10" />
              <div className="absolute -bottom-4 -right-4 w-4/5 h-1/2 bg-slate-900 rounded-3xl -z-10" />
              <div className="relative rounded-2xl overflow-hidden shadow-xl border border-gray-100 bg-white">
                <img
                  src="https://images.unsplash.com/photo-1531538606174-0f90ff5dce83?auto=format&fit=crop&w=800&q=80"
                  alt="Warga Desa"
                  className="w-full h-[380px] object-cover hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

            <div className="lg:col-span-7 space-y-6 bg-white">
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-600">PROFIL SINGKAT</span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-950 tracking-tight">
                  Mengenal Lebih Dekat Desa Kami
                </h3>
                <div className="h-1 w-20 bg-teal-600 rounded" />
              </div>

              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-light">
                Terletak di Kecamatan Pulung, Kabupaten Ponorogo, Desa Pulung Merdiko merupakan perpaduan harmonis antara kearifan lokal yang terjaga dan semangat kemandirian ekonomi. Kami berkomitmen meningkatkan kualitas hidup warga melalui digitalisasi pelayanan, dukungan kerajinan bambu, pertanian organik, serta wisata sejarah Makam Eyang Djajengrana.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex-1">
                  <h5 className="font-bold text-gray-800 text-xs sm:text-sm mb-1">Visi Utama</h5>
                  <p className="text-xs text-gray-500 font-light">
                    Mewujudkan Desa Pulung Merdiko yang mandiri, sejahtera, rukun, dan berbudaya berbasis pelayanan prima.
                  </p>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex-1">
                  <h5 className="font-bold text-gray-800 text-xs sm:text-sm mb-1">Sejarah Singkat</h5>
                  <p className="text-xs text-gray-500 font-light">
                    Didirikan oleh para pejuang pengikut Pangeran Diponegoro yang dipimpin Eyang Djajengrana sebagai wilayah merdeka (Merdiko).
                  </p>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => onNavigate('about')}
                  className="inline-flex items-center space-x-2 text-teal-700 hover:text-teal-900 font-bold text-xs sm:text-sm transition-colors group cursor-pointer"
                >
                  <span>Pelajari Selengkapnya</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Latest News */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 space-y-4 sm:space-y-0">
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-600">KABAR TERKINI</span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-950 tracking-tight">
                Kabar & Kegiatan Terbaru
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 font-light">
                Kegiatan pembangunan dan peristiwa terhangat dari wilayah desa kami.
              </p>
            </div>
            <button
              onClick={() => onNavigate('news')}
              className="inline-flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-white px-5 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-sm"
            >
              <span>Lihat Semua Berita</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {latestNews.map((item) => (
              <article
                key={item.id}
                onClick={() => onNavigate('news')}
                className="bg-slate-50 rounded-2xl overflow-hidden border border-gray-100 hover:border-teal-500/30 hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col h-full"
              >
                <div className="relative h-52 overflow-hidden bg-gray-100">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <span className={`absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm z-10 ${getCategoryColor(item.category)}`}>
                    {item.category}
                  </span>
                </div>

                <div className="p-6 flex flex-col flex-grow space-y-3">
                  <div className="flex items-center space-x-2 text-gray-400 text-xs font-medium">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{item.date}</span>
                  </div>
                  <h4 className="text-sm sm:text-base font-bold text-gray-900 group-hover:text-teal-600 transition-colors line-clamp-2 leading-snug">
                    {item.title}
                  </h4>
                  <p className="text-xs text-gray-500 font-light line-clamp-2 leading-relaxed flex-grow">
                    {item.summary}
                  </p>
                  <div className="pt-3 border-t border-gray-100 flex justify-between items-center text-teal-600 group-hover:text-teal-700 text-xs font-semibold">
                    <span className="flex items-center space-x-1">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Baca Artikel</span>
                    </span>
                    <span className="flex items-center space-x-1 text-gray-400 font-normal">
                      <Eye className="w-3.5 h-3.5" />
                      <span>{item.views}</span>
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-slate-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 space-y-4 sm:space-y-0">
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-600">ETALASE DESA</span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-950 tracking-tight">
                Galeri Produk Lokal Terbaik
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 font-light">
                Dukung perekonomian warga lokal melalui produk-produk unggulan terbaik.
              </p>
            </div>
            <button
              onClick={() => onNavigate('umkm')}
              className="inline-flex items-center space-x-1.5 bg-teal-700 hover:bg-teal-600 text-white px-5 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-sm"
            >
              <span>Lihat Etalase UMKM</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.map((product) => (
              <div
                key={product.id}
                onClick={() => onNavigate('umkm')}
                className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-teal-500/20 hover:shadow-xl transition-all duration-300 flex flex-col h-full group cursor-pointer"
              >
                <div className="relative h-56 overflow-hidden bg-gray-50 flex items-center justify-center p-2">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm text-gray-900 px-3 py-1 rounded-lg text-xs font-extrabold tracking-wide shadow-sm z-10 border border-gray-100">
                    {formatCurrency(product.price)}
                  </span>
                </div>

                <div className="p-6 flex flex-col flex-grow space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold text-teal-600 uppercase tracking-wider">{product.category}</span>
                      <h4 className="text-sm sm:text-base font-bold text-gray-900 group-hover:text-teal-600 transition-colors mt-0.5">
                        {product.name}
                      </h4>
                    </div>
                    <div className="flex items-center space-x-1 bg-amber-50 text-amber-600 px-2 py-0.5 rounded-lg text-xs font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      <span>{product.rating.toFixed(1)}</span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 font-light line-clamp-2 flex-grow leading-relaxed">
                    {product.description}
                  </p>

                  <div className="w-full border border-teal-600 hover:bg-teal-50 text-teal-700 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2">
                    <Eye className="w-4 h-4" />
                    <span>Lihat Detail & Hubungi</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-12 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-900 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl" />

            <div className="space-y-4 relative z-10 text-center lg:text-left max-w-2xl">
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Kunjungi Kantor Kami</h3>
              <p className="text-xs sm:text-sm text-gray-300 font-light leading-relaxed">
                Butuh bantuan layanan administrasi kependudukan? Kantor Desa Pulung Merdiko siap melayani warga setiap Senin - Jumat jam 08.00 - 15.00 WIB.
              </p>
            </div>

            <div className="relative z-10 flex-shrink-0">
              <button
                onClick={() => onNavigate('contact')}
                className="bg-white hover:bg-gray-100 text-gray-900 font-bold px-6 py-4 rounded-xl text-xs sm:text-sm transition-all hover:scale-[1.02] shadow-md cursor-pointer flex items-center space-x-2"
              >
                <span>Lihat Peta & Kontak</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
