import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { requireRole, ADMIN_ROLES } from '@/lib/auth';
import { hapusGambar, hapusGambarYangDilepas, kumpulkanGambar } from '@/lib/storage';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const session = await requireRole(ADMIN_ROLES);
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const pdId = parseInt(id);
    const body = await request.json();

    const noHp = typeof body.no_hp === 'string' ? body.no_hp.trim() : '';

    if (!body.nama || !noHp || !body.jabatan) {
      return NextResponse.json({ success: false, message: 'Nama, no. HP, dan jabatan wajib diisi' }, { status: 400 });
    }

    const userId = body.user_id ? Number(body.user_id) : null;
    if (userId !== null && (!Number.isInteger(userId) || userId <= 0)) {
      return NextResponse.json({ success: false, message: 'Akun yang dipilih tidak valid' }, { status: 400 });
    }

    const sebelum = await sql`SELECT foto FROM perangkat_desa WHERE id = ${pdId}`;

    const result = await sql`
      UPDATE perangkat_desa
      SET user_id = ${userId},
          nama = ${body.nama},
          no_hp = ${noHp},
          jabatan = ${body.jabatan},
          nip = ${body.nip || null},
          pendidikan_terakhir = ${body.pendidikan_terakhir || null},
          foto = ${body.foto || null},
          foto_fokus = ${body.foto_fokus || null},
          masa_jabatan = ${body.masa_jabatan || null}
      WHERE id = ${pdId}
      RETURNING id, user_id, nama, no_hp, jabatan, nip, pendidikan_terakhir, foto, foto_fokus, masa_jabatan
    `;

    if (result.length === 0) {
      return NextResponse.json({ success: false, message: 'Data tidak ditemukan' }, { status: 404 });
    }

    await hapusGambarYangDilepas([sebelum[0]?.foto as string], [body.foto]);

    return NextResponse.json({
      success: true,
      message: 'Perangkat desa berhasil diperbarui',
      data: result[0],
    }, { status: 200 });

  } catch (error) {
    console.error(error);
    if (error && typeof error === 'object' && 'code' in error && error.code === '23505') {
      return NextResponse.json({ success: false, message: 'Akun tersebut sudah terdaftar sebagai perangkat desa lain' }, { status: 409 });
    }
    return NextResponse.json({ success: false, message: 'Gagal mengubah data' }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const session = await requireRole(ADMIN_ROLES);
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const pdId = parseInt(id);

    const result = await sql`
      DELETE FROM perangkat_desa WHERE id = ${pdId}
      RETURNING id, jabatan, foto
    `;

    if (result.length === 0) {
      return NextResponse.json({ success: false, message: 'Data tidak ditemukan' }, { status: 404 });
    }

    await hapusGambar(kumpulkanGambar(result[0].foto as string));

    return NextResponse.json({
      success: true,
      message: 'Perangkat desa berhasil dihapus',
      data: { id: result[0].id, jabatan: result[0].jabatan },
    }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Gagal menghapus data' }, { status: 500 });
  }
}
