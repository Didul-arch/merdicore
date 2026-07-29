import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { requireRole, ADMIN_ROLES } from '@/lib/auth';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// PUT: Update UMKM
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

    const result = await sql`
      UPDATE umkm
      SET nama_usaha = ${body.nama_usaha},
          deskripsi = ${body.deskripsi || null},
          no_whatsapp = ${body.no_whatsapp || null},
          alamat = ${body.alamat || null},
          gambar = ${body.gambar || null},
          galeri_foto = ${body.galeri_foto || []}
      WHERE id = ${umkmId}
      RETURNING id, nama_usaha, deskripsi, no_whatsapp, alamat, gambar, galeri_foto, created_at
    `;

    if (result.length === 0) {
      return NextResponse.json({ success: false, message: 'UMKM tidak ditemukan' }, { status: 404 });
    }

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

// DELETE: Hapus UMKM
export async function DELETE(request: Request, context: RouteContext) {
  try {
    const session = await requireRole(ADMIN_ROLES);
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const umkmId = parseInt(id);

    const result = await sql`DELETE FROM umkm WHERE id = ${umkmId} RETURNING id, nama_usaha`;

    if (result.length === 0) {
      return NextResponse.json({ success: false, message: 'UMKM tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'UMKM berhasil dihapus',
      data: result[0],
    }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Gagal menghapus data UMKM' }, { status: 500 });
  }
}
