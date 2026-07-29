"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import {
    ShoppingBag,
    Plus,
    Pencil,
    Trash2,
    X,
    Search,
    Loader2,
    AlertTriangle,
    ChevronLeft,
    ChevronRight,
    MapPin,
    Phone,
} from "lucide-react";
import Toast from "@/components/dashboard/Toast";
import fetcher from "@/lib/swr-fetcher";
import { uploadImage } from "@/lib/upload-image";

/* ─────────── Types ─────────── */
interface Umkm {
    id: number;
    nama_usaha: string;
    deskripsi: string | null;
    no_whatsapp: string | null;
    alamat: string | null;
    gambar: string | null;
    galeri_foto: string[] | null;
    pemilik_nama: string | null;
    created_at: string;
}

type FormMode = "create" | "edit";

/* ═══════════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════════ */
export default function UmkmManagementPage() {
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    // Pagination
    const [page, setPage] = useState(1);
    const LIMIT = 10;

    // Modal
    const [modalOpen, setModalOpen] = useState(false);
    const [formMode, setFormMode] = useState<FormMode>("create");
    const [editingItem, setEditingItem] = useState<Umkm | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Form
    const [fNamaUsaha, setFNamaUsaha] = useState("");
    const [fFile, setFFile] = useState<File | null>(null);
    const [fDeskripsi, setFDeskripsi] = useState("");
    const [fNoWa, setFNoWa] = useState("");
    const [fAlamat, setFAlamat] = useState("");
    const [fGambar, setFGambar] = useState("");
    
    // Gallery
    const [fGaleriFiles, setFGaleriFiles] = useState<File[]>([]);
    const [fGaleriFoto, setFGaleriFoto] = useState<string[]>([]);

    // Delete
    const [deleteTarget, setDeleteTarget] = useState<Umkm | null>(null);
    const [deleting, setDeleting] = useState(false);

    // Toast
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

    /* ── Debounce ── */
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 400);
        return () => clearTimeout(timer);
    }, [search]);

    /* ── Fetch ── */
    const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
    if (debouncedSearch) params.set("search", debouncedSearch);

    const { data, isLoading, mutate } = useSWR(`/api/umkm?${params}`, fetcher);
    const items: Umkm[] = data?.data ?? [];
    const total = data?.pagination?.total ?? 0;
    const totalPages = data?.pagination?.totalPages ?? 1;

    /* ── Modal openers ── */
    function openCreate() {
        setFormMode("create");
        setEditingItem(null);
        setFNamaUsaha("");
        setFDeskripsi("");
        setFNoWa("");
        setFAlamat("");
        setFGambar("");
        setFFile(null);
        setFGaleriFoto([]);
        setFGaleriFiles([]);
        setModalOpen(true);
    }

    function openEdit(item: Umkm) {
        setFormMode("edit");
        setEditingItem(item);
        setFNamaUsaha(item.nama_usaha);
        setFDeskripsi(item.deskripsi || "");
        setFNoWa(item.no_whatsapp || "");
        setFAlamat(item.alamat || "");
        setFGambar(item.gambar || "");
        setFGaleriFoto(item.galeri_foto || []);
        setFGaleriFiles([]);
        setFFile(null);
        setModalOpen(true);
    }

    /* ── Submit ── */
    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);
        try {
            let imageUrl = fGambar;
            if (fFile) {
                imageUrl = await uploadImage(fFile, 'umkm');
            }

            // Upload foto galeri barengan
            let galleryUrls = [...fGaleriFoto];
            if (fGaleriFiles.length > 0) {
                const newGalleryUrls = await Promise.all(
                    fGaleriFiles.map((file) => uploadImage(file, 'umkm/galeri'))
                );
                galleryUrls = [...galleryUrls, ...newGalleryUrls];
            }

            const payload = {
                nama_usaha: fNamaUsaha,
                deskripsi: fDeskripsi || null,
                no_whatsapp: fNoWa || null,
                alamat: fAlamat || null,
                gambar: imageUrl || null,
                galeri_foto: galleryUrls,
            };

            if (formMode === "create") {
                const res = await fetch("/api/umkm", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
                const json = await res.json();
                if (!res.ok) throw new Error(json.message || "Gagal menambahkan UMKM");
                setToast({ message: "UMKM berhasil ditambahkan!", type: "success" });
            } else if (editingItem) {
                const res = await fetch(`/api/umkm/${editingItem.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
                const json = await res.json();
                if (!res.ok) throw new Error(json.message || "Gagal mengubah UMKM");
                setToast({ message: "UMKM berhasil diperbarui!", type: "success" });
            }
            setModalOpen(false);
            mutate();
        } catch (err) {
            setToast({ message: err instanceof Error ? err.message : "Terjadi kesalahan", type: "error" });
        } finally {
            setSubmitting(false);
        }
    }

    /* ── Delete ── */
    async function handleDelete() {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            const res = await fetch(`/api/umkm/${deleteTarget.id}`, { method: "DELETE" });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Gagal menghapus UMKM");
            setToast({ message: "UMKM berhasil dihapus.", type: "success" });
            setDeleteTarget(null);
            mutate();
        } catch (err) {
            setToast({ message: err instanceof Error ? err.message : "Terjadi kesalahan", type: "error" });
        } finally {
            setDeleting(false);
        }
    }

    /* ═══════════════════════════════════════
       Render
       ═══════════════════════════════════════ */
    return (
        <>
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <main className="p-6 md:p-10 space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                                <ShoppingBag className="w-5 h-5" />
                            </div>
                            <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded text-[10px] font-bold uppercase tracking-wider border border-amber-200/50">
                                Etalase UMKM
                            </span>
                        </div>
                        <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Produk UMKM Desa</h2>
                        <p className="text-sm text-gray-500 mt-0.5">Kelola data usaha mikro, kecil, dan menengah desa.</p>
                    </div>
                    <button
                        onClick={openCreate}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm cursor-pointer"
                    >
                        <Plus className="w-4 h-4" />
                        Tambah UMKM
                    </button>
                </div>

                {/* Search */}
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Cari nama usaha, alamat, atau pemilik..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition"
                    />
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-20 gap-2 text-gray-400 text-sm">
                            <Loader2 className="w-5 h-5 animate-spin" /> Memuat data...
                        </div>
                    ) : items.length === 0 ? (
                        <div className="text-center py-20 text-sm text-gray-400">
                            {search ? "Tidak ada UMKM yang cocok." : "Belum ada data UMKM."}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-[11px] uppercase font-bold text-gray-400 tracking-wider border-b border-gray-100 bg-gray-50/60">
                                        <th className="py-3 px-4">ID</th>
                                        <th className="py-3 px-4">Nama Usaha</th>
                                        <th className="py-3 px-4">Pemilik</th>
                                        <th className="py-3 px-4">Alamat</th>
                                        <th className="py-3 px-4">WhatsApp</th>
                                        <th className="py-3 px-4">Terdaftar</th>
                                        <th className="py-3 px-4 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-sm">
                                    {items.map((u) => (
                                        <tr key={u.id} className="hover:bg-gray-50/70 transition-colors">
                                            <td className="py-3 px-4 font-mono text-xs text-gray-400">{u.id}</td>
                                            <td className="py-3 px-4">
                                                <p className="font-semibold text-gray-900 line-clamp-1">{u.nama_usaha}</p>
                                                {u.deskripsi && (
                                                    <p className="text-[11px] text-gray-400 line-clamp-1 mt-0.5">{u.deskripsi}</p>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-gray-600">{u.pemilik_nama || "—"}</td>
                                            <td className="py-3 px-4 text-gray-600">
                                                {u.alamat ? (
                                                    <span className="inline-flex items-center gap-1 text-xs">
                                                        <MapPin className="w-3 h-3 text-gray-400" />
                                                        <span className="line-clamp-1">{u.alamat}</span>
                                                    </span>
                                                ) : "—"}
                                            </td>
                                            <td className="py-3 px-4 text-gray-600">
                                                {u.no_whatsapp ? (
                                                    <span className="inline-flex items-center gap-1 text-xs">
                                                        <Phone className="w-3 h-3 text-gray-400" />
                                                        {u.no_whatsapp}
                                                    </span>
                                                ) : "—"}
                                            </td>
                                            <td className="py-3 px-4 text-xs text-gray-400">
                                                {new Date(u.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button onClick={() => openEdit(u)} className="p-2 rounded-lg text-gray-400 hover:text-sky-600 hover:bg-sky-50 transition-colors cursor-pointer" title="Edit">
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => setDeleteTarget(u)} className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer" title="Hapus">
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

                    {/* Pagination */}
                    {!isLoading && items.length > 0 && (
                        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/40 flex items-center justify-between">
                            <span className="text-xs text-gray-400">
                                Menampilkan {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} dari {total} UMKM
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

            {/* ═══ Create / Edit Modal ═══ */}
            {modalOpen && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => !submitting && setModalOpen(false)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6 space-y-5 border border-gray-200 max-h-[90vh] overflow-y-auto">
                        <button onClick={() => !submitting && setModalOpen(false)} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-gray-100 transition cursor-pointer">
                            <X className="w-4 h-4 text-gray-500" />
                        </button>

                        <div>
                            <h3 className="text-lg font-bold text-gray-900">{formMode === "create" ? "Tambah UMKM" : "Edit UMKM"}</h3>
                            <p className="text-xs text-gray-500 mt-0.5">
                                {formMode === "create" ? "Isi data usaha baru." : `Mengubah: ${editingItem?.nama_usaha}`}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Nama Usaha</label>
                                <input
                                    type="text"
                                    required
                                    value={fNamaUsaha}
                                    onChange={(e) => setFNamaUsaha(e.target.value)}
                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition"
                                    placeholder="Nama usaha"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Deskripsi (opsional)</label>
                                <textarea
                                    value={fDeskripsi}
                                    onChange={(e) => setFDeskripsi(e.target.value)}
                                    rows={3}
                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition resize-y"
                                    placeholder="Deskripsi singkat usaha..."
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">No. WhatsApp</label>
                                    <input
                                        type="text"
                                        value={fNoWa}
                                        onChange={(e) => setFNoWa(e.target.value)}
                                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition"
                                        placeholder="08xxxxxxxxxx"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Alamat</label>
                                    <input
                                        type="text"
                                        value={fAlamat}
                                        onChange={(e) => setFAlamat(e.target.value)}
                                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition"
                                        placeholder="Alamat usaha"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Gambar Produk Utama (Upload file)</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setFFile(e.target.files?.[0] || null)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100 cursor-pointer"
                                />
                                {fGambar && !fFile && (
                                    <div className="mt-3 relative w-full h-40 rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                                        <img src={fGambar} alt="Preview" className="w-full h-full object-cover" />
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Galeri Produk Tambahan (Bisa pilih banyak)</label>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={(e) => {
                                        if (e.target.files) {
                                            setFGaleriFiles(Array.from(e.target.files));
                                        }
                                    }}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 cursor-pointer"
                                />
                                {fGaleriFoto.length > 0 && (
                                    <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
                                        {fGaleriFoto.map((url, idx) => (
                                            <div key={idx} className="relative w-20 h-20 shrink-0 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 group">
                                                <img src={url} alt={`Galeri ${idx + 1}`} className="w-full h-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => setFGaleriFoto(prev => prev.filter((_, i) => i !== idx))}
                                                    className="absolute top-1 right-1 bg-white/90 rounded-full p-0.5 text-red-600 opacity-0 group-hover:opacity-100 transition shadow-sm cursor-pointer hover:bg-red-50"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
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

            {/* ═══ Delete Confirmation ═══ */}
            {deleteTarget && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => !deleting && setDeleteTarget(null)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 space-y-4 border border-gray-200">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-red-50 rounded-xl"><AlertTriangle className="w-5 h-5 text-red-600" /></div>
                            <div>
                                <h3 className="text-base font-bold text-gray-900">Hapus UMKM</h3>
                                <p className="text-xs text-gray-500">Tindakan ini tidak bisa dibatalkan.</p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-700">
                            Apakah Anda yakin ingin menghapus <strong>{deleteTarget.nama_usaha}</strong>?
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
