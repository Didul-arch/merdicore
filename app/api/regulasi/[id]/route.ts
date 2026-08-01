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
    const rows = await sql`SELECT * FROM regulasi WHERE id = ${parseInt(id)}`;

    if (rows.length === 0) {
      return NextResponse.json({ success: false, message: 'Data tidak ditemukan' }, { status: 404 });
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
    const regulasiId = parseInt(id);
    const body = await request.json();

    if (!body.judul) {
      return NextResponse.json({ success: false, message: 'Judul wajib diisi' }, { status: 400 });
    }
    if (body.jenis !== 'peraturan' && body.jenis !== 'surat') {
      return NextResponse.json({ success: false, message: 'Jenis harus peraturan atau surat' }, { status: 400 });
    }

    const isPeraturan = body.jenis === 'peraturan';
    const deskripsiBersih = bersihkanHtml(body.deskripsi || '');
    const deskripsi = adaIsinya(deskripsiBersih) ? deskripsiBersih : null;

    const sebelum = await sql`SELECT file_url, deskripsi FROM regulasi WHERE id = ${regulasiId}`;

    const result = await sql`
      UPDATE regulasi
      SET jenis = ${body.jenis},
          judul = ${body.judul},
          nomor = ${isPeraturan ? (body.nomor || null) : null},
          tahun = ${isPeraturan ? (body.tahun || null) : null},
          kategori = ${isPeraturan ? (body.kategori || null) : null},
          status = ${isPeraturan ? (body.status || null) : null},
          deskripsi = ${deskripsi},
          file_url = ${body.file_url || null}
      WHERE id = ${regulasiId}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json({ success: false, message: 'Data tidak ditemukan' }, { status: 404 });
    }

    await hapusGambarYangDilepas(
      [sebelum[0]?.file_url as string, sebelum[0]?.deskripsi as string],
      [body.file_url, deskripsi],
    );

    return NextResponse.json({
      success: true,
      message: 'Regulasi berhasil diperbarui',
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
    const regulasiId = parseInt(id);

    const result = await sql`
      DELETE FROM regulasi WHERE id = ${regulasiId}
      RETURNING id, judul, file_url, deskripsi
    `;

    if (result.length === 0) {
      return NextResponse.json({ success: false, message: 'Data tidak ditemukan' }, { status: 404 });
    }

    await hapusGambar(kumpulkanGambar(result[0].file_url as string, result[0].deskripsi as string));

    return NextResponse.json({
      success: true,
      message: 'Regulasi berhasil dihapus',
      data: { id: result[0].id, judul: result[0].judul },
    }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Gagal menghapus data' }, { status: 500 });
  }
}
