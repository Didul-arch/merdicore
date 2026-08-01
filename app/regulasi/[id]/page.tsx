import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Calendar, Download, CheckCircle2 } from 'lucide-react';
import { getRegulasiById } from '@/lib/fetchers';
import { formatDate, keHtml, teksPolos } from '@/lib/utils';
import { ringkas } from '@/lib/site';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const r = await getRegulasiById(parseInt(id));
  if (!r) return { title: 'Data tidak ditemukan' };

  const deskripsi = ringkas(teksPolos(r.deskripsi));

  return {
    title: r.judul,
    description: deskripsi,
    openGraph: { title: r.judul, description: deskripsi },
  };
}

export default async function RegulasiDetailPage({ params }: Props) {
  const { id } = await params;
  const regulasiId = parseInt(id);

  if (isNaN(regulasiId)) notFound();

  const r = await getRegulasiById(regulasiId);
  if (!r) notFound();

  const isPeraturan = r.jenis === 'peraturan';

  return (
    <div className="py-24 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        <Link
          href="/regulasi"
          className="flex items-center space-x-2 text-sm text-gray-500 hover:text-teal-600 transition mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke {isPeraturan ? 'Produk Hukum' : 'Persyaratan Surat'}</span>
        </Link>

        <article className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
          <div className="p-6 md:p-10 border-b border-gray-100 bg-gradient-to-br from-teal-50/60 to-slate-50 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              {r.nomor && <span className="text-xs font-bold text-red-600 uppercase tracking-wide">{r.nomor}</span>}
              {r.tahun && <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded-md">Tahun {r.tahun}</span>}
              {r.kategori && <span className="px-2 py-0.5 bg-teal-50 text-teal-700 text-[10px] font-bold rounded-md border border-teal-200/30">{r.kategori}</span>}
              {r.status && (
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-md border border-emerald-200/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> {r.status}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-950 leading-tight">{r.judul}</h1>
            <span className="text-xs text-gray-400 font-semibold flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> Diunggah: {formatDate(r.created_at)}
            </span>
          </div>

          <div className="p-6 md:p-10 space-y-8">
            {/* keHtml() membungkus data lama yang masih teks polos jadi <p>,
                isinya sendiri sudah disaring di API (lihat lib/sanitize.ts). */}
            <div
              className="prose prose-sm sm:prose-base prose-teal max-w-none"
              dangerouslySetInnerHTML={{ __html: keHtml(r.deskripsi) || '<p>Belum ada rincian untuk item ini.</p>' }}
            />

            {r.file_url && (
              <a
                href={r.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white text-sm font-bold px-5 py-3 rounded-xl shadow-md transition-all"
              >
                <Download className="w-4 h-4" />
                {isPeraturan ? 'Unduh Draf PDF' : 'Unduh Template Surat'}
              </a>
            )}
          </div>
        </article>
      </div>
    </div>
  );
}
