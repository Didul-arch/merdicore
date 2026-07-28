"use client";

import { useEffect, useState, useCallback } from "react";
import {
    MessageSquare,
    Trash2,
    Eye,
    X,
    Search,
    Loader2,
    AlertTriangle,
    Check,
    ChevronLeft,
    ChevronRight,
    Mail,
    Phone,
    Circle,
    CheckCircle2,
} from "lucide-react";

/* ─────────── Types ─────────── */
interface Pesan {
    id: number;
    nama_pengirim: string;
    email: string | null;
    no_hp: string | null;
    isi_pesan: string;
    status: "belum_dibaca" | "sudah_dibaca";
    created_at: string;
}

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

function formatTanggal(dateStr: string) {
    return new Date(dateStr).toLocaleString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

/* ═══════════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════════ */
export default function PesanPage() {
    const [items, setItems] = useState<Pesan[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<"" | "belum_dibaca" | "sudah_dibaca">("");

    // Pagination
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const LIMIT = 10;

    // Detail modal
    const [selected, setSelected] = useState<Pesan | null>(null);
    const [updatingStatus, setUpdatingStatus] = useState(false);

    // Delete
    const [deleteTarget, setDeleteTarget] = useState<Pesan | null>(null);
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

    /* ── Reset page on status filter change ── */
    useEffect(() => {
        setPage(1);
    }, [statusFilter]);

    /* ── Fetch ── */
    const fetchItems = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
            if (debouncedSearch) params.set("search", debouncedSearch);
            if (statusFilter) params.set("status", statusFilter);

            const res = await fetch(`/api/pesan?${params}`);
            const json = await res.json();
            if (json.success) {
                setItems(json.data);
                setTotal(json.pagination.total);
                setTotalPages(json.pagination.totalPages);
            }
        } catch (err) {
            console.error("Fetch pesan error", err);
        } finally {
            setLoading(false);
        }
    }, [page, debouncedSearch, statusFilter]);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    /* ── Buka detail + otomatis tandai dibaca ── */
    async function openDetail(item: Pesan) {
        setSelected(item);
        if (item.status === "belum_dibaca") {
            await updateStatus(item, "sudah_dibaca", { silent: true });
        }
    }

    /* ── Update status ── */
    async function updateStatus(item: Pesan, status: Pesan["status"], opts?: { silent?: boolean }) {
        setUpdatingStatus(true);
        try {
            const res = await fetch(`/api/pesan/${item.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Gagal mengubah status");
            setItems((prev) => prev.map((p) => (p.id === item.id ? { ...p, status } : p)));
            setSelected((prev) => (prev && prev.id === item.id ? { ...prev, status } : prev));
            if (!opts?.silent) setToast({ message: "Status pesan diperbarui.", type: "success" });
        } catch (err) {
            if (err instanceof Error) setToast({ message: err.message, type: "error" });
        } finally {
            setUpdatingStatus(false);
        }
    }

    /* ── Delete ── */
    async function handleDelete() {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            const res = await fetch(`/api/pesan/${deleteTarget.id}`, { method: "DELETE" });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Gagal menghapus pesan");
            setToast({ message: "Pesan berhasil dihapus.", type: "success" });
            setDeleteTarget(null);
            setSelected(null);
            fetchItems();
        } catch (err) {
            if (err instanceof Error) setToast({ message: err.message, type: "error" });
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
                            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
                                <MessageSquare className="w-5 h-5" />
                            </div>
                            <span className="px-2 py-0.5 bg-rose-50 text-rose-700 rounded text-[10px] font-bold uppercase tracking-wider border border-rose-200/50">
                                Kotak Masuk
                            </span>
                        </div>
                        <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Aspirasi Warga</h2>
                        <p className="text-sm text-gray-500 mt-0.5">Pesan, saran, dan pengaduan yang dikirim warga lewat form kontak.</p>
                    </div>
                </div>

                {/* Search + Filter */}
                <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                    <div className="relative max-w-md flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari nama, email, atau isi pesan..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition"
                        />
                    </div>
                    <div className="flex gap-2">
                        {([
                            { value: "", label: "Semua" },
                            { value: "belum_dibaca", label: "Belum Dibaca" },
                            { value: "sudah_dibaca", label: "Sudah Dibaca" },
                        ] as const).map((opt) => (
                            <button
                                key={opt.value}
                                onClick={() => setStatusFilter(opt.value)}
                                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                                    statusFilter === opt.value
                                        ? "bg-teal-600 text-white shadow-sm"
                                        : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                                }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center py-20 gap-2 text-gray-400 text-sm">
                            <Loader2 className="w-5 h-5 animate-spin" /> Memuat data...
                        </div>
                    ) : items.length === 0 ? (
                        <div className="text-center py-20 text-sm text-gray-400">
                            {search || statusFilter ? "Tidak ada pesan yang cocok." : "Belum ada pesan masuk."}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-[11px] uppercase font-bold text-gray-400 tracking-wider border-b border-gray-100 bg-gray-50/60">
                                        <th className="py-3 px-4">Pengirim</th>
                                        <th className="py-3 px-4">Pesan</th>
                                        <th className="py-3 px-4">Tanggal</th>
                                        <th className="py-3 px-4 text-center">Status</th>
                                        <th className="py-3 px-4 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-sm">
                                    {items.map((p) => (
                                        <tr key={p.id} className={`hover:bg-gray-50/70 transition-colors cursor-pointer ${p.status === "belum_dibaca" ? "bg-teal-50/30" : ""}`} onClick={() => openDetail(p)}>
                                            <td className="py-3 px-4">
                                                <p className="font-semibold text-gray-900 line-clamp-1">{p.nama_pengirim}</p>
                                                {p.email && <p className="text-[11px] text-gray-400 mt-0.5">{p.email}</p>}
                                            </td>
                                            <td className="py-3 px-4 max-w-xs">
                                                <p className="text-gray-600 line-clamp-1">{p.isi_pesan}</p>
                                            </td>
                                            <td className="py-3 px-4 text-gray-500 text-xs whitespace-nowrap">{formatTanggal(p.created_at)}</td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center justify-center">
                                                    {p.status === "belum_dibaca" ? (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-teal-50 text-teal-700 border border-teal-200 rounded-lg text-[11px] font-bold">
                                                            <Circle className="w-2.5 h-2.5 fill-teal-500 text-teal-500" /> Baru
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-50 text-gray-500 border border-gray-200 rounded-lg text-[11px] font-medium">
                                                            <CheckCircle2 className="w-3 h-3" /> Dibaca
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button onClick={(e) => { e.stopPropagation(); openDetail(p); }} className="p-2 rounded-lg text-gray-400 hover:text-sky-600 hover:bg-sky-50 transition-colors cursor-pointer" title="Lihat">
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={(e) => { e.stopPropagation(); setDeleteTarget(p); }} className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer" title="Hapus">
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
                                Menampilkan {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} dari {total} pesan
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

            {/* ═══ Detail Modal ═══ */}
            {selected && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setSelected(null)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6 space-y-5 border border-gray-200 max-h-[90vh] overflow-y-auto">
                        <button onClick={() => setSelected(null)} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-gray-100 transition cursor-pointer">
                            <X className="w-4 h-4 text-gray-500" />
                        </button>

                        <div>
                            <h3 className="text-lg font-bold text-gray-900">{selected.nama_pengirim}</h3>
                            <p className="text-xs text-gray-400 mt-0.5">{formatTanggal(selected.created_at)}</p>
                        </div>

                        <div className="space-y-2">
                            {selected.email && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Mail className="w-4 h-4 text-gray-400" /> {selected.email}
                                </div>
                            )}
                            {selected.no_hp && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Phone className="w-4 h-4 text-gray-400" /> {selected.no_hp}
                                </div>
                            )}
                        </div>

                        <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{selected.isi_pesan}</p>
                        </div>

                        <div className="flex justify-between items-center gap-2 pt-2">
                            <button
                                onClick={() => updateStatus(selected, selected.status === "belum_dibaca" ? "sudah_dibaca" : "belum_dibaca")}
                                disabled={updatingStatus}
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-xl transition cursor-pointer disabled:opacity-60"
                            >
                                {updatingStatus && <Loader2 className="w-4 h-4 animate-spin" />}
                                Tandai {selected.status === "belum_dibaca" ? "Sudah Dibaca" : "Belum Dibaca"}
                            </button>
                            <button
                                onClick={() => setDeleteTarget(selected)}
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition cursor-pointer"
                            >
                                <Trash2 className="w-4 h-4" /> Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ Delete Confirmation ═══ */}
            {deleteTarget && (
                <div className="fixed inset-0 z-[90] flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => !deleting && setDeleteTarget(null)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 space-y-4 border border-gray-200">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-red-50 rounded-xl"><AlertTriangle className="w-5 h-5 text-red-600" /></div>
                            <div>
                                <h3 className="text-base font-bold text-gray-900">Hapus Pesan</h3>
                                <p className="text-xs text-gray-500">Tindakan ini tidak bisa dibatalkan.</p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-700">
                            Apakah Anda yakin ingin menghapus pesan dari <strong>{deleteTarget.nama_pengirim}</strong>?
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
