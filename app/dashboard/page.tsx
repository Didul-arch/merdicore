import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import sql from "@/lib/db";

import LogoutButton from "./LogoutButton";
import Link from "next/link";
import { Users, FileText, ShoppingBag, MessageSquare, ShieldAlert, ShieldCheck } from "lucide-react";

interface RecentPesan {
  id: number;
  nama_pengirim: string;
  email: string;
  isi_pesan: string;
  status: string;
  created_at: string;
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  // 1. Cek Autentikasi
  if (!session || !session.user) {
    redirect("/login");
  }

  const userRole = session?.user.role || "perangkat_desa";
  const allowedRoles = ["super_admin", "perangkat_desa"];

  // 2. Cek Otorisasi (Role)
  if (!allowedRoles.includes(userRole)) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 text-center">
        <div className="bg-slate-800 p-8 rounded-3xl max-w-md border border-slate-700 space-y-4">
          <div className="w-16 h-16 bg-red-500/10 text-red-400 rounded-2xl flex items-center justify-center mx-auto border border-red-500/20">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white">Akses Ditolak</h2>
          <p className="text-xs text-gray-400 leading-relaxed">
            Akun Anda (<strong>{session.user.email}</strong>) terdaftar dengan role
            <span className="px-2 py-0.5 ml-1 bg-amber-500/10 text-amber-400 rounded font-mono text-[10px] uppercase font-bold">{userRole}</span>.
            Hanya <strong>super_admin</strong> dan <strong>perangkat_desa</strong> yang diizinkan mengakses Dashboard Admin.
          </p>
          <div className="pt-4 border-t border-slate-700/50 flex justify-center gap-3">
            <Link
              href="/"
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-semibold transition-all"
            >
              Kembali ke Beranda
            </Link>
            <LogoutButton />
          </div>
        </div>
      </div>
    );
  }

  // 3. Ambil Statistik Dashboard Langsung dari DB
  let stats = {
    totalUsers: 0,
    totalBerita: 0,
    totalUmkm: 0,
    totalPesan: 0,
    recentPesan: [] as RecentPesan[],
  };

  try {
    const [resUsers, resBerita, resUmkm, resPesan, recent] = await Promise.all([
      sql`SELECT count(*)::int FROM users`,
      sql`SELECT count(*)::int FROM berita`,
      sql`SELECT count(*)::int FROM umkm`,
      sql`SELECT count(*)::int FROM pesan`,
      sql`SELECT id, nama_pengirim, email, isi_pesan, status, created_at FROM pesan ORDER BY id DESC LIMIT 5`,
    ]);

    stats = {
      totalUsers: resUsers[0].count ?? 0,
      totalBerita: resBerita[0]?.count ?? 0,
      totalUmkm: resUmkm[0]?.count ?? 0,
      totalPesan: resPesan[0]?.count ?? 0,
      recentPesan: recent as unknown as RecentPesan[],
    };
  } catch (err) {
    console.error("Failed to load dashboard stats", err);
  }

  const {
    totalUsers,
    totalBerita,
    totalUmkm,
    totalPesan,
    recentPesan,
  } = stats;

  return (
    <main className="p-6 md:p-10 space-y-8">
      {/* Top Bar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 bg-teal-50 text-teal-700 rounded-md text-[10px] font-extrabold uppercase tracking-wider border border-teal-200/50">
              PORTAL ADMINISTRASI
            </span>
            <span className="text-xs text-gray-400 font-medium">• Selamat Datang</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mt-1">
            Dashboard {userRole === "super_admin" ? "Super Admin" : "Perangkat Desa"}
          </h2>
        </div>
      </div>

      {/* Informational Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg border border-teal-900/30">
        <div className="relative z-10 space-y-2 max-w-2xl">
          <div className="flex items-center space-x-2 text-teal-400 text-xs font-bold uppercase tracking-widest">
            <ShieldCheck className="w-4 h-4" />
            <span>Sistem Terverifikasi</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold">
            Halo, {session.user.name}! Anda terautentikasi sebagai <span className="text-teal-300 capitalize">{userRole.replace("_", " ")}</span>.
          </h3>
          <p className="text-xs text-gray-300 font-light leading-relaxed">
            Gunakan dashboard ini untuk mengontrol informasi desa, menambah pengguna baru, serta memantau aspirasi warga secara real-time.
          </p>
        </div>
      </div>

      {/* Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Metric 1 */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-3 flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total User</span>
            <div className="p-2.5 bg-sky-50 text-sky-600 rounded-2xl"><Users className="w-5 h-5" /></div>
          </div>
          <div>
            <span className="text-3xl font-extrabold text-gray-900">{totalUsers}</span>
            <span className="block text-[10px] text-gray-400 font-light mt-1">Pengguna Terdaftar</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-3 flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Berita Desa</span>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl"><FileText className="w-5 h-5" /></div>
          </div>
          <div>
            <span className="text-3xl font-extrabold text-gray-900">{totalBerita}</span>
            <span className="block text-[10px] text-gray-400 font-light mt-1">Artikel Terpublikasi</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-3 flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Produk UMKM</span>
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-2xl"><ShoppingBag className="w-5 h-5" /></div>
          </div>
          <div>
            <span className="text-3xl font-extrabold text-gray-900">{totalUmkm}</span>
            <span className="block text-[10px] text-gray-400 font-light mt-1">Mitra Usaha Lokal</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-3 flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Pesan Aspirasi</span>
            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-2xl"><MessageSquare className="w-5 h-5" /></div>
          </div>
          <div>
            <span className="text-3xl font-extrabold text-gray-900">{totalPesan}</span>
            <span className="block text-[10px] text-gray-400 font-light mt-1">Masukan dari Warga</span>
          </div>
        </div>
      </div>

      {/* Recent Messages Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
        <div className="flex justify-between items-center pb-4 border-b border-gray-100">
          <div>
            <h4 className="font-extrabold text-gray-900 text-base">Pesan Warga Terbaru</h4>
            <p className="text-xs text-gray-400 font-light">Pesan terbaru dari warga.</p>
          </div>
        </div>

        {recentPesan && recentPesan.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] uppercase font-extrabold text-gray-400 tracking-wider border-b border-gray-100">
                  <th className="pb-3 px-2">Tanggal</th>
                  <th className="pb-3 px-2">Pengirim</th>
                  <th className="pb-3 px-2">Pesan</th>
                  <th className="pb-3 px-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-xs">
                {recentPesan.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-2 text-gray-400 font-mono">
                      {new Date(p.created_at).toLocaleDateString('id-ID')}
                    </td>
                    <td className="py-3 px-2">
                      <p className="font-bold text-gray-900">{p.nama_pengirim}</p>
                      {p.email && <p className="text-gray-500 font-light text-[10px]">{p.email}</p>}
                    </td>
                    <td className="py-3 px-2 text-gray-600 font-light">
                      <p className="line-clamp-2 max-w-xs">{p.isi_pesan}</p>
                    </td>
                    <td className="py-3 px-2 text-right">
                      <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase ${p.status === 'sudah_dibaca' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/40' :
                        'bg-amber-50 text-amber-700 border border-amber-200/40'
                        }`}>
                        {p.status === 'sudah_dibaca' ? 'Sudah Dibaca' : 'Belum Dibaca'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-10 text-xs text-gray-400 font-light">
            Belum ada pesan dari warga.
          </div>
        )}
      </div>
    </main>
  );
}
