import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

interface RouteContext {
  params: Promise<{ id: string }>;
}

async function checkAdmin() {
  const session = await getServerSession(authOptions);
  // @ts-ignore
  const role = session?.user?.role;
  if (!session || !['super_admin', 'perangkat_desa'].includes(role)) {
    return false;
  }
  return true;
}

// GET: Ambil satu lembaga
export async function GET(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const lembagaId = parseInt(id);

    const rows = await sql`
      SELECT *
      FROM lembaga
      WHERE id = ${lembagaId}
    `;

    if (rows.length === 0) {
      return NextResponse.json({ success: false, message: 'Data tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: rows[0] }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Gagal mengambil data' }, { status: 500 });
  }
}

// PUT: Update lembaga
export async function PUT(request: Request, context: RouteContext) {
  try {
    const isAuthorized = await checkAdmin();
    if (!isAuthorized) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const lembagaId = parseInt(id);
    const body = await request.json();

    if (!body.nama_lengkap) {
      return NextResponse.json({ success: false, message: 'Nama lengkap wajib diisi' }, { status: 400 });
    }

    const result = await sql`
      UPDATE lembaga
      SET nama_lengkap = ${body.nama_lengkap},
          singkatan = ${body.singkatan || null},
          nama_ketua = ${body.nama_ketua || null},
          jumlah_anggota = ${body.jumlah_anggota || 0},
          deskripsi = ${body.deskripsi || null},
          gambar = ${body.gambar || null}
      WHERE id = ${lembagaId}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json({ success: false, message: 'Data tidak ditemukan' }, { status: 404 });
    }

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

// DELETE: Hapus lembaga
export async function DELETE(request: Request, context: RouteContext) {
  try {
    const isAuthorized = await checkAdmin();
    if (!isAuthorized) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const lembagaId = parseInt(id);

    const result = await sql`DELETE FROM lembaga WHERE id = ${lembagaId} RETURNING id, nama_lengkap`;

    if (result.length === 0) {
      return NextResponse.json({ success: false, message: 'Data tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Lembaga berhasil dihapus',
      data: result[0],
    }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Gagal menghapus data' }, { status: 500 });
  }
}
