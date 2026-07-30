"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import {
    Landmark,
    Plus,
    Pencil,
    Trash2,
    Search,
    Loader2,
    AlertTriangle,
    ChevronLeft,
    ChevronRight,
    Phone,
    BadgeCheck,
    Users,
} from "lucide-react";
import Toast from "@/components/dashboard/Toast";
import fetcher from "@/lib/swr-fetcher";

interface Perangkat {
    id: number;
    nama: string;
    no_hp: string;
    jabatan: string;
    nip: string | null;
    masa_jabatan: string | null;
    foto: string | null;
    nama_user: string | null;
    email_user: string | null;
}

export default function PerangkatManagementPage() {
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [page, setPage] = useState(1);
    const LIMIT = 10;

    const [deleteTarget, setDeleteTarget] = useState<Perangkat | null>(null);
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

    const { data, isLoading, mutate } = useSWR(`/api/perangkat-desa?${params}`, fetcher);
    const items: Perangkat[] = data?.data ?? [];
    const total = data?.pagination?.total ?? 0;
    const totalPages = data?.pagination?.totalPages ?? 1;

    async function handleDelete() {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            const res = await fetch(`/api/perangkat-desa/${deleteTarget.id}`, { method: "DELETE" });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Gagal menghapus data");
            setToast({ message: "Perangkat desa berhasil dihapus.", type: "success" });
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
                            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                <Landmark className="w-5 h-5" />
                            </div>
                            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-[10px] font-bold uppercase tracking-wider border border-indigo-200/50">
                                Perangkat Desa
                            </span>
                        </div>
                        <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Daftar Perangkat Desa</h2>
                        <p className="text-sm text-gray-500 mt-0.5">
                            Data ini tampil di halaman publik Profil Desa. Akun login itu opsional -- tidak semua pejabat perlu bisa masuk ke dashboard.
                        </p>
                    </div>
                    <Link
                        href="/dashboard/perangkat/baru"
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Tambah Perangkat
                    </Link>
                </div>

                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Cari nama, jabatan, atau NIP..."
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
                            {search ? "Tidak ada yang cocok dengan pencarian." : "Belum ada data perangkat desa."}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-[11px] uppercase font-bold text-gray-400 tracking-wider border-b border-gray-100 bg-gray-50/60">
                                        <th className="py-3 px-4">Nama</th>
                                        <th className="py-3 px-4">Jabatan</th>
                                        <th className="py-3 px-4">Kontak</th>
                                        <th className="py-3 px-4">Akun Login</th>
                                        <th className="py-3 px-4 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-sm">
                                    {items.map((p) => (
                                        <tr key={p.id} className="hover:bg-gray-50/70 transition-colors">
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-3">
                                                    {p.foto ? (
                                                        // eslint-disable-next-line @next/next/no-img-element
                                                        <img src={p.foto} alt="" className="w-9 h-9 rounded-full object-cover border border-gray-200 shrink-0" />
                                                    ) : (
                                                        <div className="w-9 h-9 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
                                                            <Users className="w-4 h-4 text-indigo-300" />
                                                        </div>
                                                    )}
                                                    <div className="min-w-0">
                                                        <p className="font-semibold text-gray-900 truncate">{p.nama}</p>
                                                        {p.nip && <p className="text-[11px] text-gray-400 font-mono">{p.nip}</p>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-50 text-indigo-700 border border-indigo-200/50">
                                                    {p.jabatan}
                                                </span>
                                                {p.masa_jabatan && <p className="text-[10px] text-gray-400 mt-1">{p.masa_jabatan}</p>}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="inline-flex items-center gap-1 text-xs text-gray-600">
                                                    <Phone className="w-3 h-3 text-gray-400" />
                                                    {p.no_hp}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                {p.nama_user ? (
                                                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700" title={p.email_user ?? undefined}>
                                                        <BadgeCheck className="w-3.5 h-3.5" />
                                                        {p.nama_user}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-gray-300">Tidak dikaitkan</span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Link href={`/dashboard/perangkat/${p.id}`} className="p-2 rounded-lg text-gray-400 hover:text-sky-600 hover:bg-sky-50 transition-colors" title="Edit">
                                                        <Pencil className="w-4 h-4" />
                                                    </Link>
                                                    <button onClick={() => setDeleteTarget(p)} className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer" title="Hapus">
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
                                Menampilkan {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} dari {total} data
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
                                <h3 className="text-base font-bold text-gray-900">Hapus Perangkat Desa</h3>
                                <p className="text-xs text-gray-500">Tindakan ini tidak bisa dibatalkan.</p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-700">
                            Apakah Anda yakin ingin menghapus <strong>{deleteTarget.nama}</strong> dari daftar perangkat desa?
                            {deleteTarget.nama_user && " Akun login-nya TIDAK ikut terhapus."}
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
