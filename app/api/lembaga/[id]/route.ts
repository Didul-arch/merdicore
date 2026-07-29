import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { requireRole, ADMIN_ROLES } from '@/lib/auth';
import { hapusGambar, hapusGambarYangDilepas, kumpulkanGambar } from '@/lib/storage';
import { bersihkanHtml } from '@/lib/sanitize';
import { adaIsinya } from '@/lib/utils';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const session = await requireRole(ADMIN_ROLES);
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const rows = await sql`SELECT * FROM lembaga WHERE id = ${parseInt(id)}`;

    if (rows.length === 0) {
      return NextResponse.json({ success: false, message: 'Lembaga tidak ditemukan' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: rows[0] }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Gagal mengambil data' }, { status: 500 });
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const session = await requireRole(ADMIN_ROLES);
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const lembagaId = parseInt(id);
    const body = await request.json();

    const deskripsiBersih = bersihkanHtml(body.deskripsi || '');
    const deskripsi = adaIsinya(deskripsiBersih) ? deskripsiBersih : null;

    if (!body.nama_lengkap) {
      return NextResponse.json({ success: false, message: 'Nama lengkap wajib diisi' }, { status: 400 });
    }

    const sebelum = await sql`SELECT gambar, deskripsi FROM lembaga WHERE id = ${lembagaId}`;

    const result = await sql`
      UPDATE lembaga
      SET nama_lengkap = ${body.nama_lengkap},
          singkatan = ${body.singkatan || null},
          nama_ketua = ${body.nama_ketua || null},
          jumlah_anggota = ${body.jumlah_anggota || 0},
          deskripsi = ${deskripsi},
          gambar = ${body.gambar || null}
      WHERE id = ${lembagaId}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json({ success: false, message: 'Data tidak ditemukan' }, { status: 404 });
    }

    await hapusGambarYangDilepas(
      [sebelum[0]?.gambar as string, sebelum[0]?.deskripsi as string],
      [body.gambar, deskripsi],
    );

    return NextResponse.json({
      success: true,
      message: 'Lembaga berhasil diperbarui',
      data: result[0],
    }, { status: 200 });

  } catch (error) {
    console.error(error);
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
    const lembagaId = parseInt(id);

    const result = await sql`
      DELETE FROM lembaga WHERE id = ${lembagaId}
      RETURNING id, nama_lengkap, gambar, deskripsi
    `;

    if (result.length === 0) {
      return NextResponse.json({ success: false, message: 'Data tidak ditemukan' }, { status: 404 });
    }

    await hapusGambar(kumpulkanGambar(result[0].gambar as string, result[0].deskripsi as string));

    return NextResponse.json({
      success: true,
      message: 'Lembaga berhasil dihapus',
      data: { id: result[0].id, nama_lengkap: result[0].nama_lengkap },
    }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Gagal menghapus data' }, { status: 500 });
  }
}
