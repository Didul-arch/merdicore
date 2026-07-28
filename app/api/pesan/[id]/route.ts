import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { requireRole, ADMIN_ROLES } from '@/lib/auth';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET: Ambil satu pesan (Admin Only)
export async function GET(request: Request, context: RouteContext) {
  try {
    const session = await requireRole(ADMIN_ROLES);
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const pesanId = parseInt(id);

    const rows = await sql`
      SELECT *
      FROM pesan
      WHERE id = ${pesanId}
    `;

    if (rows.length === 0) {
      return NextResponse.json({ success: false, message: 'Pesan tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: rows[0] }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Gagal mengambil data' }, { status: 500 });
  }
}

// PUT: Update status pesan (Admin Only)
export async function PUT(request: Request, context: RouteContext) {
  try {
    const session = await requireRole(ADMIN_ROLES);
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const pesanId = parseInt(id);
    const body = await request.json();

    if (!body.status || !['belum_dibaca', 'sudah_dibaca'].includes(body.status)) {
      return NextResponse.json({ success: false, message: 'Status tidak valid' }, { status: 400 });
    }

    const result = await sql`
      UPDATE pesan
      SET status = ${body.status}
      WHERE id = ${pesanId}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json({ success: false, message: 'Pesan tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Status pesan berhasil diperbarui',
      data: result[0],
    }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Gagal mengubah status' }, { status: 500 });
  }
}

// DELETE: Hapus pesan (Admin Only)
export async function DELETE(request: Request, context: RouteContext) {
  try {
    const session = await requireRole(ADMIN_ROLES);
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const pesanId = parseInt(id);

    const result = await sql`DELETE FROM pesan WHERE id = ${pesanId} RETURNING id`;

    if (result.length === 0) {
      return NextResponse.json({ success: false, message: 'Pesan tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Pesan berhasil dihapus',
    }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Gagal menghapus pesan' }, { status: 500 });
  }
}
