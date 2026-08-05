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
} from "lucide-react";
import Toast from "@/components/dashboard/Toast";
import fetcher from "@/lib/swr-fetcher";

interface User {
    id: number;
    nama: string;
    email: string;
    role: string;
    no_hp: string | null;
    created_at: string;
}

interface UmkmRingkas {
    id: number;
    nama_usaha: string;
    pemilik_id: number | null;
}

type FormMode = "create" | "edit";

const ROLE_OPTIONS = [
    { value: "super_admin", label: "Super Admin" },
    { value: "perangkat_desa", label: "Perangkat Desa" },
    { value: "pemilik_umkm", label: "Pemilik UMKM" },
];

function roleBadge(role: string) {
    const map: Record<string, string> = {
        super_admin: "bg-red-50 text-red-700 border-red-200/50",
        perangkat_desa: "bg-teal-50 text-teal-700 border-teal-200/50",
        pemilik_umkm: "bg-amber-50 text-amber-700 border-amber-200/50",
    };
    return map[role] ?? "bg-slate-100 text-slate-700 border-slate-200/50";
}

export default function UsersManagementPage() {
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [page, setPage] = useState(1);
    const LIMIT = 10;

    const [modalOpen, setModalOpen] = useState(false);
    const [formMode, setFormMode] = useState<FormMode>("create");
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [fNama, setFNama] = useState("");
    const [fEmail, setFEmail] = useState("");
    const [fNoHp, setFNoHp] = useState("");
    const [fRole, setFRole] = useState("perangkat_desa");
    const [fPassword, setFPassword] = useState("");
    const [fUmkmIds, setFUmkmIds] = useState<number[]>([]);

    const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
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

    const { data, isLoading, mutate } = useSWR(`/api/users?${params}`, fetcher);
    const users: User[] = data?.data ?? [];
    const total = data?.pagination?.total ?? 0;
    const totalPages = data?.pagination?.totalPages ?? 1;

    // Buat pilihan "UMKM mana yang dimiliki" di form edit. limit=100 cukup
    // untuk skala desa — daftar UMKM gak akan ratusan.
    const { data: umkmData, mutate: mutateUmkm } = useSWR(`/api/umkm?limit=100`, fetcher);
    const umkmList: UmkmRingkas[] = umkmData?.data ?? [];

    function openCreate() {
        setFormMode("create");
        setEditingUser(null);
        setFNama("");
        setFEmail("");
        setFNoHp("");
        setFRole("perangkat_desa");
        setFPassword("");
        setFUmkmIds([]);
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
        setFUmkmIds(umkmList.filter((u) => u.pemilik_id === user.id).map((u) => u.id));
        setModalOpen(true);
    }

    function toggleUmkm(id: number) {
        setFUmkmIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
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
                    body: JSON.stringify({
                        nama: fNama, no_hp: fNoHp, role: fRole, password: fPassword,
                        // Role selain pemilik_umkm gak boleh nyangkut kepemilikan UMKM.
                        umkm_ids: fRole === "pemilik_umkm" ? fUmkmIds : [],
                    }),
                });
                const json = await res.json();
                if (!res.ok) throw new Error(json.message || "Gagal mengubah user");
                setToast({ message: "User berhasil diperbarui!", type: "success" });
                mutateUmkm();
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

    return (
        <>
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <main className="p-6 md:p-10 space-y-6">
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
                            Akun login ke dashboard. Data perangkat desa yang tampil di halaman publik dikelola terpisah di menu <em>Perangkat Desa</em>.
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
                                                <div className="flex items-center justify-end gap-1">
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
                                    Role menentukan hak akses ke dashboard. Kalau orang ini juga perlu tampil sebagai
                                    perangkat desa di halaman publik, kaitkan lewat menu <em>Perangkat Desa</em>.
                                </p>
                            </div>

                            {formMode === "edit" && fRole === "pemilik_umkm" && (
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">UMKM yang Dimiliki</label>
                                    <div className="border border-gray-200 rounded-xl max-h-40 overflow-y-auto divide-y divide-gray-100">
                                        {umkmList.length === 0 ? (
                                            <p className="text-xs text-gray-400 px-3 py-3">Belum ada UMKM terdaftar.</p>
                                        ) : (
                                            umkmList.map((u) => (
                                                <label key={u.id} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={fUmkmIds.includes(u.id)}
                                                        onChange={() => toggleUmkm(u.id)}
                                                        className="rounded border-gray-300 text-teal-600 focus:ring-teal-500/30 cursor-pointer"
                                                    />
                                                    <span className="truncate">{u.nama_usaha}</span>
                                                    {u.pemilik_id != null && u.pemilik_id !== editingUser?.id && (
                                                        <span className="text-[10px] text-amber-600 ml-auto shrink-0">sudah ada pemilik lain</span>
                                                    )}
                                                </label>
                                            ))
                                        )}
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-1">
                                        Centang UMKM yang jadi milik user ini. Mencentang yang sudah dimiliki user lain akan memindahkan kepemilikannya ke sini.
                                    </p>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Password {formMode === "create" ? "*" : ""}
                                </label>
                                <input
                                    type="password"
                                    required={formMode === "create"}
                                    minLength={6}
                                    value={fPassword}
                                    onChange={(e) => setFPassword(e.target.value)}
                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition"
                                    placeholder={formMode === "create" ? "Minimal 6 karakter" : "Kosongkan jika tidak diganti"}
                                />
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
                        <p className="text-xs text-sky-700 bg-sky-50 border border-sky-100 rounded-xl px-3 py-2">
                            Kalau akun ini dikaitkan ke data perangkat desa, kaitannya cuma dilepas —
                            datanya tetap tampil di halaman publik, cuma tidak bisa login lagi.
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
