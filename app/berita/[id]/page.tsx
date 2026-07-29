import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Calendar, Eye, ArrowLeft, User, BookOpen } from 'lucide-react';
import { getBeritaById, incrementBeritaViews } from '@/lib/fetchers';
import { formatDate } from '@/lib/utils';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function BeritaDetailPage({ params }: Props) {
  const { id } = await params;
  const beritaId = parseInt(id);

  if (isNaN(beritaId)) notFound();

  const berita = await getBeritaById(beritaId);
  if (!berita) notFound();

  // Increment views di server (fire-and-forget)
  incrementBeritaViews(beritaId).catch(() => {});

  return (
    <div className="py-24 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        <Link
          href="/berita"
          className="flex items-center space-x-2 text-sm text-gray-500 hover:text-teal-600 transition mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Daftar Berita</span>
        </Link>

        <article className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
          <div className="relative h-64 sm:h-96 md:h-[28rem] bg-gray-100">
            {berita.gambar ? (
              <Image src={berita.gambar} alt={berita.judul} fill sizes="(max-width: 768px) 100vw, 896px" priority className="object-cover" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-teal-50 to-sky-100">
                <BookOpen className="w-24 h-24 text-teal-300" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 md:bottom-10 md:left-10 text-white space-y-4">
              <span className="inline-block px-3 py-1 bg-teal-600/90 backdrop-blur-sm text-white text-xs font-semibold rounded-full uppercase tracking-wider">
                {berita.status === 'published' ? 'Berita Desa' : 'Draft'}
              </span>
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold leading-tight">
                {berita.judul}
              </h1>
            </div>
          </div>

          <div className="px-6 py-4 md:px-10 border-b border-gray-100 flex flex-wrap items-center justify-between text-xs sm:text-sm text-gray-500 gap-4 bg-gray-50/50">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-teal-600" />
              <span>{formatDate(berita.created_at)}</span>
            </div>
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-teal-600" />
              <span>Oleh: {berita.penulis_nama || 'Admin'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Eye className="w-4 h-4 text-teal-600" />
              <span>Dibaca {berita.views} kali</span>
            </div>
          </div>

          <div className="p-6 md:p-10">
            <div className="prose prose-teal max-w-none text-gray-700 leading-loose whitespace-pre-line text-sm sm:text-base">
              {berita.konten}
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
