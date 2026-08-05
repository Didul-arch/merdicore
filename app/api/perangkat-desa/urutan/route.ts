import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { requireRole, ADMIN_ROLES } from '@/lib/auth';

export async function PUT(request: Request) {
  try {
    const session = await requireRole(ADMIN_ROLES);
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const ids: number[] | null = Array.isArray(body.ids) ? body.ids.map(Number).filter(Number.isFinite) : null;
    if (!ids || ids.length === 0) {
      return NextResponse.json({ success: false, message: 'Daftar urutan tidak valid' }, { status: 400 });
    }

    // Daftarnya pendek (perangkat desa satu kampung), loop per-baris jauh
    // lebih sederhana daripada nulis satu query UPDATE...FROM VALUES.
    await Promise.all(
      ids.map((id, index) => sql`UPDATE perangkat_desa SET urutan = ${index} WHERE id = ${id}`),
    );

    return NextResponse.json({ success: true, message: 'Urutan berhasil disimpan' }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Gagal menyimpan urutan' }, { status: 500 });
  }
}
