import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { requireRole } from '@/lib/auth';
import { hapusGambar, kumpulkanGambar } from '@/lib/storage';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const session = await requireRole(['super_admin']);
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const userId = parseInt(id);
    const body = await request.json();

    const noHp = typeof body.no_hp === 'string' ? body.no_hp.trim() : '';

    if (!body.nama || !body.role || !noHp) {
      return NextResponse.json({ success: false, message: 'Data tidak lengkap (nama, no. HP, dan role wajib diisi)' }, { status: 400 });
    }
    if (noHp.length > 20) {
      return NextResponse.json({ success: false, message: 'Nomor HP maksimal 20 karakter' }, { status: 400 });
    }

    const result = await sql`
      UPDATE users
      SET nama = ${body.nama}, role = ${body.role}, no_hp = ${noHp}
      WHERE id = ${userId}
      RETURNING id, nama, email, role, no_hp, created_at
    `;

    if (result.length === 0) {
      return NextResponse.json({ success: false, message: 'User tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'User berhasil diubah',
      data: result[0]
    }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Gagal mengubah data' }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const session = await requireRole(['super_admin']);
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const userId = parseInt(id);

    // perangkat_desa.user_id dan umkm.pemilik_id dua-duanya ON DELETE CASCADE,
    // jadi menghapus user diam-diam ikut menghapus baris di kedua tabel itu.
    // Fotonya dikumpulkan DULU selagi barisnya masih ada.
    const [pd, um] = await Promise.all([
      sql`SELECT foto FROM perangkat_desa WHERE user_id = ${userId}`,
      sql`SELECT gambar, galeri_foto FROM umkm WHERE pemilik_id = ${userId}`,
    ]);

    const result = await sql`DELETE FROM users WHERE id = ${userId} RETURNING id, nama, email, role`;

    if (result.length === 0) {
      return NextResponse.json({ success: false, message: 'User tidak ditemukan' }, { status: 404 });
    }

    await hapusGambar(
      kumpulkanGambar(
        ...pd.map((r) => r.foto as string),
        ...um.flatMap((r) => [r.gambar as string, r.galeri_foto as string[]]),
      ),
    );

    return NextResponse.json({
      success: true,
      message: 'User berhasil dihapus',
      data: result[0]
    }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Gagal menghapus data' }, { status: 500 });
  }
}
