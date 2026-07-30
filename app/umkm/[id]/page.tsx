import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Phone, Building, User, ShoppingBag, ArrowLeft } from 'lucide-react';
import { getUmkmById } from '@/lib/fetchers';
import { ringkas } from '@/lib/site';
import WhatsAppButton from '@/components/umkm/WhatsAppButton';
import ZoomableImage from '@/components/ZoomableImage';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const umkm = await getUmkmById(parseInt(id));
  if (!umkm) return { title: 'UMKM tidak ditemukan' };

  const deskripsi = ringkas(
    umkm.deskripsi?.trim() ||
      `${umkm.nama_usaha}${umkm.alamat ? `, ${umkm.alamat}` : ''} — UMKM warga Desa Pulung Merdiko.`,
  );

  return {
    title: umkm.nama_usaha,
    description: deskripsi,
    openGraph: {
      type: 'website',
      title: umkm.nama_usaha,
      description: deskripsi,
      images: umkm.gambar ? [umkm.gambar] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: umkm.nama_usaha,
      description: deskripsi,
      images: umkm.gambar ? [umkm.gambar] : undefined,
    },
  };
}

export default async function UmkmDetailPage({ params }: Props) {
  const { id } = await params;
  const umkmId = parseInt(id);

  if (isNaN(umkmId)) notFound();

  const product = await getUmkmById(umkmId);
  if (!product) notFound();

  // Gambar utama + galeri digabung jadi satu daftar, biar di dalam lightbox
  // bisa digeser kiri-kanan antar semua foto usaha ini.
  const semuaFoto = [product.gambar, ...(product.galeri_foto ?? [])].filter(
    (f): f is string => Boolean(f)
  );

  return (
    <div className="py-24 bg-slate-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/umkm"
          className="flex items-center space-x-2 text-sm text-gray-500 hover:text-teal-600 transition mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Galeri UMKM</span>
        </Link>

        <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 p-6 md:p-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Gambar Utama */}
            <div className="relative h-72 md:h-96 rounded-3xl overflow-hidden bg-gray-50 border border-gray-100 flex items-center justify-center">
              {product.gambar ? (
                <ZoomableImage
                  fotos={semuaFoto}
                  mulai={0}
                  alt={product.nama_usaha}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                  className="object-cover hover:scale-[1.02] transition-transform duration-500"
                />
              ) : (
                <ShoppingBag className="w-24 h-24 text-teal-200" />
              )}
            </div>

            <div className="space-y-6 flex flex-col justify-center">
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-950 mb-2 leading-tight">
                  {product.nama_usaha}
                </h1>
                <div className="h-1 w-16 bg-teal-600 rounded" />
              </div>

              <div className="space-y-3 bg-slate-50 p-6 rounded-2xl border border-gray-100">
                {product.pemilik_nama && (
                  <div className="flex items-center space-x-3 text-sm text-gray-700">
                    <User className="w-5 h-5 text-teal-600" />
                    <span><strong>Pemilik:</strong> {product.pemilik_nama}</span>
                  </div>
                )}
                {product.alamat && (
                  <div className="flex items-center space-x-3 text-sm text-gray-700">
                    <Building className="w-5 h-5 text-teal-600" />
                    <span><strong>Alamat:</strong> {product.alamat}</span>
                  </div>
                )}
                {product.no_whatsapp && (
                  <div className="flex items-center space-x-3 text-sm text-gray-700">
                    <Phone className="w-5 h-5 text-teal-600" />
                    <span><strong>WhatsApp:</strong> {product.no_whatsapp}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Deskripsi Usaha</h3>
                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                  {product.deskripsi || 'Belum ada deskripsi untuk usaha ini.'}
                </p>
              </div>

              {/* WhatsApp Button — Client Component */}
              {product.no_whatsapp && (
                <WhatsAppButton phone={product.no_whatsapp} businessName={product.nama_usaha} />
              )}
            </div>
          </div>
        </div>

        {/* Galeri Foto */}
        {product.galeri_foto && product.galeri_foto.length > 0 && (
          <div className="mt-12 space-y-6">
            <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight">Galeri Produk</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {product.galeri_foto.map((foto, index) => (
                <div key={index} className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 group">
                  <ZoomableImage
                    fotos={semuaFoto}
                    mulai={product.gambar ? index + 1 : index}
                    alt={`${product.nama_usaha} - Galeri ${index + 1}`}
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
