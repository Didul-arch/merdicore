import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { requireRole, ADMIN_ROLES } from '@/lib/auth';
import { hapusGambar, hapusGambarYangDilepas, kumpulkanGambar } from '@/lib/storage';

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
    const rows = await sql`
      SELECT um.id, um.nama_usaha, um.deskripsi, um.no_whatsapp, um.alamat,
             um.gambar, um.gambar_fokus, um.galeri_foto, um.created_at, u.nama AS pemilik_nama
      FROM umkm um
      LEFT JOIN users u ON um.pemilik_id = u.id
      WHERE um.id = ${parseInt(id)}
    `;

    if (rows.length === 0) {
      return NextResponse.json({ success: false, message: 'UMKM tidak ditemukan' }, { status: 404 });
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
    const umkmId = parseInt(id);
    const body = await request.json();

    if (!body.nama_usaha) {
      return NextResponse.json({ success: false, message: 'Nama usaha wajib diisi' }, { status: 400 });
    }

    const sebelum = await sql`SELECT gambar, galeri_foto FROM umkm WHERE id = ${umkmId}`;

    const result = await sql`
      UPDATE umkm
      SET nama_usaha = ${body.nama_usaha},
          deskripsi = ${body.deskripsi || null},
          no_whatsapp = ${body.no_whatsapp || null},
          alamat = ${body.alamat || null},
          gambar = ${body.gambar || null},
          gambar_fokus = ${body.gambar_fokus || null},
          galeri_foto = ${body.galeri_foto || []}
      WHERE id = ${umkmId}
      RETURNING id, nama_usaha, deskripsi, no_whatsapp, alamat, gambar, gambar_fokus, galeri_foto, created_at
    `;

    if (result.length === 0) {
      return NextResponse.json({ success: false, message: 'UMKM tidak ditemukan' }, { status: 404 });
    }

    // Gambar utama yang diganti + foto galeri yang dibuang, ikut dihapus.
    await hapusGambarYangDilepas(
      [sebelum[0]?.gambar as string, sebelum[0]?.galeri_foto as string[]],
      [body.gambar, body.galeri_foto],
    );

    return NextResponse.json({
      success: true,
      message: 'UMKM berhasil diperbarui',
      data: result[0],
    }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Gagal mengubah data UMKM' }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const session = await requireRole(ADMIN_ROLES);
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const umkmId = parseInt(id);

    const result = await sql`
      DELETE FROM umkm WHERE id = ${umkmId}
      RETURNING id, nama_usaha, gambar, galeri_foto
    `;

    if (result.length === 0) {
      return NextResponse.json({ success: false, message: 'UMKM tidak ditemukan' }, { status: 404 });
    }

    await hapusGambar(kumpulkanGambar(result[0].gambar as string, result[0].galeri_foto as string[]));

    return NextResponse.json({
      success: true,
      message: 'UMKM berhasil dihapus',
      data: { id: result[0].id, nama_usaha: result[0].nama_usaha },
    }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Gagal menghapus data UMKM' }, { status: 500 });
  }
}
