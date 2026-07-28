import { NextResponse } from "next/server";
import { requireRole, ADMIN_ROLES } from "@/lib/auth";
import sql from "@/lib/db";

/**
 * GET handler that returns dashboard statistics.
 * Only accessible to authenticated users with allowed roles.
 */
export async function GET() {
  const session = await requireRole(ADMIN_ROLES);
  if (!session) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
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
