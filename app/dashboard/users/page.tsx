"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import {
    Users,
    UserPlus,
    Pencil,
    Trash2,
    X,
    Search,
    Loader2,
    AlertTriangle,
    ChevronLeft,
    ChevronRight,
    Phone,
    Landmark,
    BadgeCheck,
} from "lucide-react";
import Toast from "@/components/dashboard/Toast";
import fetcher from "@/lib/swr-fetcher";
import { uploadImage } from "@/lib/upload-image";

/* ─────────── Types ─────────── */
interface User {
    id: number;
    nama: string;
    email: string;
    role: string;
    no_hp: string | null;
    created_at: string;
    // Terisi kalau user ini diangkat jadi perangkat desa (LEFT JOIN di API)
    pd_id: number | null;
    jabatan: string | null;
    nip: string | null;
    pendidikan_terakhir: string | null;
    foto: string | null;
    masa_jabatan: string | null;
}

type FormMode = "create" | "edit";

const ROLE_OPTIONS = [
    { value: "super_admin", label: "Super Admin" },
    { value: "perangkat_desa", label: "Perangkat Desa" },
    { value: "pemilik_umkm", label: "Pemilik UMKM" },
];

const PENDIDIKAN_OPTIONS = ["SD", "SMP", "SMA/SMK", "D3", "S1", "S2", "S3"];

function roleBadge(role: string) {
    const map: Record<string, string> = {
        super_admin: "bg-red-50 text-red-700 border-red-200/50",
        perangkat_desa: "bg-teal-50 text-teal-700 border-teal-200/50",
        pemilik_umkm: "bg-amber-50 text-amber-700 border-amber-200/50",
    };
    return map[role] ?? "bg-slate-100 text-slate-700 border-slate-200/50";
}

/* ═══════════════════════════════════════════════════
   Manajemen User
   Satu halaman buat kelola akun sekaligus nentuin siapa yang
   jadi perangkat desa dan jabatannya apa.
   ═══════════════════════════════════════════════════ */
export default function UsersManagementPage() {
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [page, setPage] = useState(1);
    const LIMIT = 10;

    // Modal akun
    const [modalOpen, setModalOpen] = useState(false);
    const [formMode, setFormMode] = useState<FormMode>("create");
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [fNama, setFNama] = useState("");
    const [fEmail, setFEmail] = useState("");
    const [fNoHp, setFNoHp] = useState("");
    const [fRole, setFRole] = useState("perangkat_desa");
    const [fPassword, setFPassword] = useState("");

    // Modal jabatan (perangkat desa)
    const [jabatanTarget, setJabatanTarget] = useState<User | null>(null);
    const [savingJabatan, setSavingJabatan] = useState(false);
    const [jJabatan, setJJabatan] = useState("");
    const [jNip, setJNip] = useState("");
    const [jPendidikan, setJPendidikan] = useState("");
    const [jMasaJabatan, setJMasaJabatan] = useState("");
    const [jFoto, setJFoto] = useState("");
    const [jFile, setJFile] = useState<File | null>(null);

    // Hapus
    const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [copotTarget, setCopotTarget] = useState<User | null>(null);
    const [copoting, setCopoting] = useState(false);

    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

    /* ── Debounce ── */
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 400);
        return () => clearTimeout(timer);
    }, [search]);

    const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
    if (debouncedSearch) params.set("search", debouncedSearch);

    const { data, isLoading, mutate } = useSWR(`/api/users?${params}`, fetcher);
    const users: User[] = data?.data ?? [];
    const total = data?.pagination?.total ?? 0;
    const totalPages = data?.pagination?.totalPages ?? 1;

    /* ── Modal akun ── */
    function openCreate() {
        setFormMode("create");
        setEditingUser(null);
        setFNama("");
        setFEmail("");
        setFNoHp("");
        setFRole("perangkat_desa");
        setFPassword("");
        setModalOpen(true);
    }

    function openEdit(user: User) {
        setFormMode("edit");
        setEditingUser(user);
        setFNama(user.nama);
        setFEmail(user.email);
        setFNoHp(user.no_hp ?? "");
        setFRole(user.role);
        setFPassword("");
        setModalOpen(true);
    }

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
                        no_hp: fNoHp,
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
                    body: JSON.stringify({ nama: fNama, no_hp: fNoHp, role: fRole }),
                });
                const json = await res.json();
                if (!res.ok) throw new Error(json.message || "Gagal mengubah user");
                setToast({ message: "User berhasil diperbarui!", type: "success" });
            }
            setModalOpen(false);
            mutate();
        } catch (err) {
            setToast({ message: err instanceof Error ? err.message : "Terjadi kesalahan", type: "error" });
        } finally {
            setSubmitting(false);
        }
    }

    /* ── Modal jabatan ── */
    function openJabatan(user: User) {
        setJabatanTarget(user);
        setJJabatan(user.jabatan ?? "");
        setJNip(user.nip ?? "");
        setJPendidikan(user.pendidikan_terakhir ?? "");
        setJMasaJabatan(user.masa_jabatan ?? "");
        setJFoto(user.foto ?? "");
        setJFile(null);
    }

    async function handleSubmitJabatan(e: React.FormEvent) {
        e.preventDefault();
        if (!jabatanTarget) return;
        setSavingJabatan(true);
        try {
            let fotoUrl = jFoto;
            if (jFile) fotoUrl = await uploadImage(jFile, "avatar");

            const payload = {
                user_id: jabatanTarget.id,
                jabatan: jJabatan,
                nip: jNip || null,
                pendidikan_terakhir: jPendidikan || null,
                foto: fotoUrl || null,
                masa_jabatan: jMasaJabatan || null,
            };

            // pd_id ada = user ini sudah punya jabatan -> ubah. Belum ada -> angkat baru.
            const res = jabatanTarget.pd_id
                ? await fetch(`/api/perangkat-desa/${jabatanTarget.pd_id}`, {
                      method: "PUT",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(payload),
                  })
                : await fetch("/api/perangkat-desa", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(payload),
                  });

            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Gagal menyimpan jabatan");
            setToast({
                message: jabatanTarget.pd_id ? "Jabatan berhasil diperbarui!" : "Berhasil diangkat jadi perangkat desa!",
                type: "success",
            });
            setJabatanTarget(null);
            mutate();
        } catch (err) {
            setToast({ message: err instanceof Error ? err.message : "Terjadi kesalahan", type: "error" });
        } finally {
            setSavingJabatan(false);
        }
    }

    /* ── Copot jabatan (akunnya tetap ada) ── */
    async function handleCopot() {
        if (!copotTarget?.pd_id) return;
        setCopoting(true);
        try {
            const res = await fetch(`/api/perangkat-desa/${copotTarget.pd_id}`, { method: "DELETE" });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Gagal mencopot jabatan");
            setToast({ message: "Jabatan berhasil dicopot. Akunnya tetap ada.", type: "success" });
            setCopotTarget(null);
            mutate();
        } catch (err) {
            setToast({ message: err instanceof Error ? err.message : "Terjadi kesalahan", type: "error" });
        } finally {
            setCopoting(false);
        }
    }

    /* ── Hapus akun ── */
    async function handleDelete() {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            const res = await fetch(`/api/users/${deleteTarget.id}`, { method: "DELETE" });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Gagal menghapus user");
            setToast({ message: "User berhasil dihapus.", type: "success" });
            setDeleteTarget(null);
            mutate();
        } catch (err) {
            setToast({ message: err instanceof Error ? err.message : "Terjadi kesalahan", type: "error" });
        } finally {
            setDeleting(false);
        }
    }

    /* ═══════════════════════════════════════ */
    return (
        <>
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <main className="p-6 md:p-10 space-y-6">
                {/* Header */}
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
                        <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Daftar Pengguna</h2>
                        <p className="text-sm text-gray-500 mt-0.5">
                            Kelola akun pengguna, sekaligus tentukan siapa yang menjabat sebagai perangkat desa.
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

                {/* Search */}
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Cari nama, email, role, atau jabatan..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition"
                    />
                </div>

                {/* Tabel */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-20 gap-2 text-gray-400 text-sm">
                            <Loader2 className="w-5 h-5 animate-spin" /> Memuat data...
                        </div>
                    ) : users.length === 0 ? (
                        <div className="text-center py-20 text-sm text-gray-400">
                            {search ? "Tidak ada user yang cocok dengan pencarian." : "Belum ada user terdaftar."}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-[11px] uppercase font-bold text-gray-400 tracking-wider border-b border-gray-100 bg-gray-50/60">
                                        <th className="py-3 px-4">Nama</th>
                                        <th className="py-3 px-4">Kontak</th>
                                        <th className="py-3 px-4">Role</th>
                                        <th className="py-3 px-4">Jabatan di Desa</th>
                                        <th className="py-3 px-4 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-sm">
                                    {users.map((u) => (
                                        <tr key={u.id} className="hover:bg-gray-50/70 transition-colors">
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center text-xs font-bold shrink-0">
                                                        {u.nama[0]?.toUpperCase() ?? "?"}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-semibold text-gray-900 truncate">{u.nama}</p>
                                                        <p className="text-[11px] text-gray-400 font-mono">#{u.id}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <p className="text-gray-600 text-xs truncate">{u.email}</p>
                                                {u.no_hp ? (
                                                    <span className="inline-flex items-center gap-1 text-[11px] text-gray-500 mt-0.5">
                                                        <Phone className="w-3 h-3 text-gray-400" />
                                                        {u.no_hp}
                                                    </span>
                                                ) : (
                                                    <span className="text-[11px] text-amber-600 mt-0.5 block">No. HP belum diisi</span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${roleBadge(u.role)}`}>
                                                    {u.role.replace("_", " ")}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                {u.jabatan ? (
                                                    <div className="flex items-center gap-2">
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-50 text-indigo-700 border border-indigo-200/50">
                                                            <BadgeCheck className="w-3 h-3" />
                                                            {u.jabatan}
                                                        </span>
                                                        {u.masa_jabatan && (
                                                            <span className="text-[10px] text-gray-400">{u.masa_jabatan}</span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-gray-300">—</span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={() => openJabatan(u)}
                                                        className="p-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                                                        title={u.jabatan ? "Ubah jabatan" : "Angkat jadi perangkat desa"}
                                                    >
                                                        <Landmark className="w-4 h-4" />
                                                    </button>
                                                    {u.pd_id && (
                                                        <button
                                                            onClick={() => setCopotTarget(u)}
                                                            className="p-2 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                                                            title="Copot jabatan (akun tetap ada)"
                                                        >
                                                            <BadgeCheck className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => openEdit(u)}
                                                        className="p-2 rounded-lg text-gray-400 hover:text-sky-600 hover:bg-sky-50 transition-colors cursor-pointer"
                                                        title="Edit akun"
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteTarget(u)}
                                                        className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                                        title="Hapus akun"
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

                    {/* Pagination */}
                    {!isLoading && users.length > 0 && (
                        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/40 flex items-center justify-between">
                            <span className="text-xs text-gray-400">
                                Menampilkan {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} dari {total} pengguna
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

            {/* ═══ Modal Tambah / Edit Akun ═══ */}
            {modalOpen && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => !submitting && setModalOpen(false)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 space-y-5 border border-gray-200 max-h-[90vh] overflow-y-auto">
                        <button onClick={() => !submitting && setModalOpen(false)} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-gray-100 transition cursor-pointer">
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
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Nama Lengkap *</label>
                                <input
                                    type="text"
                                    required
                                    value={fNama}
                                    onChange={(e) => setFNama(e.target.value)}
                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition"
                                    placeholder="Nama lengkap pengguna"
                                />
                            </div>

                            {formMode === "create" && (
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Email *</label>
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

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Nomor HP / WhatsApp *</label>
                                <input
                                    type="tel"
                                    required
                                    maxLength={20}
                                    value={fNoHp}
                                    onChange={(e) => setFNoHp(e.target.value)}
                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition"
                                    placeholder="08xxxxxxxxxx"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Role / Peran *</label>
                                <select
                                    value={fRole}
                                    onChange={(e) => setFRole(e.target.value)}
                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition cursor-pointer"
                                >
                                    {ROLE_OPTIONS.map((r) => (
                                        <option key={r.value} value={r.value}>{r.label}</option>
                                    ))}
                                </select>
                                <p className="text-[10px] text-gray-400 mt-1">
                                    Role menentukan hak akses ke dashboard. Jabatan di desa diatur terpisah lewat tombol <Landmark className="w-3 h-3 inline" />.
                                </p>
                            </div>

                            {formMode === "create" && (
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Password *</label>
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

            {/* ═══ Modal Jabatan Perangkat Desa ═══ */}
            {jabatanTarget && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => !savingJabatan && setJabatanTarget(null)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6 space-y-5 border border-gray-200 max-h-[90vh] overflow-y-auto">
                        <button onClick={() => !savingJabatan && setJabatanTarget(null)} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-gray-100 transition cursor-pointer">
                            <X className="w-4 h-4 text-gray-500" />
                        </button>

                        <div>
                            <h3 className="text-lg font-bold text-gray-900">
                                {jabatanTarget.pd_id ? "Ubah Jabatan" : "Angkat Jadi Perangkat Desa"}
                            </h3>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Untuk <strong>{jabatanTarget.nama}</strong>. Data ini yang tampil di halaman publik <em>Tentang Desa</em>.
                            </p>
                        </div>

                        <form onSubmit={handleSubmitJabatan} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Jabatan *</label>
                                <input
                                    type="text"
                                    required
                                    value={jJabatan}
                                    onChange={(e) => setJJabatan(e.target.value)}
                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition"
                                    placeholder="Contoh: Kepala Desa, Sekretaris Desa, Kaur Keuangan"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">NIP</label>
                                    <input
                                        type="text"
                                        value={jNip}
                                        onChange={(e) => setJNip(e.target.value)}
                                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition"
                                        placeholder="Nomor Induk Pegawai"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Pendidikan Terakhir</label>
                                    <select
                                        value={jPendidikan}
                                        onChange={(e) => setJPendidikan(e.target.value)}
                                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition cursor-pointer"
                                    >
                                        <option value="">— Pilih —</option>
                                        {PENDIDIKAN_OPTIONS.map((p) => (
                                            <option key={p} value={p}>{p}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Masa Jabatan</label>
                                <input
                                    type="text"
                                    value={jMasaJabatan}
                                    onChange={(e) => setJMasaJabatan(e.target.value)}
                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition"
                                    placeholder="Contoh: 2020 – 2026"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Foto Profil</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setJFile(e.target.files?.[0] || null)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                                />
                                {jFoto && !jFile && (
                                    <div className="mt-3 relative w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200 bg-gray-50">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={jFoto} alt="Preview" className="w-full h-full object-cover" />
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button type="button" onClick={() => setJabatanTarget(null)} disabled={savingJabatan} className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition cursor-pointer">
                                    Batal
                                </button>
                                <button type="submit" disabled={savingJabatan} className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-sm disabled:opacity-60 cursor-pointer">
                                    {savingJabatan && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {jabatanTarget.pd_id ? "Perbarui Jabatan" : "Angkat"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ═══ Konfirmasi Copot Jabatan ═══ */}
            {copotTarget && (
                <div className="fixed inset-0 z-[90] flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => !copoting && setCopotTarget(null)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 space-y-4 border border-gray-200">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-amber-50 rounded-xl"><AlertTriangle className="w-5 h-5 text-amber-600" /></div>
                            <div>
                                <h3 className="text-base font-bold text-gray-900">Copot Jabatan</h3>
                                <p className="text-xs text-gray-500">Akun penggunanya tetap ada.</p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-700">
                            Copot <strong>{copotTarget.nama}</strong> dari jabatan <strong>{copotTarget.jabatan}</strong>?
                            Dia akan hilang dari halaman publik <em>Tentang Desa</em>.
                        </p>
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setCopotTarget(null)} disabled={copoting} className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition cursor-pointer">
                                Batal
                            </button>
                            <button onClick={handleCopot} disabled={copoting} className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition shadow-sm disabled:opacity-60 cursor-pointer">
                                {copoting && <Loader2 className="w-4 h-4 animate-spin" />}
                                Copot
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ Konfirmasi Hapus Akun ═══ */}
            {deleteTarget && (
                <div className="fixed inset-0 z-[90] flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => !deleting && setDeleteTarget(null)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 space-y-4 border border-gray-200">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-red-50 rounded-xl"><AlertTriangle className="w-5 h-5 text-red-600" /></div>
                            <div>
                                <h3 className="text-base font-bold text-gray-900">Hapus User</h3>
                                <p className="text-xs text-gray-500">Tindakan ini tidak bisa dibatalkan.</p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-700">
                            Yakin ingin menghapus <strong>{deleteTarget.nama}</strong> ({deleteTarget.email})?
                        </p>
                        {deleteTarget.jabatan && (
                            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
                                Dia sedang menjabat sebagai <strong>{deleteTarget.jabatan}</strong>. Menghapus akunnya
                                otomatis mencopot jabatannya dari halaman publik.
                            </p>
                        )}
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
