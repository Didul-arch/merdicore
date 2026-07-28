import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { requireRole, ADMIN_ROLES } from '@/lib/auth';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET: Ambil satu perangkat desa
export async function GET(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const pdId = parseInt(id);

    const rows = await sql`
      SELECT pd.*, u.nama AS nama_user, u.email AS email_user
      FROM perangkat_desa pd
      LEFT JOIN users u ON pd.user_id = u.id
      WHERE pd.id = ${pdId}
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

// PUT: Update perangkat desa
export async function PUT(request: Request, context: RouteContext) {
  try {
    const session = await requireRole(ADMIN_ROLES);
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const pdId = parseInt(id);
    const body = await request.json();

    if (!body.jabatan) {
      return NextResponse.json({ success: false, message: 'Jabatan wajib diisi' }, { status: 400 });
    }

    const result = await sql`
      UPDATE perangkat_desa
      SET jabatan = ${body.jabatan},
          nip = ${body.nip || null},
          pendidikan_terakhir = ${body.pendidikan_terakhir || null},
          foto = ${body.foto || null},
          masa_jabatan = ${body.masa_jabatan || null}
      WHERE id = ${pdId}
      RETURNING id, user_id, jabatan, nip, pendidikan_terakhir, foto, masa_jabatan
    `;

    if (result.length === 0) {
      return NextResponse.json({ success: false, message: 'Data tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Perangkat desa berhasil diperbarui',
      data: result[0],
    }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Gagal mengubah data' }, { status: 500 });
  }
}

// DELETE: Hapus perangkat desa
export async function DELETE(request: Request, context: RouteContext) {
  try {
    const session = await requireRole(ADMIN_ROLES);
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const pdId = parseInt(id);

    const result = await sql`DELETE FROM perangkat_desa WHERE id = ${pdId} RETURNING id, jabatan`;

    if (result.length === 0) {
      return NextResponse.json({ success: false, message: 'Data tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Perangkat desa berhasil dihapus',
      data: result[0],
    }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Gagal menghapus data' }, { status: 500 });
  }
}
