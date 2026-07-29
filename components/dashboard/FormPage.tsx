"use client";

import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";

interface Props {
  judul: string;
  keterangan?: string;
  kembaliKe: string;
  onSubmit: (e: React.FormEvent) => void;
  submitting: boolean;
  labelSimpan: string;
  children: React.ReactNode;
}

// Kerangka halaman form (tambah/edit) buat semua modul dashboard.
export default function FormPage({
  judul,
  keterangan,
  kembaliKe,
  onSubmit,
  submitting,
  labelSimpan,
  children,
}: Props) {
  return (
    <main className="p-6 md:p-10 max-w-4xl">
      <Link
        href={kembaliKe}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-teal-600 transition mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke daftar
      </Link>

      <div className="mb-6">
        <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">{judul}</h2>
        {keterangan && <p className="text-sm text-gray-500 mt-0.5">{keterangan}</p>}
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8 space-y-5">
          {children}
        </div>

        {/* Tombol simpan nempel di bawah layar biar gampang dijangkau di form panjang */}
        <div className="sticky bottom-0 bg-gradient-to-t from-gray-50 via-gray-50 to-transparent pt-6 pb-2 flex justify-end gap-2">
          <Link
            href={kembaliKe}
            className="px-4 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-100 rounded-xl transition"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition shadow-sm disabled:opacity-60 cursor-pointer"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {labelSimpan}
          </button>
        </div>
      </form>
    </main>
  );
}
