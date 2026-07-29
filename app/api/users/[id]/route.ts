import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { requireRole } from '@/lib/auth';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// PUT: Update data user (nama, role)
export async function PUT(request: Request, context: RouteContext) {
  try {
    const session = await requireRole(['super_admin']);
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const userId = parseInt(id);
    const body = await request.json();

    if (!body.nama || !body.role) {
      return NextResponse.json({ success: false, message: 'Data tidak lengkap (nama dan role wajib diisi)' }, { status: 400 });
    }

    const result = await sql`
      UPDATE users 
      SET nama = ${body.nama}, role = ${body.role} 
      WHERE id = ${userId}
      RETURNING id, nama, email, role, created_at
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

// DELETE: Hapus user berdasarkan ID
export async function DELETE(request: Request, context: RouteContext) {
  try {
    const session = await requireRole(['super_admin']);
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const userId = parseInt(id);

    const result = await sql`DELETE FROM users WHERE id = ${userId} RETURNING id, nama, email, role`;

    if (result.length === 0) {
      return NextResponse.json({ success: false, message: 'User tidak ditemukan' }, { status: 404 });
    }

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
