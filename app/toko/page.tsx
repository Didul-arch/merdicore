import { getServerSession } from "next-auth";
import Link from "next/link";
import { authOptions } from "../api/auth/[...nextauth]/route";
import sql from "@/lib/db";
import { ShoppingBag, ChevronRight } from "lucide-react";

interface UsahaSaya {
  id: number;
  nama_usaha: string;
  gambar: string | null;
}

export default async function TokoPage() {
  const session = await getServerSession(authOptions);
  const userId = Number(session?.user?.id);

  const usaha = await sql<UsahaSaya[]>`
    SELECT id, nama_usaha, gambar FROM umkm WHERE pemilik_id = ${userId} ORDER BY nama_usaha ASC
  `;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Usaha Saya</h1>
        <p className="text-sm text-gray-500 mt-1">Pilih usaha di bawah untuk mengubah informasinya.</p>
      </div>

      {usaha.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center space-y-2">
          <ShoppingBag className="w-10 h-10 text-gray-300 mx-auto" />
          <p className="text-sm font-semibold text-gray-700">Belum ada usaha yang terhubung ke akun Anda</p>
          <p className="text-xs text-gray-400">Silakan hubungi perangkat desa untuk mengaitkan usaha Anda ke akun ini.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {usaha.map((u) => (
            <Link
              key={u.id}
              href={`/toko/${u.id}`}
              className="flex items-center gap-4 bg-white rounded-2xl border border-gray-200 p-4 hover:border-teal-300 hover:shadow-sm transition-all"
            >
              {u.gambar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={u.gambar} alt="" className="w-16 h-16 rounded-xl object-cover border border-gray-100 shrink-0" />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
                  <ShoppingBag className="w-7 h-7 text-teal-300" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-base font-bold text-gray-900 truncate">{u.nama_usaha}</p>
                <p className="text-xs text-teal-600 font-semibold">Kelola informasi usaha</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300 shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
