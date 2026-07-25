"use client";

import { useEffect, useState, useCallback } from "react";
import {
    Landmark,
    Plus,
    Pencil,
    Trash2,
    X,
    Search,
    Loader2,
    AlertTriangle,
    Check,
    ChevronLeft,
    ChevronRight,
    GraduationCap,
    BadgeCheck,
} from "lucide-react";

/* ─────────── Types ─────────── */
interface Perangkat {
    id: number;
    user_id: number | null;
    jabatan: string;
    nip: string | null;
    pendidikan_terakhir: string | null;
    foto: string | null;
    masa_jabatan: string | null;
    nama_user: string | null;
    email_user: string | null;
}

type FormMode = "create" | "edit";

/* ─────────── Toast ─────────── */
function Toast({
    message,
    type,
    onClose,
}: {
    message: string;
    type: "success" | "error";
    onClose: () => void;
}) {
    useEffect(() => {
        const t = setTimeout(onClose, 4000);
        return () => clearTimeout(t);
    }, [onClose]);

    return (
        <div
            className={`fixed top-4 right-4 z-[100] flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium animate-slide-in ${
                type === "success"
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : "bg-red-50 text-red-800 border-red-200"
            }`}
        >
            {type === "success" ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            {message}
            <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100">
                <X className="w-3.5 h-3.5" />
            </button>
        </div>
    );
}

/* ═══════════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════════ */
export default function PerangkatDesaPage() {
    const [items, setItems] = useState<Perangkat[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    // Pagination
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const LIMIT = 10;

    // Modal
    const [modalOpen, setModalOpen] = useState(false);
    const [formMode, setFormMode] = useState<FormMode>("create");
    const [editingItem, setEditingItem] = useState<Perangkat | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Form
    const [fJabatan, setFJabatan] = useState("");
    const [fNip, setFNip] = useState("");
    const [fPendidikan, setFPendidikan] = useState("");
    const [fFoto, setFFoto] = useState("");
    const [fMasaJabatan, setFMasaJabatan] = useState("");

    // Delete
    const [deleteTarget, setDeleteTarget] = useState<Perangkat | null>(null);
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
    const fetchItems = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
            if (debouncedSearch) params.set("search", debouncedSearch);

            const res = await fetch(`/api/perangkat-desa?${params}`);
            const json = await res.json();
            if (json.success) {
                setItems(json.data);
                setTotal(json.pagination.total);
                setTotalPages(json.pagination.totalPages);
            }
        } catch (err) {
            console.error("Fetch perangkat desa error", err);
        } finally {
            setLoading(false);
        }
    }, [page, debouncedSearch]);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    /* ── Modal openers ── */
    function openCreate() {
        setFormMode("create");
        setEditingItem(null);
        setFJabatan("");
        setFNip("");
        setFPendidikan("");
        setFFoto("");
        setFMasaJabatan("");
        setModalOpen(true);
    }

    function openEdit(item: Perangkat) {
        setFormMode("edit");
        setEditingItem(item);
        setFJabatan(item.jabatan);
        setFNip(item.nip || "");
        setFPendidikan(item.pendidikan_terakhir || "");
        setFFoto(item.foto || "");
        setFMasaJabatan(item.masa_jabatan || "");
        setModalOpen(true);
    }

    /* ── Submit ── */
    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = {
                jabatan: fJabatan,
                nip: fNip || null,
                pendidikan_terakhir: fPendidikan || null,
                foto: fFoto || null,
                masa_jabatan: fMasaJabatan || null,
            };

            if (formMode === "create") {
                const res = await fetch("/api/perangkat-desa", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
                const json = await res.json();
                if (!res.ok) throw new Error(json.message || "Gagal menambahkan data");
                setToast({ message: "Perangkat desa berhasil ditambahkan!", type: "success" });
            } else if (editingItem) {
                const res = await fetch(`/api/perangkat-desa/${editingItem.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
                const json = await res.json();
                if (!res.ok) throw new Error(json.message || "Gagal mengubah data");
                setToast({ message: "Data berhasil diperbarui!", type: "success" });
            }
            setModalOpen(false);
            fetchItems();
        } catch (err: any) {
            setToast({ message: err.message, type: "error" });
        } finally {
            setSubmitting(false);
        }
    }

    /* ── Delete ── */
    async function handleDelete() {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            const res = await fetch(`/api/perangkat-desa/${deleteTarget.id}`, { method: "DELETE" });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Gagal menghapus data");
            setToast({ message: "Data berhasil dihapus.", type: "success" });
            setDeleteTarget(null);
            fetchItems();
        } catch (err: any) {
            setToast({ message: err.message, type: "error" });
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
                            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                <Landmark className="w-5 h-5" />
                            </div>
                            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-[10px] font-bold uppercase tracking-wider border border-indigo-200/50">
                                Struktur Pemerintahan
                            </span>
                        </div>
                        <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Perangkat Desa</h2>
                        <p className="text-sm text-gray-500 mt-0.5">Kelola data jabatan dan struktur pemerintahan desa.</p>
                    </div>
                    <button
                        onClick={openCreate}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm cursor-pointer"
                    >
                        <Plus className="w-4 h-4" />
                        Tambah Perangkat
                    </button>
                </div>

                {/* Search */}
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Cari jabatan, nama, atau NIP..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition"
                    />
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center py-20 gap-2 text-gray-400 text-sm">
                            <Loader2 className="w-5 h-5 animate-spin" /> Memuat data...
                        </div>
                    ) : items.length === 0 ? (
                        <div className="text-center py-20 text-sm text-gray-400">
                            {search ? "Tidak ada data yang cocok." : "Belum ada data perangkat desa."}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-[11px] uppercase font-bold text-gray-400 tracking-wider border-b border-gray-100 bg-gray-50/60">
                                        <th className="py-3 px-4">ID</th>
                                        <th className="py-3 px-4">Nama</th>
                                        <th className="py-3 px-4">Jabatan</th>
                                        <th className="py-3 px-4">NIP</th>
                                        <th className="py-3 px-4">Pendidikan</th>
                                        <th className="py-3 px-4">Masa Jabatan</th>
                                        <th className="py-3 px-4 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-sm">
                                    {items.map((p) => (
                                        <tr key={p.id} className="hover:bg-gray-50/70 transition-colors">
                                            <td className="py-3 px-4 font-mono text-xs text-gray-400">{p.id}</td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-3">
                                                    {/* Avatar */}
                                                    {p.foto ? (
                                                        <img src={p.foto} alt={p.nama_user || p.jabatan} className="w-8 h-8 rounded-full object-cover border border-gray-200" />
                                                    ) : (
                                                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold shrink-0">
                                                            {(p.nama_user || p.jabatan)[0]?.toUpperCase() || "?"}
                                                        </div>
                                                    )}
                                                    <div className="min-w-0">
                                                        <p className="font-semibold text-gray-900 truncate">{p.nama_user || "—"}</p>
                                                        {p.email_user && <p className="text-[11px] text-gray-400 truncate">{p.email_user}</p>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-50 text-indigo-700 border border-indigo-200/50">
                                                    <BadgeCheck className="w-3 h-3" />
                                                    {p.jabatan}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-gray-600 font-mono text-xs">{p.nip || "—"}</td>
                                            <td className="py-3 px-4 text-gray-600">
                                                {p.pendidikan_terakhir ? (
                                                    <span className="inline-flex items-center gap-1 text-xs">
                                                        <GraduationCap className="w-3 h-3 text-gray-400" />
                                                        {p.pendidikan_terakhir}
                                                    </span>
                                                ) : "—"}
                                            </td>
                                            <td className="py-3 px-4 text-xs text-gray-500">{p.masa_jabatan || "—"}</td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button onClick={() => openEdit(p)} className="p-2 rounded-lg text-gray-400 hover:text-sky-600 hover:bg-sky-50 transition-colors cursor-pointer" title="Edit">
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
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

                    {/* Pagination */}
                    {!loading && items.length > 0 && (
                        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/40 flex items-center justify-between">
                            <span className="text-xs text-gray-400">
                                Menampilkan {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} dari {total} perangkat
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
                            <h3 className="text-lg font-bold text-gray-900">{formMode === "create" ? "Tambah Perangkat Desa" : "Edit Perangkat Desa"}</h3>
                            <p className="text-xs text-gray-500 mt-0.5">
                                {formMode === "create" ? "Isi data jabatan pemerintahan desa." : `Mengubah: ${editingItem?.jabatan}`}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Jabatan */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Jabatan *</label>
                                <input
                                    type="text"
                                    required
                                    value={fJabatan}
                                    onChange={(e) => setFJabatan(e.target.value)}
                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition"
                                    placeholder="Contoh: Kepala Desa, Sekretaris Desa, Kaur Keuangan"
                                />
                            </div>

                            {/* NIP & Pendidikan */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">NIP</label>
                                    <input
                                        type="text"
                                        value={fNip}
                                        onChange={(e) => setFNip(e.target.value)}
                                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition"
                                        placeholder="Nomor Induk Pegawai"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Pendidikan Terakhir</label>
                                    <select
                                        value={fPendidikan}
                                        onChange={(e) => setFPendidikan(e.target.value)}
                                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition cursor-pointer"
                                    >
                                        <option value="">— Pilih —</option>
                                        <option value="SD">SD</option>
                                        <option value="SMP">SMP</option>
                                        <option value="SMA/SMK">SMA/SMK</option>
                                        <option value="D3">D3</option>
                                        <option value="S1">S1</option>
                                        <option value="S2">S2</option>
                                        <option value="S3">S3</option>
                                    </select>
                                </div>
                            </div>

                            {/* Masa Jabatan */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Masa Jabatan</label>
                                <input
                                    type="text"
                                    value={fMasaJabatan}
                                    onChange={(e) => setFMasaJabatan(e.target.value)}
                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition"
                                    placeholder="Contoh: 2020 – 2026"
                                />
                            </div>

                            {/* Foto URL */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">URL Foto (opsional)</label>
                                <input
                                    type="text"
                                    value={fFoto}
                                    onChange={(e) => setFFoto(e.target.value)}
                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition"
                                    placeholder="https://contoh.com/foto.jpg"
                                />
                            </div>

                            {/* Buttons */}
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
                                <h3 className="text-base font-bold text-gray-900">Hapus Perangkat</h3>
                                <p className="text-xs text-gray-500">Tindakan ini tidak bisa dibatalkan.</p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-700">
                            Hapus <strong>{deleteTarget.nama_user || "perangkat"}</strong> dari jabatan <strong>{deleteTarget.jabatan}</strong>?
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

            <style jsx global>{`
                @keyframes slide-in {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-slide-in { animation: slide-in 0.3s ease-out; }
            `}</style>
        </>
    );
}
