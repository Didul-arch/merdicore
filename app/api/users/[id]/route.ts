import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
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

    // password kosong = tidak diubah
    const passwordBaru = typeof body.password === 'string' ? body.password.trim() : '';
    if (passwordBaru && passwordBaru.length < 6) {
      return NextResponse.json({ success: false, message: 'Password baru minimal 6 karakter' }, { status: 400 });
    }

    const result = passwordBaru
      ? await sql`
          UPDATE users
          SET nama = ${body.nama}, role = ${body.role}, no_hp = ${noHp}, password_hash = ${await bcrypt.hash(passwordBaru, 10)}
          WHERE id = ${userId}
          RETURNING id, nama, email, role, no_hp, created_at
        `
      : await sql`
          UPDATE users
          SET nama = ${body.nama}, role = ${body.role}, no_hp = ${noHp}
          WHERE id = ${userId}
          RETURNING id, nama, email, role, no_hp, created_at
        `;

    if (result.length === 0) {
      return NextResponse.json({ success: false, message: 'User tidak ditemukan' }, { status: 404 });
    }

    // umkm_ids kalau dikirim (dari form edit user) menggantikan SELURUH
    // kepemilikan user ini: lepas dulu semua UMKM yang sekarang jadi
    // miliknya, baru pasang ulang ke id yang dipilih. DB jadi sumber
    // kebenaran, gak perlu hitung selisih di sisi client.
    if (Array.isArray(body.umkm_ids)) {
      const umkmIds = body.umkm_ids.map(Number).filter(Number.isFinite);
      await sql`UPDATE umkm SET pemilik_id = NULL WHERE pemilik_id = ${userId}`;
      if (umkmIds.length > 0) {
        await sql`UPDATE umkm SET pemilik_id = ${userId} WHERE id = ANY(${umkmIds})`;
      }
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

    // umkm.pemilik_id masih ON DELETE CASCADE -> baris UMKM ikut terhapus.
    // perangkat_desa.user_id sekarang ON DELETE SET NULL -> datanya TETAP ada
    // (cuma kaitan akunnya lepas), jadi fotonya JANGAN ikut dihapus.
    const um = await sql`SELECT gambar, galeri_foto FROM umkm WHERE pemilik_id = ${userId}`;

    const result = await sql`DELETE FROM users WHERE id = ${userId} RETURNING id, nama, email, role`;

    if (result.length === 0) {
      return NextResponse.json({ success: false, message: 'User tidak ditemukan' }, { status: 404 });
    }

    await hapusGambar(
      kumpulkanGambar(...um.flatMap((r) => [r.gambar as string, r.galeri_foto as string[]])),
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
