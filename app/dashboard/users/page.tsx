"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
    Users,
    UserPlus,
    Pencil,
    Trash2,
    X,
    Search,
    Loader2,
    AlertTriangle,
    Check,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

/* ─────────── Types ─────────── */
interface User {
    id: number;
    nama: string;
    email: string;
    role: string;
    created_at: string;
}

type FormMode = "create" | "edit";

const ROLE_OPTIONS = [
    { value: "super_admin", label: "Super Admin" },
    { value: "perangkat_desa", label: "Perangkat Desa" },
    { value: "pemilik_umkm", label: "Pemilik UMKM" },
];

/* ─────────── Role badge helper ─────────── */
function roleBadge(role: string) {
    const map: Record<string, string> = {
        super_admin: "bg-red-50 text-red-700 border-red-200/50",
        perangkat_desa: "bg-teal-50 text-teal-700 border-teal-200/50",
        pemilik_umkm: "bg-amber-50 text-amber-700 border-amber-200/50",
    };
    return map[role] ?? "bg-slate-100 text-slate-700 border-slate-200/50";
}

/* ─────────── Toast component ─────────── */
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
            className={`fixed top-4 right-4 z-[100] flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium animate-slide-in ${type === "success"
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : "bg-red-50 text-red-800 border-red-200"
                }`}
        >
            {type === "success" ? (
                <Check className="w-4 h-4" />
            ) : (
                <AlertTriangle className="w-4 h-4" />
            )}
            {message}
            <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100">
                <X className="w-3.5 h-3.5" />
            </button>
        </div>
    );
}

/* ═══════════════════════════════════════════════════
   Main page component
   ═══════════════════════════════════════════════════ */
export default function UsersManagementPage() {
    /* ── State ── */
    const [users, setUsers] = useState<User[]>([]);
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
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Form fields
    const [fNama, setFNama] = useState("");
    const [fEmail, setFEmail] = useState("");
    const [fRole, setFRole] = useState("perangkat_desa");
    const [fPassword, setFPassword] = useState("");

    // Delete confirmation
    const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
    const [deleting, setDeleting] = useState(false);

    // Toast
    const [toast, setToast] = useState<{
        message: string;
        type: "success" | "error";
    } | null>(null);

    /* ── Debounce search ── */
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1); // reset to page 1 on search
        }, 400);
        return () => clearTimeout(timer);
    }, [search]);

    /* ── Fetch users (server-side pagination) ── */
    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: String(page),
                limit: String(LIMIT),
            });
            if (debouncedSearch) params.set('search', debouncedSearch);

            const res = await fetch(`/api/users?${params}`);
            const json = await res.json();
            if (json.success) {
                setUsers(json.data);
                setTotal(json.pagination.total);
                setTotalPages(json.pagination.totalPages);
            }
        } catch (err) {
            console.error("Fetch users error", err);
        } finally {
            setLoading(false);
        }
    }, [page, debouncedSearch]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    /* ── Open modal ── */
    function openCreate() {
        setFormMode("create");
        setEditingUser(null);
        setFNama("");
        setFEmail("");
        setFRole("perangkat_desa");
        setFPassword("");
        setModalOpen(true);
    }

    function openEdit(user: User) {
        setFormMode("edit");
        setEditingUser(user);
        setFNama(user.nama);
        setFEmail(user.email);
        setFRole(user.role);
        setFPassword("");
        setModalOpen(true);
    }

    /* ── Submit (create / edit) ── */
    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);

        try {
            if (formMode === "create") {
                const res = await fetch("/api/users", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        nama: fNama,
                        email: fEmail,
                        role: fRole,
                        password: fPassword,
                    }),
                });
                const json = await res.json();
                if (!res.ok) throw new Error(json.message || "Gagal menambahkan user");
                setToast({ message: "User berhasil ditambahkan!", type: "success" });
            } else if (editingUser) {
                const res = await fetch(`/api/users/${editingUser.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ nama: fNama, role: fRole }),
                });
                const json = await res.json();
                if (!res.ok) throw new Error(json.message || "Gagal mengubah user");
                setToast({ message: "User berhasil diperbarui!", type: "success" });
            }

            setModalOpen(false);
            fetchUsers();
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
            const res = await fetch(`/api/users/${deleteTarget.id}`, {
                method: "DELETE",
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Gagal menghapus user");
            setToast({ message: "User berhasil dihapus.", type: "success" });
            setDeleteTarget(null);
            fetchUsers();
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
            {/* Toast notification */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            <main className="p-6 md:p-10 space-y-6">
                {/* ── Header ── */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="p-2 bg-violet-50 text-violet-600 rounded-lg">
                                <Users className="w-5 h-5" />
                            </div>
                            <span className="px-2 py-0.5 bg-violet-50 text-violet-700 rounded text-[10px] font-bold uppercase tracking-wider border border-violet-200/50">
                                Manajemen User
                            </span>
                        </div>
                        <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                            Daftar Pengguna
                        </h2>
                        <p className="text-sm text-gray-500 mt-0.5">
                            Kelola semua akun pengguna yang terdaftar dalam sistem.
                        </p>
                    </div>

                    <button
                        onClick={openCreate}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm cursor-pointer"
                    >
                        <UserPlus className="w-4 h-4" />
                        Tambah User
                    </button>
                </div>

                {/* ── Search bar ── */}
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Cari nama, email, atau role..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition"
                    />
                </div>

                {/* ── Table card ── */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center py-20 gap-2 text-gray-400 text-sm">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Memuat data...
                        </div>
                    ) : users.length === 0 ? (
                        <div className="text-center py-20 text-sm text-gray-400">
                            {search
                                ? "Tidak ada user yang cocok dengan pencarian."
                                : "Belum ada user terdaftar."}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-[11px] uppercase font-bold text-gray-400 tracking-wider border-b border-gray-100 bg-gray-50/60">
                                        <th className="py-3 px-4">ID</th>
                                        <th className="py-3 px-4">Nama</th>
                                        <th className="py-3 px-4">Email</th>
                                        <th className="py-3 px-4">Role</th>
                                        <th className="py-3 px-4">Terdaftar</th>
                                        <th className="py-3 px-4 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-sm">
                                    {users.map((u) => (
                                        <tr
                                            key={u.id}
                                            className="hover:bg-gray-50/70 transition-colors"
                                        >
                                            <td className="py-3 px-4 font-mono text-xs text-gray-400">
                                                {u.id}
                                            </td>
                                            <td className="py-3 px-4 font-semibold text-gray-900">
                                                {u.nama}
                                            </td>
                                            <td className="py-3 px-4 text-gray-600">{u.email}</td>
                                            <td className="py-3 px-4">
                                                <span
                                                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${roleBadge(
                                                        u.role
                                                    )}`}
                                                >
                                                    {u.role.replace("_", " ")}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-xs text-gray-400">
                                                {new Date(u.created_at).toLocaleDateString("id-ID", {
                                                    day: "numeric",
                                                    month: "short",
                                                    year: "numeric",
                                                })}
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={() => openEdit(u)}
                                                        className="p-2 rounded-lg text-gray-400 hover:text-sky-600 hover:bg-sky-50 transition-colors cursor-pointer"
                                                        title="Edit user"
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteTarget(u)}
                                                        className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                                        title="Hapus user"
                                                    >
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

                    {/* ── Pagination footer ── */}
                    {!loading && users.length > 0 && (
                        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/40 flex items-center justify-between">
                            <span className="text-xs text-gray-400">
                                Menampilkan {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} dari {total} pengguna
                            </span>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page <= 1}
                                    className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <span className="text-xs text-gray-600 font-medium px-2">
                                    {page} / {totalPages}
                                </span>
                                <button
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={page >= totalPages}
                                    className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* ═══════════════════════════════════════
          Create / Edit Modal
         ═══════════════════════════════════════ */}
            {modalOpen && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center">
                    {/* Overlay */}
                    <div
                        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                        onClick={() => !submitting && setModalOpen(false)}
                    />

                    {/* Card */}
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 space-y-5 border border-gray-200">
                        {/* Close */}
                        <button
                            onClick={() => !submitting && setModalOpen(false)}
                            className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-gray-100 transition cursor-pointer"
                        >
                            <X className="w-4 h-4 text-gray-500" />
                        </button>

                        <div>
                            <h3 className="text-lg font-bold text-gray-900">
                                {formMode === "create" ? "Tambah User Baru" : "Edit User"}
                            </h3>
                            <p className="text-xs text-gray-500 mt-0.5">
                                {formMode === "create"
                                    ? "Isi data untuk mendaftarkan pengguna baru."
                                    : `Mengubah data untuk ${editingUser?.nama}.`}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Nama */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Nama Lengkap
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={fNama}
                                    onChange={(e) => setFNama(e.target.value)}
                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition"
                                    placeholder="Nama lengkap pengguna"
                                />
                            </div>

                            {/* Email (only on create) */}
                            {formMode === "create" && (
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        value={fEmail}
                                        onChange={(e) => setFEmail(e.target.value)}
                                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition"
                                        placeholder="email@contoh.com"
                                    />
                                </div>
                            )}

                            {/* Role */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Role / Peran
                                </label>
                                <select
                                    value={fRole}
                                    onChange={(e) => setFRole(e.target.value)}
                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition cursor-pointer"
                                >
                                    {ROLE_OPTIONS.map((r) => (
                                        <option key={r.value} value={r.value}>
                                            {r.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Password (only on create) */}
                            {formMode === "create" && (
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                                        Password
                                    </label>
                                    <input
                                        type="password"
                                        required
                                        minLength={6}
                                        value={fPassword}
                                        onChange={(e) => setFPassword(e.target.value)}
                                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition"
                                        placeholder="Minimal 6 karakter"
                                    />
                                </div>
                            )}

                            {/* Buttons */}
                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    disabled={submitting}
                                    className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition shadow-sm disabled:opacity-60 cursor-pointer"
                                >
                                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {formMode === "create" ? "Simpan" : "Perbarui"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════════
          Delete Confirmation Modal
         ═══════════════════════════════════════ */}
            {deleteTarget && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center">
                    <div
                        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                        onClick={() => !deleting && setDeleteTarget(null)}
                    />

                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 space-y-4 border border-gray-200">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-red-50 rounded-xl">
                                <AlertTriangle className="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-gray-900">
                                    Hapus User
                                </h3>
                                <p className="text-xs text-gray-500">Tindakan ini tidak bisa dibatalkan.</p>
                            </div>
                        </div>

                        <p className="text-sm text-gray-700">
                            Apakah Anda yakin ingin menghapus user{" "}
                            <strong>{deleteTarget.nama}</strong> ({deleteTarget.email})?
                        </p>

                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setDeleteTarget(null)}
                                disabled={deleting}
                                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition cursor-pointer"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition shadow-sm disabled:opacity-60 cursor-pointer"
                            >
                                {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                                Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Animation keyframes */}
            <style jsx global>{`
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
        </>
    );
}