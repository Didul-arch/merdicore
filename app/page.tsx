import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, Eye, Calendar, BookOpen, ShoppingBag, ArrowRight } from 'lucide-react';
import { getLatestBerita, getAllUmkm } from '@/lib/fetchers';
import { formatDate, teksPolos } from '@/lib/utils';
import HeroAnimated from '@/components/home/HeroAnimated';
import fotoMakam from '@/app/makam.jpg';

// Regenerate halaman maks tiap 60 detik (ISR) — biar update dari dashboard keliatan
export const revalidate = 60;

export default async function Page() {
  const [latestNews, featuredProducts] = await Promise.all([
    getLatestBerita(3),
    getAllUmkm(3),
  ]);

  return (
    <div className="space-y-0">
      {/* Hero — Client Component (animasi motion) */}
      <HeroAnimated />

      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 relative">
              <div className="absolute -top-6 -left-6 w-32 h-32 bg-teal-100/50 rounded-full -z-10" />
              <div className="absolute -bottom-4 -right-4 w-4/5 h-1/2 bg-slate-900 rounded-3xl -z-10" />
              <div className="relative h-[380px] rounded-2xl overflow-hidden shadow-xl border border-gray-100 bg-white">
                <Image
                  src={fotoMakam}
                  alt="Makam Eyang Raden Tumenggung Djajengrana, cagar budaya Desa Pulung Merdiko"
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>

            <div className="lg:col-span-7 space-y-6">
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
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-150/60 flex-1">
                  <h5 className="font-bold text-gray-800 text-xs sm:text-sm mb-1">Visi Utama</h5>
                  <p className="text-xs text-gray-500 font-light">
                    Mewujudkan Desa Pulung Merdiko yang mandiri, sejahtera, rukun, dan berbudaya berbasis pelayanan prima.
                  </p>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-150/60 flex-1">
                  <h5 className="font-bold text-gray-800 text-xs sm:text-sm mb-1">Sejarah Singkat</h5>
                  <p className="text-xs text-gray-500 font-light">
                    Didirikan oleh para pejuang pengikut Pangeran Diponegoro yang dipimpin Eyang Djajengrana sebagai wilayah merdeka (Merdiko).
                  </p>
                </div>
              </div>

              <div className="pt-4">
                <Link
                  href="/tentang"
                  className="inline-flex items-center space-x-2 text-teal-700 hover:text-teal-900 font-bold text-xs sm:text-sm transition-colors group"
                >
                  <span>Pelajari Selengkapnya</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 space-y-4 sm:space-y-0">
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-600">KABAR TERKINI</span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-950 tracking-tight">
                Kabar &amp; Kegiatan Terbaru
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 font-light">
                Kegiatan pembangunan dan peristiwa terhangat dari wilayah desa kami.
              </p>
            </div>
            <div>
              <Link
                href="/berita"
                className="inline-flex items-center space-x-1.5 bg-[#0f172a] hover:bg-[#1e293b] text-white px-5 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm"
              >
                <span>Lihat Semua Berita</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {latestNews.length > 0 ? (
            // Di HP: baris geser (scroll-snap native, tanpa JS/library) — kartu berikutnya
            // sengaja mengintip di tepi kanan sebagai penanda "bisa digeser".
            // Dari md ke atas baris cukup lebar buat grid biasa, carousel dimatikan.
            <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-2 no-scrollbar md:grid md:grid-cols-2 md:gap-8 lg:grid-cols-3">
              {latestNews.map((item) => (
                <Link href={`/berita/${item.id}`} key={item.id} className="group shrink-0 w-[78%] sm:w-72 snap-start md:w-auto md:shrink">
                  <article className="bg-slate-50 rounded-2xl overflow-hidden border border-gray-150 hover:border-teal-500/30 hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col h-full">
                    <div className="relative h-52 overflow-hidden bg-gray-100">
                      {item.gambar ? (
                        <Image src={item.gambar} alt={item.judul} fill sizes="(max-width: 768px) 78vw, (max-width: 1024px) 50vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-500" style={{ objectPosition: item.gambar_fokus || '50% 50%' }} referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-teal-50 to-sky-50">
                          <BookOpen className="w-12 h-12 text-teal-300" />
                        </div>
                      )}
                    </div>
                    <div className="p-6 flex flex-col flex-grow space-y-3">
                      <div className="flex items-center space-x-2 text-gray-400 text-xs font-medium">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{formatDate(item.created_at)}</span>
                      </div>
                      <h4 className="text-sm sm:text-base font-bold text-gray-900 group-hover:text-teal-600 transition-colors line-clamp-2 leading-snug">
                        {item.judul}
                      </h4>
                      <p className="text-xs text-gray-500 font-light line-clamp-2 leading-relaxed flex-grow">
                        {teksPolos(item.konten).substring(0, 120)}...
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
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-slate-50 rounded-3xl border border-dashed border-gray-200">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-base font-semibold text-gray-700">Belum Ada Berita</p>
              <p className="text-xs text-gray-500 mt-1">Berita akan muncul setelah ditambahkan melalui dashboard admin.</p>
            </div>
          )}
        </div>
      </section>

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
            <div>
              <Link
                href="/umkm"
                className="inline-flex items-center space-x-1.5 bg-[#0f766e] hover:bg-[#0d5f58] text-white px-5 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm"
              >
                <span>Lihat Etalase UMKM</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {featuredProducts.length > 0 ? (
            // Sama seperti baris berita: carousel geser cuma di HP, grid biasa dari md ke atas.
            <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-2 no-scrollbar md:grid md:grid-cols-2 md:gap-8 lg:grid-cols-3">
              {featuredProducts.map((product) => (
                <Link href={`/umkm/${product.id}`} key={product.id} className="group shrink-0 w-[78%] sm:w-72 snap-start md:w-auto md:shrink">
                  <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-teal-500/20 hover:shadow-xl transition-all duration-300 flex flex-col h-full">
                    <div className="relative h-56 overflow-hidden bg-gray-50 flex items-center justify-center p-2">
                      {product.gambar ? (
                        <Image src={product.gambar} alt={product.nama_usaha} fill sizes="(max-width: 768px) 78vw, (max-width: 1024px) 50vw, 33vw" className="object-cover rounded-xl group-hover:scale-105 transition-transform duration-500" style={{ objectPosition: product.gambar_fokus || '50% 50%' }} referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-full h-full rounded-xl flex items-center justify-center bg-gradient-to-br from-teal-50 to-emerald-50">
                          <ShoppingBag className="w-16 h-16 text-teal-200" />
                        </div>
                      )}
                    </div>
                    <div className="p-6 flex flex-col flex-grow space-y-4">
                      <div>
                        {product.pemilik_nama && (
                          <span className="text-[10px] font-bold text-teal-600 uppercase tracking-wider">{product.pemilik_nama}</span>
                        )}
                        <h4 className="text-sm sm:text-base font-bold text-gray-900 group-hover:text-teal-600 transition-colors mt-0.5">
                          {product.nama_usaha}
                        </h4>
                      </div>
                      <p className="text-xs text-gray-500 font-light line-clamp-2 flex-grow leading-relaxed">
                        {product.deskripsi || 'Belum ada deskripsi.'}
                      </p>
                      <div className="w-full border border-teal-600 hover:bg-teal-50 text-teal-700 hover:text-teal-800 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2">
                        <Eye className="w-4 h-4" />
                        <span>Lihat Detail &amp; Hubungi</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-200">
              <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-base font-semibold text-gray-700">Belum Ada UMKM Terdaftar</p>
              <p className="text-xs text-gray-500 mt-1">UMKM akan muncul setelah ditambahkan melalui dashboard admin.</p>
            </div>
          )}
        </div>
      </section>

      <section className="py-12 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-900 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl" />

            <div className="space-y-4 relative z-10 text-center lg:text-left max-w-2xl">
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Kunjungi Kantor Kami</h3>
              <p className="text-xs sm:text-sm text-gray-300 font-light leading-relaxed">
                Butuh bantuan layanan administrasi kependudukan? Kantor Desa Pulung Merdiko siap melayani warga setiap Senin - Jumat jam 08.00 - 15.00 WIB. Temukan detail arah lokasi kantor desa kami.
              </p>
            </div>

            <div className="relative z-10 flex-shrink-0">
              <Link
                href="/contact"
                className="bg-white hover:bg-gray-100 text-gray-900 font-bold px-6 py-4 rounded-xl text-xs sm:text-sm transition-all hover:scale-[1.02] shadow-md flex items-center space-x-2"
              >
                <span>Lihat Peta &amp; Kontak</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
