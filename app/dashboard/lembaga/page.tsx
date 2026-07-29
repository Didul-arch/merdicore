"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import {
    Users,
    Plus,
    Pencil,
    Trash2,
    Search,
    Loader2,
    AlertTriangle,
    ChevronLeft,
    ChevronRight,
    Users2,
} from "lucide-react";
import Toast from "@/components/dashboard/Toast";
import fetcher from "@/lib/swr-fetcher";

interface Lembaga {
    id: number;
    nama_lengkap: string;
    singkatan: string | null;
    nama_ketua: string | null;
    jumlah_anggota: number;
    deskripsi: string | null;
    gambar: string | null;
}

export default function LembagaDesaPage() {
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [page, setPage] = useState(1);
    const LIMIT = 10;

    const [deleteTarget, setDeleteTarget] = useState<Lembaga | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 400);
        return () => clearTimeout(timer);
    }, [search]);

    const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
    if (debouncedSearch) params.set("search", debouncedSearch);

    const { data, isLoading, mutate } = useSWR(`/api/lembaga?${params}`, fetcher);
    const items: Lembaga[] = data?.data ?? [];
    const total = data?.pagination?.total ?? 0;
    const totalPages = data?.pagination?.totalPages ?? 1;

    async function handleDelete() {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            const res = await fetch(`/api/lembaga/${deleteTarget.id}`, { method: "DELETE" });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Gagal menghapus data");
            setToast({ message: "Data berhasil dihapus.", type: "success" });
            setDeleteTarget(null);
            mutate();
        } catch (err) {
            setToast({ message: err instanceof Error ? err.message : "Terjadi kesalahan", type: "error" });
        } finally {
            setDeleting(false);
        }
    }

    return (
        <>
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <main className="p-6 md:p-10 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                <Users2 className="w-5 h-5" />
                            </div>
                            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-bold uppercase tracking-wider border border-blue-200/50">
                                Organisasi Desa
                            </span>
                        </div>
                        <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Lembaga Desa</h2>
                        <p className="text-sm text-gray-500 mt-0.5">Kelola data lembaga, paguyuban, dan organisasi tingkat desa.</p>
                    </div>
                    <Link
                        href="/dashboard/lembaga/baru"
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Tambah Lembaga
                    </Link>
                </div>

                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Cari nama lembaga, singkatan, ketua..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition"
                    />
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-20 gap-2 text-gray-400 text-sm">
                            <Loader2 className="w-5 h-5 animate-spin" /> Memuat data...
                        </div>
                    ) : items.length === 0 ? (
                        <div className="text-center py-20 text-sm text-gray-400">
                            {search ? "Tidak ada lembaga yang cocok." : "Belum ada data lembaga."}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-[11px] uppercase font-bold text-gray-400 tracking-wider border-b border-gray-100 bg-gray-50/60">
                                        <th className="py-3 px-4">Nama Lembaga</th>
                                        <th className="py-3 px-4">Nama Ketua</th>
                                        <th className="py-3 px-4 text-center">Jml Anggota</th>
                                        <th className="py-3 px-4 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-sm">
                                    {items.map((l) => (
                                        <tr key={l.id} className="hover:bg-gray-50/70 transition-colors">
                                            <td className="py-3 px-4">
                                                <Link href={`/dashboard/lembaga/${l.id}`} className="group flex items-center gap-3">
                                                    {l.gambar ? (
                                                        // eslint-disable-next-line @next/next/no-img-element
                                                        <img src={l.gambar} alt="" className="w-10 h-10 rounded-lg object-cover border border-gray-200 shrink-0" />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold border border-blue-100 shrink-0">
                                                            {l.singkatan ? l.singkatan.substring(0, 3) : l.nama_lengkap.substring(0, 3).toUpperCase()}
                                                        </div>
                                                    )}
                                                    <div className="min-w-0">
                                                        <p className="font-semibold text-gray-900 line-clamp-1 group-hover:text-teal-600 transition-colors">{l.nama_lengkap}</p>
                                                        {l.singkatan && <p className="text-[11px] text-blue-600 font-bold uppercase mt-0.5">{l.singkatan}</p>}
                                                    </div>
                                                </Link>
                                            </td>
                                            <td className="py-3 px-4 text-gray-600">
                                                {l.nama_ketua ? (
                                                    <div className="flex items-center gap-1.5">
                                                        <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500">
                                                            {l.nama_ketua[0].toUpperCase()}
                                                        </div>
                                                        {l.nama_ketua}
                                                    </div>
                                                ) : "—"}
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center justify-center">
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-50 text-gray-600 border border-gray-200 rounded-lg text-xs font-medium">
                                                        <Users className="w-3.5 h-3.5 text-gray-400" />
                                                        {l.jumlah_anggota}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Link href={`/dashboard/lembaga/${l.id}`} className="p-2 rounded-lg text-gray-400 hover:text-sky-600 hover:bg-sky-50 transition-colors" title="Edit">
                                                        <Pencil className="w-4 h-4" />
                                                    </Link>
                                                    <button onClick={() => setDeleteTarget(l)} className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer" title="Hapus">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {!isLoading && items.length > 0 && (
                        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/40 flex items-center justify-between">
                            <span className="text-xs text-gray-400">
                                Menampilkan {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} dari {total} lembaga
                            </span>
                            <div className="flex items-center gap-1">
                                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer">
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <span className="text-xs text-gray-600 font-medium px-2">{page} / {totalPages}</span>
                                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer">
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {deleteTarget && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => !deleting && setDeleteTarget(null)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 space-y-4 border border-gray-200">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-red-50 rounded-xl"><AlertTriangle className="w-5 h-5 text-red-600" /></div>
                            <div>
                                <h3 className="text-base font-bold text-gray-900">Hapus Lembaga</h3>
                                <p className="text-xs text-gray-500">Tindakan ini tidak bisa dibatalkan.</p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-700">
                            Apakah Anda yakin ingin menghapus <strong>{deleteTarget.nama_lengkap}</strong>?
                        </p>
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setDeleteTarget(null)} disabled={deleting} className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition cursor-pointer">
                                Batal
                            </button>
                            <button onClick={handleDelete} disabled={deleting} className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition shadow-sm disabled:opacity-60 cursor-pointer">
                                {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                                Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
