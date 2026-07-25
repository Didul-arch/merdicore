import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import sql from "@/lib/db";

/**
 * GET handler that returns dashboard statistics.
 * Only accessible to authenticated users with allowed roles.
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  // @ts-ignore - role augmentation
  const userRole = (session.user as any).role as string;
  const allowedRoles = ["super_admin", "perangkat_desa"];
  if (!allowedRoles.includes(userRole)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const [resUsers, resBerita, resUmkm, resPesan, recent] = await Promise.all([
      sql`SELECT count(*)::int FROM users`,
      sql`SELECT count(*)::int FROM berita`,
      sql`SELECT count(*)::int FROM umkm`,
      sql`SELECT count(*)::int FROM pesan`,
      sql`SELECT id, nama, email, role, created_at FROM users ORDER BY id DESC LIMIT 5`,
    ]);

    return NextResponse.json({
      totalUsers: resUsers[0] ?? 0,
      totalBerita: resBerita[0]?.count ?? 0,
      totalUmkm: resUmkm[0]?.count ?? 0,
      totalPesan: resPesan[0]?.count ?? 0,
      recentUsers: recent,
    });
  } catch (err) {
    console.error("Dashboard summary error", err);
    return NextResponse.json({ error: "Failed to load stats" }, { status: 500 });
  }
}
