"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import {
    FileText,
    Plus,
    Pencil,
    Trash2,
    X,
    Search,
    Loader2,
    AlertTriangle,
    ChevronLeft,
    ChevronRight,
    Eye,
    EyeOff,
} from "lucide-react";
import Toast from "@/components/dashboard/Toast";
import fetcher from "@/lib/swr-fetcher";
import { uploadImage } from "@/lib/upload-image";

interface Berita {
    id: number;
    judul: string;
    slug: string;
    konten?: string;
    gambar: string | null;
    status: string;
    penulis_nama: string | null;
    created_at: string;
    updated_at: string;
}

type FormMode = "create" | "edit";

function statusBadge(status: string) {
    return status === "published"
        ? "bg-emerald-50 text-emerald-700 border-emerald-200/50"
        : "bg-amber-50 text-amber-700 border-amber-200/50";
}

function toSlug(text: string) {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
}

export default function BeritaManagementPage() {
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    const [page, setPage] = useState(1);
    const LIMIT = 10;

    const [modalOpen, setModalOpen] = useState(false);
    const [formMode, setFormMode] = useState<FormMode>("create");
    const [editingItem, setEditingItem] = useState<Berita | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const [fJudul, setFJudul] = useState("");
    const [fFile, setFFile] = useState<File | null>(null);
    const [fSlug, setFSlug] = useState("");
    const [fKonten, setFKonten] = useState("");
    const [fGambar, setFGambar] = useState("");
    const [fStatus, setFStatus] = useState("draft");

    const [deleteTarget, setDeleteTarget] = useState<Berita | null>(null);
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
    if (statusFilter) params.set("status", statusFilter);

    const { data, isLoading, mutate } = useSWR(`/api/berita?${params}`, fetcher);
    const items: Berita[] = data?.data ?? [];
    const total = data?.pagination?.total ?? 0;
    const totalPages = data?.pagination?.totalPages ?? 1;

    function openCreate() {
        setFormMode("create");
        setEditingItem(null);
        setFJudul("");
        setFSlug("");
        setFKonten("");
        setFGambar("");
        setFFile(null);
        setFStatus("draft");
        setModalOpen(true);
    }

    function openEdit(item: Berita) {
        setFormMode("edit");
        setEditingItem(item);
        setFJudul(item.judul);
        setFSlug(item.slug);
        setFKonten(item.konten || "");
        setFGambar(item.gambar || "");
        setFFile(null);
        setFStatus(item.status);
        setModalOpen(true);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);
        try {
            let imageUrl = fGambar;
            if (fFile) {
                imageUrl = await uploadImage(fFile, 'berita');
            }

            const slug = fSlug || toSlug(fJudul);
            if (formMode === "create") {
                const res = await fetch("/api/berita", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ judul: fJudul, slug, konten: fKonten, gambar: imageUrl || null, status: fStatus }),
                });
                const json = await res.json();
                if (!res.ok) throw new Error(json.message || "Gagal menambahkan berita");
                setToast({ message: "Berita berhasil ditambahkan!", type: "success" });
            } else if (editingItem) {
                const res = await fetch(`/api/berita/${editingItem.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ judul: fJudul, slug, konten: fKonten, gambar: imageUrl || null, status: fStatus }),
                });
                const json = await res.json();
                if (!res.ok) throw new Error(json.message || "Gagal mengubah berita");
                setToast({ message: "Berita berhasil diperbarui!", type: "success" });
            }
            setModalOpen(false);
            mutate();
        } catch (err) {
            setToast({ message: err instanceof Error ? err.message : "Terjadi kesalahan", type: "error" });
        } finally {
            setSubmitting(false);
        }
    }

    async function handleDelete() {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            const res = await fetch(`/api/berita/${deleteTarget.id}`, { method: "DELETE" });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Gagal menghapus berita");
            setToast({ message: "Berita berhasil dihapus.", type: "success" });
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
                            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                                <FileText className="w-5 h-5" />
                            </div>
                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[10px] font-bold uppercase tracking-wider border border-emerald-200/50">
                                Kelola Berita
                            </span>
                        </div>
                        <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Berita Desa</h2>
                        <p className="text-sm text-gray-500 mt-0.5">Buat, edit, dan kelola semua berita desa.</p>
                    </div>
                    <button
                        onClick={openCreate}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm cursor-pointer"
                    >
                        <Plus className="w-4 h-4" />
                        Tambah Berita
                    </button>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari judul atau konten..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                        className="px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition cursor-pointer"
                    >
                        <option value="">Semua Status</option>
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                    </select>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-20 gap-2 text-gray-400 text-sm">
                            <Loader2 className="w-5 h-5 animate-spin" /> Memuat data...
                        </div>
                    ) : items.length === 0 ? (
                        <div className="text-center py-20 text-sm text-gray-400">
                            {search ? "Tidak ada berita yang cocok." : "Belum ada berita."}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-[11px] uppercase font-bold text-gray-400 tracking-wider border-b border-gray-100 bg-gray-50/60">
                                        <th className="py-3 px-4">ID</th>
                                        <th className="py-3 px-4">Judul</th>
                                        <th className="py-3 px-4">Penulis</th>
                                        <th className="py-3 px-4">Status</th>
                                        <th className="py-3 px-4">Tanggal</th>
                                        <th className="py-3 px-4 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-sm">
                                    {items.map((b) => (
                                        <tr key={b.id} className="hover:bg-gray-50/70 transition-colors">
                                            <td className="py-3 px-4 font-mono text-xs text-gray-400">{b.id}</td>
                                            <td className="py-3 px-4">
                                                <div>
                                                    <p className="font-semibold text-gray-900 line-clamp-1">{b.judul}</p>
                                                    <p className="text-[11px] text-gray-400 font-mono">/{b.slug}</p>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-gray-600">{b.penulis_nama || "—"}</td>
                                            <td className="py-3 px-4">
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${statusBadge(b.status)}`}>
                                                    {b.status === "published" ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                                                    {b.status}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-xs text-gray-400">
                                                {new Date(b.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button onClick={() => openEdit(b)} className="p-2 rounded-lg text-gray-400 hover:text-sky-600 hover:bg-sky-50 transition-colors cursor-pointer" title="Edit">
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => setDeleteTarget(b)} className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer" title="Hapus">
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
                                Menampilkan {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} dari {total} berita
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

            {modalOpen && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => !submitting && setModalOpen(false)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6 space-y-5 border border-gray-200 max-h-[90vh] overflow-y-auto">
                        <button onClick={() => !submitting && setModalOpen(false)} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-gray-100 transition cursor-pointer">
                            <X className="w-4 h-4 text-gray-500" />
                        </button>

                        <div>
                            <h3 className="text-lg font-bold text-gray-900">{formMode === "create" ? "Tambah Berita" : "Edit Berita"}</h3>
                            <p className="text-xs text-gray-500 mt-0.5">
                                {formMode === "create" ? "Isi data untuk membuat berita baru." : `Mengubah: ${editingItem?.judul}`}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Judul</label>
                                <input
                                    type="text"
                                    required
                                    value={fJudul}
                                    onChange={(e) => {
                                        setFJudul(e.target.value);
                                        if (formMode === "create") setFSlug(toSlug(e.target.value));
                                    }}
                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition"
                                    placeholder="Judul berita"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Slug (URL)</label>
                                <input
                                    type="text"
                                    required
                                    value={fSlug}
                                    onChange={(e) => setFSlug(e.target.value)}
                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition"
                                    placeholder="judul-berita-url"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Konten</label>
                                <textarea
                                    required
                                    value={fKonten}
                                    onChange={(e) => setFKonten(e.target.value)}
                                    rows={6}
                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition resize-y"
                                    placeholder="Isi konten berita..."
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Gambar (Upload file)</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setFFile(e.target.files?.[0] || null)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 cursor-pointer"
                                />
                                {fGambar && !fFile && (
                                    <div className="mt-3 relative w-full h-40 rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                                        <img src={fGambar} alt="Preview" className="w-full h-full object-cover" />
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Status</label>
                                <select
                                    value={fStatus}
                                    onChange={(e) => setFStatus(e.target.value)}
                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition cursor-pointer"
                                >
                                    <option value="draft">Draft</option>
                                    <option value="published">Published</option>
                                </select>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button type="button" onClick={() => setModalOpen(false)} disabled={submitting} className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition cursor-pointer">
                                    Batal
                                </button>
                                <button type="submit" disabled={submitting} className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition shadow-sm disabled:opacity-60 cursor-pointer">
                                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {formMode === "create" ? "Simpan" : "Perbarui"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {deleteTarget && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => !deleting && setDeleteTarget(null)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 space-y-4 border border-gray-200">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-red-50 rounded-xl"><AlertTriangle className="w-5 h-5 text-red-600" /></div>
                            <div>
                                <h3 className="text-base font-bold text-gray-900">Hapus Berita</h3>
                                <p className="text-xs text-gray-500">Tindakan ini tidak bisa dibatalkan.</p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-700">
                            Apakah Anda yakin ingin menghapus berita <strong>&quot;{deleteTarget.judul}&quot;</strong>?
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
